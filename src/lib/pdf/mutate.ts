import {
  PDFDocument,
  StandardFonts,
  rgb,
  degrees,
  type PDFPage,
  type PDFFont,
} from "@cantoo/pdf-lib";
import type { Annotation } from "@/lib/types";
import { dataUrlToBytes } from "@/lib/utils";
import { rasterizePage, paintTextOnRaster } from "./engine";

export interface MutateInput {
  bytes: Uint8Array;
  pageOrder: number[];
  rotations: Record<number, number>;
  annotations: Annotation[];
  userPassword?: string;
  ownerPassword?: string;
  openPassword?: string;
}

function pdfBox(page: PDFPage, a: Annotation) {
  const { width, height } = page.getSize();
  return {
    x: a.x * width,
    y: height - (a.y + a.h) * height,
    w: a.w * width,
    h: a.h * height,
  };
}

function wrapFont(font: PDFFont, text: string, size: number, max: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(next, size) > max && cur) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

async function drawMarks(
  page: PDFPage,
  list: Annotation[],
  out: PDFDocument,
  helv: PDFFont,
  helvBold: PDFFont,
  skipRedact: boolean,
) {
  for (const a of list) {
    const box = pdfBox(page, a);
    if (a.type === "redact") {
      if (skipRedact) continue;
      page.drawRectangle({
        x: box.x,
        y: box.y,
        width: box.w,
        height: box.h,
        color: rgb(0, 0, 0),
      });
    } else if (a.type === "highlight") {
      page.drawRectangle({
        x: box.x,
        y: box.y,
        width: box.w,
        height: box.h,
        color: rgb(0.91, 0.79, 0.41),
        opacity: 0.38,
      });
    } else if (a.type === "text" && a.text) {
      if (skipRedact) continue;
      const size = Math.max(8, Math.min(18, box.h * 0.7));
      const lines = wrapFont(helv, a.text, size, Math.max(20, box.w - 4));
      let y = box.y + box.h - size - 2;
      for (const line of lines) {
        page.drawText(line, {
          x: box.x + 2,
          y,
          size,
          font: helv,
          color: rgb(0.11, 0.1, 0.09),
          maxWidth: box.w - 4,
        });
        y -= size + 2;
      }
    } else if (a.type === "comment") {
      page.drawRectangle({
        x: box.x,
        y: box.y + box.h - 14,
        width: 14,
        height: 14,
        color: rgb(0.95, 0.89, 0.63),
        borderColor: rgb(0.55, 0.45, 0.2),
        borderWidth: 0.6,
      });
    } else if (a.type === "signature" && a.imageDataUrl) {
      try {
        const bytes = dataUrlToBytes(a.imageDataUrl);
        const isJpg = a.imageDataUrl.startsWith("data:image/jpeg");
        const img = isJpg ? await out.embedJpg(bytes) : await out.embedPng(bytes);
        page.drawImage(img, {
          x: box.x,
          y: box.y,
          width: box.w,
          height: box.h,
        });
      } catch {
        page.drawText(a.text || "Signature", {
          x: box.x,
          y: box.y + 4,
          size: 14,
          font: helvBold,
          color: rgb(0.12, 0.2, 0.22),
        });
      }
    }
  }
}

export async function bakePdf(input: MutateInput): Promise<Uint8Array> {
  const src = await PDFDocument.load(input.bytes, {
    ignoreEncryption: true,
    password: input.openPassword,
  });
  const out = await PDFDocument.create();
  const helv = await out.embedFont(StandardFonts.Helvetica);
  const helvBold = await out.embedFont(StandardFonts.HelveticaBold);

  const byPage = new Map<number, Annotation[]>();
  for (const a of input.annotations) {
    const list = byPage.get(a.pageIndex) ?? [];
    list.push(a);
    byPage.set(a.pageIndex, list);
  }

  for (let i = 0; i < input.pageOrder.length; i++) {
    const original = input.pageOrder[i]!;
    const extra = input.rotations[original] ?? 0;
    const list = byPage.get(original) ?? [];
    const redacts = list.filter((a) => a.type === "redact");
    const edits = list.filter((a) => a.type === "edit" || (a.type === "text" && a.text));
    let page: PDFPage;
    let skipRedact = false;

    if (redacts.length > 0 || edits.length > 0) {
      const raster = await rasterizePage({
        pageNumber: original + 1,
        extraRotation: extra,
        redactions: redacts.map((a) => ({ x: a.x, y: a.y, w: a.w, h: a.h })),
        scale: 2,
        mime: "image/png",
      });
      const painted = edits.length
        ? await paintTextOnRaster(
            raster,
            edits.map((a) => ({
              x: a.x,
              y: a.y,
              w: a.w,
              h: a.h,
              text: a.text || "",
              fontSize: a.fontSize,
              fontFamily: a.fontFamily,
              bold: a.bold,
              italic: a.italic,
              underline: a.underline,
              strike: a.strike,
              color: a.color,
              align: a.align,
              knockout: a.source === "pdf" || a.originX != null,
              originX: a.originX,
              originY: a.originY,
              originW: a.originW,
              originH: a.originH,
            })),
          )
        : raster.bytes;
      const img = await out.embedPng(painted);
      page = out.addPage([raster.widthPt, raster.heightPt]);
      page.drawImage(img, {
        x: 0,
        y: 0,
        width: raster.widthPt,
        height: raster.heightPt,
      });
      skipRedact = true;
    } else {
      const [copied] = await out.copyPages(src, [original]);
      if (extra) {
        const current = copied.getRotation().angle;
        copied.setRotation(degrees((((current + extra) % 360) + 360) % 360));
      }
      out.addPage(copied);
      page = copied;
    }

    await drawMarks(page, list, out, helv, helvBold, skipRedact);
  }

  if (input.userPassword) {
    out.encrypt({
      userPassword: input.userPassword,
      ownerPassword: input.ownerPassword || input.userPassword,
      permissions: {
        printing: "highResolution",
        modifying: false,
        copying: true,
        annotating: true,
        fillingForms: true,
        contentAccessibility: true,
        documentAssembly: false,
      },
    });
  }

  return out.save();
}

export function parsePageRange(input: string, pageCount: number): number[] {
  const out = new Set<number>();
  for (const part of input.split(",")) {
    const bit = part.trim();
    if (!bit) continue;
    const m = bit.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      let a = Number(m[1]);
      let b = Number(m[2]);
      if (a > b) [a, b] = [b, a];
      for (let n = a; n <= b; n++) {
        if (n >= 1 && n <= pageCount) out.add(n - 1);
      }
    } else {
      const n = Number(bit);
      if (Number.isInteger(n) && n >= 1 && n <= pageCount) out.add(n - 1);
    }
  }
  return [...out];
}

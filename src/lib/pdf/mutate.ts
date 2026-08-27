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
import {
  contentBox,
  fitRect,
  hasMargins,
  type Margins,
  type PageSize,
} from "@/lib/page-format";
import { hexToRgb } from "@/lib/color";

export interface MutateInput {
  bytes: Uint8Array;
  pageOrder: number[];
  rotations: Record<number, number>;
  annotations: Annotation[];
  userPassword?: string;
  ownerPassword?: string;
  openPassword?: string;
  pageBackgrounds?: Record<number, string>;
  rasterScale?: number;
  jpegQuality?: number;
  compressAll?: boolean;
  pageSize?: PageSize | null;
  margins?: Margins;
}

function pdfBox(
  page: PDFPage,
  a: Annotation,
  dest?: { x: number; y: number; width: number; height: number },
) {
  const { width, height } = page.getSize();
  const area = dest
    ? {
        x: dest.x,
        y: height - dest.y - dest.height,
        w: dest.width,
        h: dest.height,
      }
    : { x: 0, y: 0, w: width, h: height };
  return {
    x: area.x + a.x * area.w,
    y: area.y + (1 - a.y - a.h) * area.h,
    w: a.w * area.w,
    h: a.h * area.h,
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
  dest?: { x: number; y: number; width: number; height: number },
) {
  for (const a of list) {
    const box = pdfBox(page, a, dest);
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
    } else if ((a.type === "signature" || a.type === "image") && a.imageDataUrl) {
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

async function ensureJpeg(bytes: Uint8Array, quality: number) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8) return bytes;
  const blob = new Blob([new Uint8Array(bytes)]);
  const bmp = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bmp.width;
  canvas.height = bmp.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return bytes;
  ctx.drawImage(bmp, 0, 0);
  bmp.close();
  const out = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("JPEG encode failed"))),
      "image/jpeg",
      quality,
    );
  });
  return new Uint8Array(await out.arrayBuffer());
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
    const bg = input.pageBackgrounds?.[original];
    const scale = input.rasterScale ?? 2;
    const compress = !!input.compressAll;
    const reflow =
      !!input.pageSize || (!!input.margins && hasMargins(input.margins));
    let page: PDFPage;
    let skipRedact = false;
    let dest: { x: number; y: number; width: number; height: number } | undefined;

    if (redacts.length > 0 || edits.length > 0 || bg || compress || reflow) {
      const raster = await rasterizePage({
        pageNumber: original + 1,
        extraRotation: extra,
        redactions: redacts.map((a) => ({ x: a.x, y: a.y, w: a.w, h: a.h })),
        scale,
        mime: compress ? "image/jpeg" : "image/png",
        quality: input.jpegQuality ?? 0.88,
        paperColor: bg,
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
      const baked = compress ? await ensureJpeg(painted, input.jpegQuality ?? 0.88) : painted;
      const img = compress ? await out.embedJpg(baked) : await out.embedPng(baked);
      const tw = input.pageSize?.width ?? raster.widthPt;
      const th = input.pageSize?.height ?? raster.heightPt;
      page = out.addPage([tw, th]);
      if (bg) {
        const c = hexToRgb(bg);
        page.drawRectangle({
          x: 0,
          y: 0,
          width: tw,
          height: th,
          color: rgb(c.r / 255, c.g / 255, c.b / 255),
        });
      } else if (reflow) {
        page.drawRectangle({
          x: 0,
          y: 0,
          width: tw,
          height: th,
          color: rgb(1, 1, 1),
        });
      }
      if (reflow) {
        const box = contentBox(tw, th, input.margins ?? { top: 0, right: 0, bottom: 0, left: 0 });
        dest = fitRect(raster.widthPt, raster.heightPt, box);
        page.drawImage(img, {
          x: dest.x,
          y: th - dest.y - dest.height,
          width: dest.width,
          height: dest.height,
        });
      } else {
        page.drawImage(img, {
          x: 0,
          y: 0,
          width: tw,
          height: th,
        });
      }
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

    await drawMarks(page, list, out, helv, helvBold, skipRedact, dest);
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

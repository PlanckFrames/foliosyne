import { PDFDocument, StandardFonts, rgb } from "@cantoo/pdf-lib";
import {
  AlignmentType,
  Document,
  FrameAnchorType,
  FrameWrap,
  HorizontalPositionRelativeFrom,
  ImageRun,
  LineRuleType,
  Packer,
  PageOrientation,
  Paragraph,
  SectionType,
  ShadingType,
  TextRun,
  TextWrappingType,
  VerticalPositionRelativeFrom,
} from "docx";
import JSZip from "jszip";
import {
  extractPageLayout,
  rasterizePageBackdrop,
  snapInkHex,
  type LayoutLine,
} from "@/lib/pdf/engine";
import type { Annotation } from "@/lib/types";

export interface DocBlock {
  text: string;
  heading?: 1 | 2 | 3;
}

function rectsOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function annotationCovers(
  annotations: Annotation[],
  pageIndex: number,
  box: { x: number; y: number; w: number; h: number },
) {
  return annotations.some(
    (a) => a.type === "redact" && a.pageIndex === pageIndex && rectsOverlap(a, box),
  );
}

export async function parseDocx(buffer: ArrayBuffer): Promise<DocBlock[]> {
  const zip = await JSZip.loadAsync(buffer);
  const xml = await zip.file("word/document.xml")?.async("string");
  if (!xml) throw new Error("Not a Word document");
  const parsed = new DOMParser().parseFromString(xml, "application/xml");
  const blocks: DocBlock[] = [];
  const paras = [...parsed.getElementsByTagName("*")].filter(
    (el) => el.localName === "p" && el.namespaceURI?.includes("wordprocessingml"),
  );
  const list =
    paras.length > 0
      ? paras
      : [...parsed.getElementsByTagName("*")].filter((el) => el.localName === "p");

  for (const p of list) {
    const style = [...p.getElementsByTagName("*")].find(
      (el) => el.localName === "pStyle",
    );
    const val = style?.getAttribute("w:val") || style?.getAttribute("val") || "";
    let heading: 1 | 2 | 3 | undefined;
    if (/heading1|title/i.test(val)) heading = 1;
    else if (/heading2/i.test(val)) heading = 2;
    else if (/heading3/i.test(val)) heading = 3;
    const texts = [...p.getElementsByTagName("*")].filter(
      (el) => el.localName === "t",
    );
    const text = texts.map((t) => t.textContent ?? "").join("");
    if (text.trim()) blocks.push({ text: text.trim(), heading });
  }
  return blocks;
}

export async function blocksToPdf(blocks: DocBlock[], title: string) {
  const doc = await PDFDocument.create();
  const serif = await doc.embedFont(StandardFonts.TimesRoman);
  const serifBold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const W = 612;
  const H = 792;
  const margin = 64;
  const max = W - margin * 2;
  let page = doc.addPage([W, H]);
  let y = H - 72;

  const newPage = () => {
    page = doc.addPage([W, H]);
    y = H - 72;
  };

  const write = (text: string, size: number, bold: boolean) => {
    const font = bold ? serifBold : serif;
    const words = text.split(/\s+/);
    let line = "";
    const flush = () => {
      if (!line) return;
      if (y < 64) newPage();
      page.drawText(line, {
        x: margin,
        y,
        size,
        font,
        color: rgb(0.11, 0.1, 0.09),
      });
      y -= size + 6;
      line = "";
    };
    for (const w of words) {
      const next = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(next, size) > max && line) flush();
      else line = next;
      if (!line) line = w;
    }
    flush();
    y -= 8;
  };

  page.drawText(title.replace(/\.[^.]+$/, "") || "Document", {
    x: margin,
    y,
    size: 22,
    font: serifBold,
    color: rgb(0.11, 0.1, 0.09),
  });
  y -= 36;

  for (const b of blocks) {
    if (b.heading === 1) write(b.text, 18, true);
    else if (b.heading === 2) write(b.text, 14, true);
    else if (b.heading === 3) write(b.text, 12, true);
    else write(b.text, 11.5, false);
  }

  return doc.save();
}

function ptToTwip(pt: number) {
  return Math.max(0, Math.round(pt * 20));
}

function ptToPx(pt: number) {
  return Math.max(1, Math.round((pt * 96) / 72));
}

function mapFont(name?: string): string {
  const n = (name || "").toLowerCase();
  if (/courier|mono/.test(n)) return "Courier New";
  if (/times|georgia|garamond|\bserif\b/.test(n) && !/sans/.test(n)) {
    return /georgia/.test(n) ? "Georgia" : "Times New Roman";
  }
  if (/helvetica|arial|sans|calibri|outfit/.test(n)) return "Arial";
  return "Times New Roman";
}

function runFont(name?: string) {
  const mapped = mapFont(name);
  return { ascii: mapped, hAnsi: mapped, cs: mapped, eastAsia: mapped };
}

function inkColor(color?: string): string {
  const hex = (color || "1C1917").replace("#", "");
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return "1C1917";
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return snapInkHex(r, g, b);
}

function lineCovered(
  annotations: Annotation[],
  pageIndex: number,
  line: LayoutLine,
  pageW: number,
  pageH: number,
) {
  const box = {
    x: line.x / pageW,
    y: line.y / pageH,
    w: Math.max(line.w, 1) / pageW,
    h: Math.max(line.h, 1) / pageH,
  };
  return annotationCovers(annotations, pageIndex, box);
}

function halfPoints(pt: number) {
  return Math.max(14, Math.min(96, Math.round(pt * 2)));
}

export async function pdfPagesToDocx(opts: {
  title: string;
  pageOrder: number[];
  rotations?: Record<number, number>;
  annotations?: Annotation[];
}): Promise<Blob> {
  const rotations = opts.rotations ?? {};
  const annotations = opts.annotations ?? [];
  const sections = [];

  for (let i = 0; i < opts.pageOrder.length; i++) {
    const original = opts.pageOrder[i]!;
    const extra = rotations[original] ?? 0;
    const layout = await extractPageLayout(original + 1, extra);
    const pageW = layout.widthPt;
    const pageH = layout.heightPt;
    const landscape = pageW > pageH;
    const redactions = annotations
      .filter((a) => a.type === "redact" && a.pageIndex === original)
      .map((a) => ({ x: a.x, y: a.y, w: a.w, h: a.h }));

    const backdrop = await rasterizePageBackdrop({
      pageNumber: original + 1,
      extraRotation: extra,
      lines: layout.lines,
      redactions,
    });

    const visible = backdrop.lines.filter(
      (line) =>
        line.text.trim() &&
        !lineCovered(annotations, original, line, pageW, pageH),
    );

    const pageEdits = annotations.filter(
      (a) =>
        a.pageIndex === original &&
        a.type === "edit" &&
        (a.text || "").trim(),
    );

    const bg = new Paragraph({
      spacing: { before: 0, after: 0, line: 20, lineRule: LineRuleType.EXACT },
      children: [
        new ImageRun({
          type: "png",
          data: backdrop.bytes,
          transformation: {
            width: ptToPx(pageW),
            height: ptToPx(pageH),
          },
          floating: {
            horizontalPosition: {
              relative: HorizontalPositionRelativeFrom.PAGE,
              offset: 0,
            },
            verticalPosition: {
              relative: VerticalPositionRelativeFrom.PAGE,
              offset: 0,
            },
            wrap: { type: TextWrappingType.NONE },
            behindDocument: true,
            allowOverlap: true,
          },
        }),
      ],
    });

    const frameFor = (opts: {
      x: number;
      y: number;
      w: number;
      h: number;
      fontSize: number;
      text: string;
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
      strike?: boolean;
      superScript?: boolean;
      subScript?: boolean;
      fontName?: string;
      color?: string;
    }) => {
      const size = halfPoints(opts.fontSize);
      const frameH = Math.max(opts.h + 4, opts.fontSize * 1.45);
      return new Paragraph({
        frame: {
          type: "absolute",
          position: {
            x: ptToTwip(Math.max(0, opts.x)),
            y: ptToTwip(Math.max(0, opts.y)),
          },
          width: ptToTwip(Math.max(opts.w + 12, 28)),
          height: ptToTwip(frameH),
          wrap: FrameWrap.NONE,
          anchor: {
            horizontal: FrameAnchorType.PAGE,
            vertical: FrameAnchorType.PAGE,
          },
        },
        spacing: {
          before: 0,
          after: 0,
          line: Math.round(Math.max(opts.fontSize * 1.15, 10) * 20),
          lineRule: LineRuleType.EXACT,
        },
        alignment: AlignmentType.START,
        children: [
          new TextRun({
            text: opts.text.replace(/\s+/g, " "),
            bold: opts.bold,
            italics: opts.italic,
            underline: opts.underline ? { type: "single" } : undefined,
            strike: opts.strike,
            superScript: opts.superScript,
            subScript: opts.subScript,
            size,
            font: runFont(opts.fontName),
            color: inkColor(opts.color),
          }),
        ],
      });
    };

    const framed =
      pageEdits.length > 0
        ? pageEdits.map((a) =>
            frameFor({
              x: a.x * pageW,
              y: a.y * pageH,
              w: a.w * pageW,
              h: a.h * pageH,
              fontSize: a.fontSize ?? 12,
              text: a.text || "",
              bold: a.bold,
              italic: a.italic,
              underline: a.underline,
              strike: a.strike,
              superScript: a.superScript,
              subScript: a.subScript,
              fontName: a.fontFamily,
              color: a.color,
            }),
          )
        : visible.map((line) =>
            frameFor({
              x: line.x,
              y: line.y,
              w: line.w,
              h: line.h,
              fontSize: line.fontSize,
              text: line.text,
              bold: line.bold,
              italic: line.italic,
              fontName: line.fontName,
              color: line.color,
            }),
          );

    for (const a of annotations) {
      if (a.pageIndex !== original) continue;
      if (a.type === "text" && a.text?.trim()) {
        framed.push(
          frameFor({
            x: a.x * pageW,
            y: a.y * pageH,
            w: Math.max(a.w * pageW, 48),
            h: Math.max(a.h * pageH, 16),
            fontSize: a.fontSize ?? 12,
            text: a.text,
            bold: a.bold,
            italic: a.italic,
            underline: a.underline,
            strike: a.strike,
            superScript: a.superScript,
            subScript: a.subScript,
            fontName: a.fontFamily,
            color: a.color,
          }),
        );
      }
    }

    sections.push({
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          size: {
            width: ptToTwip(pageW),
            height: ptToTwip(pageH),
            orientation: landscape
              ? PageOrientation.LANDSCAPE
              : PageOrientation.PORTRAIT,
          },
          margin: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            header: 0,
            footer: 0,
          },
        },
      },
      children: [bg, ...framed],
    });
  }

  const doc = new Document({
    title: opts.title,
    creator: "Foliosyne",
    description: "Word conversion with page artwork and real editable text.",
    styles: {
      default: {
        document: {
          run: {
            font: "Times New Roman",
            color: "1C1917",
          },
        },
      },
    },
    sections,
  });
  return Packer.toBlob(doc);
}

export async function pdfTextToDocx(opts: {
  title: string;
  pageCount: number;
  pageOrder: number[];
}): Promise<Blob> {
  return pdfPagesToDocx({
    title: opts.title,
    pageOrder: opts.pageOrder,
  });
}

export function textToGdocHtml(title: string, body: string) {
  const paras = body
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p).replaceAll("\n", "<br/>")}</p>`)
    .join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head><body><h1>${escapeHtml(title)}</h1>${paras}</body></html>`;
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

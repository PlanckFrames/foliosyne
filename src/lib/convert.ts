import { PDFDocument, StandardFonts, rgb } from "@cantoo/pdf-lib";
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  PageOrientation,
  Paragraph,
  SectionType,
  ShadingType,
  TextRun,
  LineRuleType,
} from "docx";
import JSZip from "jszip";
import { extractPageLayout, type LayoutLine } from "@/lib/pdf/engine";
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

function mapFont(name: string): string {
  const n = name.toLowerCase();
  if (/courier|mono/.test(n)) return "Courier New";
  if (/helvetica|arial|sans|outfit/.test(n)) return "Arial";
  return "Times New Roman";
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
    w: line.w / pageW,
    h: line.h / pageH,
  };
  return annotationCovers(annotations, pageIndex, box);
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

    const visible = layout.lines.filter(
      (line) =>
        line.text.trim() &&
        !lineCovered(annotations, original, line, pageW, pageH),
    );

    const xs = visible.map((l) => l.x);
    const rights = visible.map((l) => l.x + l.w);
    const ys = visible.map((l) => l.y);
    const bottoms = visible.map((l) => l.y + l.h);
    const marginLeft = Math.max(36, Math.min(72, xs.length ? Math.min(...xs) : 64));
    const marginRight = Math.max(
      36,
      Math.min(72, pageW - (rights.length ? Math.max(...rights) : pageW - 64)),
    );
    const marginTop = Math.max(36, Math.min(72, ys.length ? Math.min(...ys) : 64));
    const marginBottom = Math.max(
      36,
      Math.min(72, pageH - (bottoms.length ? Math.max(...bottoms) : pageH - 64)),
    );

    const sizes = visible.map((l) => l.fontSize).sort((a, b) => a - b);
    const median = sizes[Math.floor(sizes.length / 2)] ?? 11;

    const children: Paragraph[] = [];
    let prevBottom = marginTop;

    const redactions = annotations.filter(
      (a) => a.type === "redact" && a.pageIndex === original,
    );
    const placedRedact = new Set<string>();

    const insertRedactionsUntil = (y: number) => {
      for (const r of redactions) {
        const top = r.y * pageH;
        if (top > y) continue;
        const key = r.id;
        if (placedRedact.has(key)) continue;
        placedRedact.add(key);
        children.push(
          new Paragraph({
            spacing: { before: 80, after: 80 },
            shading: { type: ShadingType.CLEAR, fill: "000000" },
            children: [
              new TextRun({
                text: " ".repeat(Math.max(8, Math.round((r.w * pageW) / 6))),
                size: Math.max(16, Math.round(r.h * pageH * 2)),
                color: "000000",
              }),
            ],
          }),
        );
      }
    };

    for (const line of visible) {
      insertRedactionsUntil(line.y);
      const gap = Math.max(0, line.y - prevBottom);
      const before = ptToTwip(Math.max(0, gap - 1));
      const indent = ptToTwip(Math.max(0, line.x - marginLeft));
      const size = Math.max(16, Math.round(line.fontSize * 2));
      const font = mapFont(line.fontName);
      const trimmed = line.text.replace(/\s+/g, " ").trim();
      if (!trimmed) continue;

      const centered =
        Math.abs(line.x + line.w / 2 - pageW / 2) < 28 &&
        line.x > marginLeft + 12;

      const isTitle = line.fontSize >= median * 2.1 || /^[A-Z0-9][A-Z0-9 \-]{3,}$/.test(trimmed);
      const isH1 = !isTitle && line.fontSize >= median * 1.55;
      const isH2 = !isTitle && !isH1 && line.fontSize >= median * 1.28;

      const run = new TextRun({
        text: trimmed,
        bold: line.bold || isTitle || isH1,
        italics: line.italic,
        size,
        font,
        color: "1C1917",
      });

      children.push(
        new Paragraph({
          heading: isTitle
            ? HeadingLevel.TITLE
            : isH1
              ? HeadingLevel.HEADING_1
              : isH2
                ? HeadingLevel.HEADING_2
                : undefined,
          alignment: centered ? AlignmentType.CENTER : AlignmentType.START,
          indent: centered ? undefined : { left: indent },
          spacing: {
            before,
            after: isTitle || isH1 ? 120 : 40,
            line: 276,
            lineRule: LineRuleType.AUTO,
          },
          children: [run],
        }),
      );
      prevBottom = line.y + line.h;
    }
    insertRedactionsUntil(pageH);

    for (const a of annotations) {
      if (a.pageIndex !== original) continue;
      if (a.type === "text" && a.text?.trim()) {
        children.push(
          new Paragraph({
            spacing: { before: 80 },
            children: [
              new TextRun({
                text: a.text.trim(),
                size: 22,
                font: "Times New Roman",
                color: "1C1917",
              }),
            ],
          }),
        );
      }
    }

    if (!children.length) {
      children.push(new Paragraph({ children: [] }));
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
            top: ptToTwip(marginTop),
            right: ptToTwip(marginRight),
            bottom: ptToTwip(marginBottom),
            left: ptToTwip(marginLeft),
            header: 0,
            footer: 0,
          },
        },
      },
      children,
    });
  }

  const doc = new Document({
    title: opts.title,
    creator: "Foliosyne",
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

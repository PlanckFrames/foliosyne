import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import type { PageMetrics, Bookmark } from "@/lib/types";
import { uid } from "@/lib/utils";

type PdfJs = typeof import("pdfjs-dist");

let pdfjs: PdfJs | null = null;
let current: PDFDocumentProxy | null = null;
const pageCache = new Map<number, PDFPageProxy>();
const metricsCache = new Map<number, PageMetrics>();

export async function loadPdfjs(): Promise<PdfJs> {
  if (pdfjs) return pdfjs;
  const mod = await import("pdfjs-dist");
  try {
    const WorkerCtor = (
      await import("pdfjs-dist/build/pdf.worker.min.mjs?worker")
    ).default;
    const port = new WorkerCtor();
    mod.GlobalWorkerOptions.workerPort = port;
  } catch {
    const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
    mod.GlobalWorkerOptions.workerSrc = worker.default;
  }
  pdfjs = mod;
  return mod;
}

export function getOpenPdf(): PDFDocumentProxy | null {
  return current;
}

export async function destroyOpenPdf() {
  pageCache.clear();
  metricsCache.clear();
  if (current) {
    try {
      await current.cleanup();
    } catch {
      /* ignore */
    }
  }
  current = null;
}

export type OpenResult =
  | { ok: true; pdf: PDFDocumentProxy; pageCount: number }
  | { ok: false; needPassword: true }
  | { ok: false; needPassword: false; message: string };

export async function openPdfBytes(
  bytes: Uint8Array,
  password?: string,
): Promise<OpenResult> {
  const lib = await loadPdfjs();
  await destroyOpenPdf();
  const data = new Uint8Array(bytes.byteLength);
  data.set(bytes);
  try {
    const task = lib.getDocument({
      data,
      password: password || undefined,
      cMapUrl: `https://unpkg.com/pdfjs-dist@${lib.version}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${lib.version}/standard_fonts/`,
    });
    const pdf = await Promise.race([
      task.promise,
      new Promise<never>((_, reject) => {
        globalThis.setTimeout(
          () => reject(new Error("Timed out opening this PDF.")),
          20000,
        );
      }),
    ]);
    current = pdf;
    return { ok: true, pdf, pageCount: pdf.numPages };
  } catch (err) {
    const name = (err as { name?: string }).name ?? "";
    const msg = err instanceof Error ? err.message : String(err);
    if (name === "PasswordException" || /password/i.test(msg)) {
      return { ok: false, needPassword: true };
    }
    return { ok: false, needPassword: false, message: msg };
  }
}

export async function getPage(pageNumber: number): Promise<PDFPageProxy> {
  const cached = pageCache.get(pageNumber);
  if (cached) return cached;
  if (!current) throw new Error("No PDF open");
  const page = await current.getPage(pageNumber);
  pageCache.set(pageNumber, page);
  return page;
}

export async function getPageMetrics(
  pageNumber: number,
  extraRotation = 0,
): Promise<PageMetrics> {
  const key = pageNumber * 10 + (((extraRotation % 360) + 360) % 360);
  const hit = metricsCache.get(key);
  if (hit) return hit;
  const page = await getPage(pageNumber);
  const vp = page.getViewport({
    scale: 1,
    rotation: ((page.rotate + extraRotation) % 360 + 360) % 360,
  });
  const m = { width: vp.width, height: vp.height, rotation: extraRotation };
  metricsCache.set(key, m);
  return m;
}

export type LayoutSpan = {
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize: number;
  fontName: string;
  bold: boolean;
  italic: boolean;
};

export type LayoutLine = {
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize: number;
  fontName: string;
  bold: boolean;
  italic: boolean;
  spans: LayoutSpan[];
};

export async function extractPageLayout(
  pageNumber: number,
  extraRotation = 0,
): Promise<{ widthPt: number; heightPt: number; lines: LayoutLine[] }> {
  const page = await getPage(pageNumber);
  const rot = ((page.rotate + extraRotation) % 360 + 360) % 360;
  const viewport = page.getViewport({ scale: 1, rotation: rot });
  const content = await page.getTextContent();
  const spans: LayoutSpan[] = [];
  const fontStyles = (content.styles ?? {}) as Record<
    string,
    { fontFamily?: string; ascent?: number }
  >;

  for (const raw of content.items) {
    if (!raw || typeof raw !== "object" || !("str" in raw)) continue;
    const item = raw as {
      str: string;
      width?: number;
      height?: number;
      transform?: number[];
      fontName?: string;
    };
    const text = item.str;
    if (!text) continue;
    const tx = item.transform ?? [1, 0, 0, 1, 0, 0];
    const x0 = tx[4] ?? 0;
    const y0 = tx[5] ?? 0;
    const w0 = item.width ?? 0;
    const h0 = item.height ?? Math.hypot(tx[0] ?? 0, tx[1] ?? 0);
    const p1 = viewport.convertToViewportPoint(x0, y0);
    const p2 = viewport.convertToViewportPoint(x0 + w0, y0 + h0);
    const x = Math.min(p1[0], p2[0]);
    const y = Math.min(p1[1], p2[1]);
    const w = Math.max(1, Math.abs(p2[0] - p1[0]));
    const h = Math.max(1, Math.abs(p2[1] - p1[1]));
    const fontSize = Math.max(h, Math.hypot(tx[0] ?? 0, tx[1] ?? 0));
    const fontName = item.fontName || "";
    const family = fontStyles[fontName]?.fontFamily || "";
    const resolved =
      /times|helv|cour|arial|georgia|garamond|roman/i.test(fontName)
        ? fontName
        : family || fontName;
    spans.push({
      text,
      x,
      y,
      w,
      h,
      fontSize,
      fontName: resolved || fontName,
      bold: /bold|black|heavy|semibold/i.test(`${resolved} ${fontName}`),
      italic: /italic|oblique/i.test(`${resolved} ${fontName}`),
    });
  }

  spans.sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y));
  const lines: LayoutLine[] = [];
  for (const span of spans) {
    const last = lines[lines.length - 1];
    const sameLine =
      last &&
      Math.abs(span.y - last.y) <= Math.max(span.fontSize, last.fontSize) * 0.45;
    if (sameLine && last) {
      const gap = span.x - (last.x + last.w);
      const joiner = gap > span.fontSize * 0.35 ? " " : gap > 1.5 ? " " : "";
      last.text += joiner + span.text;
      last.w = Math.max(last.w, span.x + span.w - last.x);
      last.h = Math.max(last.h, span.h);
      last.fontSize = Math.max(last.fontSize, span.fontSize);
      last.bold = last.bold || span.bold;
      last.italic = last.italic || span.italic;
      last.spans.push(span);
    } else {
      lines.push({
        text: span.text,
        x: span.x,
        y: span.y,
        w: span.w,
        h: span.h,
        fontSize: span.fontSize,
        fontName: span.fontName,
        bold: span.bold,
        italic: span.italic,
        spans: [span],
      });
    }
  }

  return { widthPt: viewport.width, heightPt: viewport.height, lines };
}

export async function extractPageText(pageNumber: number): Promise<string> {
  const layout = await extractPageLayout(pageNumber);
  return layout.lines.map((l) => l.text).join("\n");
}

export async function extractDocumentText(
  pageCount: number,
  onPage?: (n: number) => void,
): Promise<string> {
  const parts: string[] = [];
  for (let i = 1; i <= pageCount; i++) {
    onPage?.(i);
    const t = await extractPageText(i);
    if (t) parts.push(t);
  }
  return parts.join("\n\n");
}

type HeadingRun = {
  str: string;
  height: number;
};

function isHeadingRun(it: unknown): it is HeadingRun {
  return (
    typeof it === "object" &&
    it !== null &&
    "str" in it &&
    typeof (it as { str?: unknown }).str === "string"
  );
}

export async function detectHeadings(
  pageCount: number,
  pageOrder: number[],
): Promise<Bookmark[]> {
  const found: Bookmark[] = [];
  const seen = new Set<string>();
  for (let display = 0; display < pageOrder.length; display++) {
    const original = pageOrder[display]!;
    const page = await getPage(original + 1);
    const content = await page.getTextContent();
    const items: HeadingRun[] = [];
    for (const it of content.items) {
      if (isHeadingRun(it)) items.push(it);
    }
    if (!items.length) continue;
    const heights = items.map((it) => it.height).filter((h) => h > 0);
    heights.sort((a, b) => a - b);
    const median = heights[Math.floor(heights.length / 2)] ?? 10;
    const threshold = Math.max(median * 1.35, 13);
    for (const it of items) {
      const str = it.str.trim();
      if (str.length < 3 || str.length > 80) continue;
      const isHeading =
        it.height >= threshold ||
        (/^[A-Z0-9][A-Z0-9 \-:,'’]{4,}$/.test(str) && str.length < 60);
      if (!isHeading) continue;
      const key = `${original}:${str.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      found.push({
        id: uid("bm"),
        title: str,
        pageIndex: original,
        auto: true,
      });
    }
  }
  return found;
}

export async function outlineBookmarks(): Promise<Bookmark[]> {
  if (!current) return [];
  try {
    const outline = await current.getOutline();
    if (!outline?.length) return [];
    const dest = async (item: { title?: string; dest?: unknown }) => {
      let pageIndex = 0;
      try {
        const d = item.dest;
        if (typeof d === "string") {
          const resolved = await current!.getDestination(d);
          const ref = resolved?.[0];
          if (ref) pageIndex = Math.max(0, await current!.getPageIndex(ref));
        } else if (Array.isArray(d) && d[0]) {
          pageIndex = Math.max(0, await current!.getPageIndex(d[0]));
        }
      } catch {
        pageIndex = 0;
      }
      return {
        id: uid("bm"),
        title: (item.title || "Untitled").trim(),
        pageIndex,
        auto: true,
      } satisfies Bookmark;
    };
    const out: Bookmark[] = [];
    const walk = async (
      items: Array<{ title?: string; dest?: unknown; items?: unknown }>,
    ) => {
      for (const it of items) {
        out.push(await dest(it));
        if (Array.isArray(it.items) && it.items.length) {
          await walk(
            it.items as Array<{ title?: string; dest?: unknown; items?: unknown }>,
          );
        }
      }
    };
    await walk(
      outline as Array<{ title?: string; dest?: unknown; items?: unknown }>,
    );
    return out;
  } catch {
    return [];
  }
}

export async function rasterizePage(opts: {
  pageNumber: number;
  extraRotation?: number;
  redactions?: { x: number; y: number; w: number; h: number }[];
  scale?: number;
  mime?: "image/png" | "image/jpeg";
  quality?: number;
  paperColor?: string;
}): Promise<{
  bytes: Uint8Array;
  widthPx: number;
  heightPx: number;
  widthPt: number;
  heightPt: number;
}> {
  const page = await getPage(opts.pageNumber);
  const extra = opts.extraRotation ?? 0;
  const rot = ((page.rotate + extra) % 360 + 360) % 360;
  const scale = opts.scale ?? 2;
  const viewport = page.getViewport({ scale, rotation: rot });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Could not rasterize page");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let lastError: unknown;
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      const task = page.render({
        canvasContext: ctx,
        viewport,
        canvas,
      });
      await task.promise;
      lastError = null;
      break;
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, 120));
    }
  }
  if (lastError) throw lastError;

  if (opts.paperColor) {
    replacePaperPixels(ctx, canvas.width, canvas.height, opts.paperColor);
  }

  if (opts.redactions?.length) {
    ctx.fillStyle = "#000000";
    for (const r of opts.redactions) {
      const pad = 2;
      ctx.fillRect(
        r.x * canvas.width - pad,
        r.y * canvas.height - pad,
        r.w * canvas.width + pad * 2,
        r.h * canvas.height + pad * 2,
      );
    }
  }

  const mime = opts.mime ?? "image/png";
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Rasterize failed"))),
      mime,
      opts.quality ?? 0.88,
    );
  });
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const base = page.getViewport({ scale: 1, rotation: rot });
  return {
    bytes,
    widthPx: canvas.width,
    heightPx: canvas.height,
    widthPt: base.width,
    heightPt: base.height,
  };
}

export function replacePaperPixels(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  hex: string,
) {
  const raw = hex.replace("#", "");
  if (raw.length !== 6) return;
  const nr = Number.parseInt(raw.slice(0, 2), 16);
  const ng = Number.parseInt(raw.slice(2, 4), 16);
  const nb = Number.parseInt(raw.slice(4, 6), 16);
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i] ?? 0;
    const g = d[i + 1] ?? 0;
    const b = d[i + 2] ?? 0;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lum = (r + g + b) / 3;
    const sat = max === 0 ? 0 : (max - min) / max;
    if (lum > 205 && sat < 0.22) {
      d[i] = nr;
      d[i + 1] = ng;
      d[i + 2] = nb;
    }
  }
  ctx.putImageData(img, 0, 0);
}

function rgbHex(r: number, g: number, b: number) {
  const h = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
  return `${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

/** Collapse JPEG fringe samples to ink; keep only true dark accents (teal). */
export function snapInkHex(r: number, g: number, b: number): string {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lum = (r + g + b) / 3;
  const sat = max === 0 ? 0 : (max - min) / max;
  if (lum > 110 || sat < 0.32) return "1C1917";
  const teal = g >= r + 12 && g >= b - 8 && lum < 110;
  if (teal) return rgbHex(r, g, b);
  return "1C1917";
}

export type ColoredLine = LayoutLine & { color: string };

/** Page artwork only — PDF text operators are not drawn, so Word can overlay real text. */
export async function rasterizePageBackdrop(opts: {
  pageNumber: number;
  extraRotation?: number;
  lines: LayoutLine[];
  redactions?: { x: number; y: number; w: number; h: number }[];
}): Promise<{
  bytes: Uint8Array;
  widthPt: number;
  heightPt: number;
  lines: ColoredLine[];
}> {
  const lib = await loadPdfjs();
  const page = await getPage(opts.pageNumber);
  const extra = opts.extraRotation ?? 0;
  const rot = ((page.rotate + extra) % 360 + 360) % 360;
  const scale = 2;
  const viewport = page.getViewport({ scale, rotation: rot });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Could not rasterize page");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const OPS = lib.OPS;
  const skipText = new Set<number>([
    OPS.showText,
    OPS.showSpacedText,
    OPS.nextLineShowText,
    OPS.nextLineSetSpacingShowText,
  ]);
  const opList = await page.getOperatorList();
  const fnArray = opList.fnArray;
  const renderOpts = {
    canvasContext: ctx,
    viewport,
    canvas,
    operationsFilter: (idx: number) => !skipText.has(fnArray[idx] ?? -1),
  };
  const task = page.render(
    renderOpts as unknown as Parameters<PDFPageProxy["render"]>[0],
  );
  await task.promise;

  const w = canvas.width;
  const h = canvas.height;

  const colored: ColoredLine[] = opts.lines.map((line) => ({
    ...line,
    color: "1C1917",
  }));

  if (opts.redactions?.length) {
    ctx.fillStyle = "#000000";
    for (const r of opts.redactions) {
      ctx.fillRect(r.x * w - 2, r.y * h - 2, r.w * w + 4, r.h * h + 4);
    }
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Rasterize failed"))),
      "image/png",
    );
  });
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const base = page.getViewport({ scale: 1, rotation: rot });
  return { bytes, widthPt: base.width, heightPt: base.height, lines: colored };
}

function samplePaperColor(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) {
  const pts = [
    [Math.floor(w * 0.5), Math.floor(h * 0.45)],
    [40, Math.floor(h * 0.45)],
    [Math.floor(w * 0.5), Math.floor(h * 0.3)],
    [Math.floor(w - 40), Math.floor(h * 0.5)],
    [8, 8],
    [w - 8, h - 8],
  ] as const;
  for (const [x, y] of pts) {
    const d = ctx.getImageData(
      Math.max(0, Math.min(w - 1, x)),
      Math.max(0, Math.min(h - 1, y)),
      1,
      1,
    ).data;
    const r = d[0] ?? 244;
    const g = d[1] ?? 239;
    const b = d[2] ?? 230;
    if (r > 210 && g > 200 && b > 190) return `rgb(${r},${g},${b})`;
  }
  return "rgb(244,239,230)";
}

export async function paintTextOnRaster(
  raster: {
    bytes: Uint8Array;
    widthPx: number;
    heightPx: number;
    widthPt: number;
    heightPt: number;
  },
  overlays: Array<{
    x: number;
    y: number;
    w: number;
    h: number;
    text: string;
    fontSize?: number;
    fontFamily?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    color?: string;
    align?: "left" | "center" | "right";
    knockout?: boolean;
    originX?: number;
    originY?: number;
    originW?: number;
    originH?: number;
  }>,
): Promise<Uint8Array> {
  const blob = new Blob([new Uint8Array(raster.bytes)], { type: "image/png" });
  const bmp = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = raster.widthPx;
  canvas.height = raster.heightPx;
  const ctx = canvas.getContext("2d");
  if (!ctx) return raster.bytes;
  ctx.drawImage(bmp, 0, 0);
  bmp.close();
  const W = canvas.width;
  const H = canvas.height;
  const pt = W / raster.widthPt;

  const paper = samplePaperColor(ctx, W, H);
  for (const o of overlays) {
    if (o.knockout) {
      const ox = (o.originX ?? o.x) * W;
      const oy = (o.originY ?? o.y) * H;
      const ow = Math.max(8, (o.originW ?? o.w) * W);
      const oh = Math.max(8, (o.originH ?? o.h) * H);
      const padX = Math.max(8, ow * 0.04);
      const padY = Math.max(6, oh * 0.28);
      ctx.fillStyle = paper;
      ctx.fillRect(ox - padX, oy - padY * 0.5, ow + padX * 2, oh + padY * 1.4);
    }
    const x = o.x * W;
    const y = o.y * H;
    const w = Math.max(8, o.w * W);
    const h = Math.max(8, o.h * H);
    const sizePx = Math.max(8, (o.fontSize ?? 12) * pt);
    const weight = o.bold ? "700" : "400";
    const style = o.italic ? "italic" : "normal";
    ctx.font = `${style} ${weight} ${sizePx}px ${o.fontFamily || "Times New Roman"}`;
    ctx.fillStyle = o.color?.startsWith("#") ? o.color : `#${o.color || "1C1917"}`;
    ctx.textBaseline = "top";
    ctx.textAlign = o.align === "center" ? "center" : o.align === "right" ? "right" : "left";
    const tx = o.align === "center" ? x + w / 2 : o.align === "right" ? x + w : x + 1;
    const lines = (o.text || "").split("\n");
    let ty = y + 1;
    for (const line of lines) {
      ctx.fillText(line, tx, ty, w);
      if (o.underline || o.strike) {
        const tw = Math.min(w, ctx.measureText(line).width);
        const x0 = o.align === "center" ? tx - tw / 2 : o.align === "right" ? tx - tw : tx;
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = Math.max(1, sizePx * 0.06);
        ctx.beginPath();
        if (o.underline) {
          ctx.moveTo(x0, ty + sizePx * 0.95);
          ctx.lineTo(x0 + tw, ty + sizePx * 0.95);
        }
        if (o.strike) {
          ctx.moveTo(x0, ty + sizePx * 0.5);
          ctx.lineTo(x0 + tw, ty + sizePx * 0.5);
        }
        ctx.stroke();
      }
      ty += sizePx * 1.2;
    }
  }

  const out = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Paint failed"))),
      "image/png",
    );
  });
  return new Uint8Array(await out.arrayBuffer());
}

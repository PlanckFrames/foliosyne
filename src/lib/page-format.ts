export type PagePreset =
  | "letter"
  | "legal"
  | "tabloid"
  | "a3"
  | "a4"
  | "a5"
  | "a6"
  | "custom";

export type PageOrientation = "portrait" | "landscape";

export type PageSize = {
  preset: PagePreset;
  width: number;
  height: number;
  orientation: PageOrientation;
};

export type Margins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type MarginPreset = "none" | "narrow" | "normal" | "wide" | "custom";

/** Portrait sizes in PDF points (1/72 in). */
export const PAGE_PRESETS: Record<
  Exclude<PagePreset, "custom">,
  { width: number; height: number; label: string; region: "us" | "iso" }
> = {
  letter: { width: 612, height: 792, label: "US Letter — 8.5 × 11 in", region: "us" },
  legal: { width: 612, height: 1008, label: "US Legal — 8.5 × 14 in", region: "us" },
  tabloid: { width: 792, height: 1224, label: "US Tabloid — 11 × 17 in", region: "us" },
  a3: { width: 841.89, height: 1190.55, label: "A3 — 297 × 420 mm", region: "iso" },
  a4: { width: 595.28, height: 841.89, label: "A4 — 210 × 297 mm", region: "iso" },
  a5: { width: 419.53, height: 595.28, label: "A5 — 148 × 210 mm", region: "iso" },
  a6: { width: 297.64, height: 419.53, label: "A6 — 105 × 148 mm", region: "iso" },
};

export const MARGIN_PRESETS: Record<Exclude<MarginPreset, "custom">, Margins> = {
  none: { top: 0, right: 0, bottom: 0, left: 0 },
  narrow: { top: 36, right: 36, bottom: 36, left: 36 },
  normal: { top: 72, right: 72, bottom: 72, left: 72 },
  wide: { top: 108, right: 108, bottom: 108, left: 108 },
};

export const ZERO_MARGINS: Margins = { top: 0, right: 0, bottom: 0, left: 0 };

export const DEFAULT_PAGE_SIZE: PageSize = {
  preset: "letter",
  width: 612,
  height: 792,
  orientation: "portrait",
};

export function orientedSize(width: number, height: number, orientation: PageOrientation) {
  const a = Math.min(width, height);
  const b = Math.max(width, height);
  return orientation === "landscape" ? { width: b, height: a } : { width: a, height: b };
}

export function sizeFromPreset(preset: Exclude<PagePreset, "custom">, orientation: PageOrientation): PageSize {
  const p = PAGE_PRESETS[preset];
  const dim = orientedSize(p.width, p.height, orientation);
  return { preset, orientation, width: dim.width, height: dim.height };
}

export function hasMargins(m: Margins) {
  return m.top > 0 || m.right > 0 || m.bottom > 0 || m.left > 0;
}

export function contentBox(pageW: number, pageH: number, m: Margins) {
  const left = Math.max(0, m.left);
  const right = Math.max(0, m.right);
  const top = Math.max(0, m.top);
  const bottom = Math.max(0, m.bottom);
  const width = Math.max(24, pageW - left - right);
  const height = Math.max(24, pageH - top - bottom);
  return { x: left, y: top, width, height };
}

export function fitRect(
  srcW: number,
  srcH: number,
  box: { x: number; y: number; width: number; height: number },
) {
  const s = Math.min(box.width / Math.max(1, srcW), box.height / Math.max(1, srcH));
  const width = srcW * s;
  const height = srcH * s;
  return {
    x: box.x + (box.width - width) / 2,
    y: box.y + (box.height - height) / 2,
    width,
    height,
    scale: s,
  };
}

export function ptToIn(pt: number) {
  return Math.round((pt / 72) * 1000) / 1000;
}

export function inToPt(inches: number) {
  return Math.max(0, inches * 72);
}

export function ptToMm(pt: number) {
  return Math.round((pt / 72) * 25.4 * 10) / 10;
}

export function mmToPt(mm: number) {
  return Math.max(0, (mm / 25.4) * 72);
}

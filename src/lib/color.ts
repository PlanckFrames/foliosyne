export function clampByte(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

export function parseHex(input: string): { r: number; g: number; b: number } | null {
  let h = input.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(h)) {
    h = h[0]! + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  return {
    r: Number.parseInt(h.slice(0, 2), 16),
    g: Number.parseInt(h.slice(2, 4), 16),
    b: Number.parseInt(h.slice(4, 6), 16),
  };
}

export function rgbToHex(r: number, g: number, b: number) {
  const h = (n: number) => clampByte(n).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

export function hexToRgb(hex: string) {
  return parseHex(hex) ?? { r: 28, g: 25, b: 23 };
}

export function rgbToHsv(r: number, g: number, b: number) {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rr) h = ((gg - bb) / d) % 6;
    else if (max === gg) h = (bb - rr) / d + 2;
    else h = (rr - gg) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

export function hsvToRgb(h: number, s: number, v: number) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return {
    r: clampByte((r + m) * 255),
    g: clampByte((g + m) * 255),
    b: clampByte((b + m) * 255),
  };
}

export const PRESET_INK = [
  "#1C1917",
  "#2F5D56",
  "#1D4ED8",
  "#B45309",
  "#BE123C",
  "#FFFFFF",
];

export const PRESET_PAPER = [
  "#F4EEE6",
  "#FFFFFF",
  "#111827",
  "#ECFDF5",
  "#FEF3C7",
  "#DBEAFE",
  "#FCE7F3",
  "#E5E7EB",
];

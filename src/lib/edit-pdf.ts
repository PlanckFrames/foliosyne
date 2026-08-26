import { extractPageLayout } from "@/lib/pdf/engine";
import { useAppStore } from "@/lib/store";
import type { Annotation } from "@/lib/types";
import { uid } from "@/lib/utils";

function mapFont(name: string): string {
  const n = name.toLowerCase();
  if (/courier|mono/.test(n)) return "Courier New";
  if (/times|georgia|garamond|\bserif\b/.test(n) && !/sans/.test(n)) {
    return /georgia/.test(n) ? "Georgia" : "Times New Roman";
  }
  if (/helvetica|arial|sans|calibri|outfit/.test(n)) return "Arial";
  return "Times New Roman";
}

const seeding = new Set<number>();

export async function seedPageEdits(pageIndex: number, extraRotation = 0) {
  const s = useAppStore.getState();
  if (seeding.has(pageIndex)) return;
  const existing = s.annotations.filter(
    (a) => a.type === "edit" && a.source === "pdf" && a.pageIndex === pageIndex,
  );
  if (existing.length && existing.every((a) => a.originX != null)) return;
  seeding.add(pageIndex);
  try {
    const layout = await extractPageLayout(pageIndex + 1, extraRotation);
    const boxFor = (line: (typeof layout.lines)[number]) => {
      const x = line.x / layout.widthPt;
      const y = Math.max(0, (line.y - line.fontSize * 0.08) / layout.heightPt);
      const w = Math.max(0.04, (line.w + line.fontSize * 0.55) / layout.widthPt);
      const h = Math.max(0.018, (line.h + line.fontSize * 0.35) / layout.heightPt);
      return { x, y, w, h };
    };

    if (existing.length) {
      const used = new Set<number>();
      const store = useAppStore.getState();
      for (const a of existing) {
        if (a.originX != null) continue;
        const needle = (a.text || "").replace(/\s+/g, " ").trim();
        let best = -1;
        let bestScore = Infinity;
        layout.lines.forEach((line, i) => {
          if (used.has(i)) return;
          const t = line.text.replace(/\s+/g, " ").trim();
          const ly = line.y / layout.heightPt;
          const same = t === needle ? 0 : t.startsWith(needle.slice(0, 20)) ? 1 : 6;
          const score = same + Math.abs(ly - a.y) * 10;
          if (score < bestScore) {
            bestScore = score;
            best = i;
          }
        });
        if (best >= 0) {
          used.add(best);
          const b = boxFor(layout.lines[best]!);
          store.updateAnnotation(a.id, {
            originX: b.x,
            originY: b.y,
            originW: b.w,
            originH: b.h,
          });
        } else {
          store.updateAnnotation(a.id, {
            originX: a.x,
            originY: a.y,
            originW: a.w,
            originH: a.h,
          });
        }
      }
      return;
    }

    const list: Annotation[] = [];
    for (const line of layout.lines) {
      const text = line.text.replace(/\s+/g, " ");
      if (!text.trim()) continue;
      const b = boxFor(line);
      list.push({
        id: uid("ann"),
        type: "edit",
        pageIndex,
        ...b,
        originX: b.x,
        originY: b.y,
        originW: b.w,
        originH: b.h,
        text,
        fontFamily: mapFont(line.fontName),
        fontSize: line.fontSize,
        bold: line.bold,
        italic: line.italic,
        color: "#1C1917",
        align: "left",
        source: "pdf",
        createdAt: Date.now(),
      });
    }
    useAppStore.getState().seedEdits(list);
  } finally {
    seeding.delete(pageIndex);
  }
}

export const EDIT_FONTS = [
  "Times New Roman",
  "Georgia",
  "Garamond",
  "Arial",
  "Calibri",
  "Courier New",
];

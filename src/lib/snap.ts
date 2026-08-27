import type { Annotation } from "@/lib/types";

export type SnapGuides = {
  v: number[];
  h: number[];
  glow: string[];
};

const THRESH = 0.012;

type Edge = { id: string | null; v: number; kind: "v" | "h" };

function edgesOf(a: { id?: string; x: number; y: number; w: number; h: number }): Edge[] {
  return [
    { id: a.id ?? null, v: a.x, kind: "v" },
    { id: a.id ?? null, v: a.x + a.w, kind: "v" },
    { id: a.id ?? null, v: a.x + a.w / 2, kind: "v" },
    { id: a.id ?? null, v: a.y, kind: "h" },
    { id: a.id ?? null, v: a.y + a.h, kind: "h" },
    { id: a.id ?? null, v: a.y + a.h / 2, kind: "h" },
  ];
}

export function snapBox(
  box: { x: number; y: number; w: number; h: number },
  others: Annotation[],
  mode: "move" | "resize",
) {
  const page: Edge[] = [
    { id: null, v: 0, kind: "v" },
    { id: null, v: 0.5, kind: "v" },
    { id: null, v: 1, kind: "v" },
    { id: null, v: 0, kind: "h" },
    { id: null, v: 0.5, kind: "h" },
    { id: null, v: 1, kind: "h" },
  ];
  const targets = [...page, ...others.flatMap((o) => edgesOf(o))];
  const self = edgesOf({ ...box, id: "self" });
  let dx = 0;
  let dy = 0;
  let bestX = THRESH;
  let bestY = THRESH;
  const v: number[] = [];
  const h: number[] = [];
  const glow = new Set<string>();

  const consider = (mine: Edge[], deltaKey: "x" | "y") => {
    for (const m of mine) {
      for (const t of targets) {
        if (t.kind !== m.kind) continue;
        const d = t.v - m.v;
        const ad = Math.abs(d);
        if (deltaKey === "x" && m.kind === "v" && ad < bestX) {
          bestX = ad;
          dx = d;
        }
        if (deltaKey === "y" && m.kind === "h" && ad < bestY) {
          bestY = ad;
          dy = d;
        }
      }
    }
  };

  if (mode === "move") {
    consider(self, "x");
    consider(self, "y");
  } else {
    consider(
      [
        { id: "self", v: box.x + box.w, kind: "v" },
        { id: "self", v: box.y + box.h, kind: "h" },
      ],
      "x",
    );
    consider(
      [
        { id: "self", v: box.x + box.w, kind: "v" },
        { id: "self", v: box.y + box.h, kind: "h" },
      ],
      "y",
    );
  }

  const snapped = {
    x: box.x + (mode === "move" ? dx : 0),
    y: box.y + (mode === "move" ? dy : 0),
    w: mode === "resize" ? box.w + dx : box.w,
    h: mode === "resize" ? box.h + dy : box.h,
  };
  snapped.x = Math.max(0, Math.min(1 - snapped.w, snapped.x));
  snapped.y = Math.max(0, Math.min(1 - snapped.h, snapped.y));
  snapped.w = Math.max(0.03, Math.min(1 - snapped.x, snapped.w));
  snapped.h = Math.max(0.02, Math.min(1 - snapped.y, snapped.h));

  const after = edgesOf({ ...snapped, id: "self" });
  for (const m of after) {
    for (const t of targets) {
      if (t.kind !== m.kind) continue;
      if (Math.abs(t.v - m.v) > 0.003) continue;
      if (m.kind === "v") v.push(t.v);
      else h.push(t.v);
      if (t.id) glow.add(t.id);
    }
  }

  return {
    box: snapped,
    guides: {
      v: [...new Set(v)],
      h: [...new Set(h)],
      glow: [...glow],
    } as SnapGuides,
  };
}

export function otherBoxes(all: Annotation[], id: string, pageIndex: number) {
  return all.filter(
    (a) =>
      a.id !== id &&
      a.pageIndex === pageIndex &&
      (a.type === "edit" || a.type === "signature" || a.type === "image" || a.type === "text"),
  );
}

import { Check, GripVertical, MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Annotation, Tool } from "@/lib/types";
import { seedPageEdits } from "@/lib/edit-pdf";

import { getPage } from "@/lib/pdf/engine";
import { useAppStore, useT } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Props {
  originalIndex: number;
  displayIndex: number;
  width: number;
  rotation: number;
  scale: number;
  tool: Tool;
}

function focusAnnotField(id: string) {
  const run = () => {
    const el = document.querySelector<HTMLElement>(`[data-annot-id="${id}"]`);
    if (!el) return false;
    el.focus();
    if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
      const len = el.value.length;
      try {
        el.setSelectionRange(len, len);
      } catch {
        /* ignore */
      }
    }
    return true;
  };
  if (run()) return;
  requestAnimationFrame(() => {
    if (run()) return;
    window.setTimeout(run, 40);
  });
}

function samplePaper(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const pts = [
    [Math.floor(w * 0.5), Math.floor(h * 0.45)],
    [40, Math.floor(h * 0.45)],
    [Math.floor(w * 0.5), Math.floor(h * 0.3)],
    [Math.floor(w - 40), Math.floor(h * 0.5)],
    [8, 8],
    [w - 8, 8],
    [8, h - 8],
    [w - 8, h - 8],
  ];
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

function knockoutEdits(
  canvas: HTMLCanvasElement,
  source: HTMLCanvasElement,
  edits: Annotation[],
  paper: string,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.drawImage(source, 0, 0);
  const W = canvas.width;
  const H = canvas.height;
  ctx.fillStyle = paper;
  for (const a of edits) {
    if (a.type !== "edit") continue;
    if (a.source !== "pdf" && a.originX == null) continue;
    const ox = a.originX ?? a.x;
    const oy = a.originY ?? a.y;
    const ow = a.originW ?? a.w;
    const oh = a.originH ?? a.h;
    const padX = Math.max(8, ow * W * 0.04);
    const padY = Math.max(6, oh * H * 0.28);
    ctx.fillRect(
      ox * W - padX,
      oy * H - padY * 0.5,
      ow * W + padX * 2,
      oh * H + padY * 1.4,
    );
  }
}

const BULLET: Record<string, string> = {
  disc: "• ",
  circle: "◦ ",
  square: "▪ ",
  dash: "– ",
};

function fieldOrient(
  rotation: number,
  pageWidth: number,
  pageHeight: number,
  a: Annotation,
): React.CSSProperties {
  const r = ((rotation % 360) + 360) % 360;
  if (r === 90) {
    return {
      position: "absolute",
      top: 0,
      left: "100%",
      width: Math.max(8, pageHeight * a.h),
      height: Math.max(8, pageWidth * a.w),
      transform: "rotate(90deg)",
      transformOrigin: "top left",
    };
  }
  if (r === 270) {
    return {
      position: "absolute",
      top: "100%",
      left: 0,
      width: Math.max(8, pageHeight * a.h),
      height: Math.max(8, pageWidth * a.w),
      transform: "rotate(-90deg)",
      transformOrigin: "top left",
    };
  }
  if (r === 180) {
    return { position: "absolute", inset: 0, transform: "rotate(180deg)" };
  }
  return { position: "absolute", inset: 0 };
}

export function PageView({
  originalIndex,
  displayIndex,
  width,
  rotation,
  scale,
  tool,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLCanvasElement | null>(null);
  const paperRef = useRef("#F4EEE6");
  const printMode = useAppStore((s) => s.printMode);
  const [visible, setVisible] = useState(displayIndex < 3);
  const [sheet, setSheet] = useState({ w: width, h: width * 1.294 });
  const [rasterReady, setRasterReady] = useState(0);
  const annotations = useAppStore((s) => s.annotations);
  const addAnnotation = useAppStore((s) => s.addAnnotation);
  const updateAnnotation = useAppStore((s) => s.updateAnnotation);
  const removeAnnotation = useAppStore((s) => s.removeAnnotation);
  const activeAnnotation = useAppStore((s) => s.activeAnnotation);
  const setActiveAnnotation = useAppStore((s) => s.setActiveAnnotation);
  const activeSignature = useAppStore((s) => s.activeSignature);
  const setSelection = useAppStore((s) => s.setSelection);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const setRightTab = useAppStore((s) => s.setRightTab);
  const editGesture = useAppStore((s) => s.editGesture);
  const setEditGesture = useAppStore((s) => s.setEditGesture);
  const t = useT();
  const show = visible || printMode;

  const draft = useRef<{ x: number; y: number; w: number; h: number } | null>(
    null,
  );
  const [draftBox, setDraftBox] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  const pageEdits = annotations.filter(
    (a) => a.pageIndex === originalIndex && a.type === "edit",
  );
  const knockoutKey = pageEdits
    .filter((a) => a.source === "pdf" || a.originX != null)
    .map(
      (a) =>
        `${a.id}:${(a.originX ?? a.x).toFixed(4)}:${(a.originY ?? a.y).toFixed(4)}:${(a.originW ?? a.w).toFixed(4)}:${(a.originH ?? a.h).toFixed(4)}`,
    )
    .join("|");

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            setCurrentPage(displayIndex + 1);
          }
        }
      },
      { rootMargin: "800px 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [displayIndex, setCurrentPage]);

  useEffect(() => {
    if (!show) return;
    let cancelled = false;
    let textLayer: { cancel: () => void; render: () => Promise<unknown> } | null =
      null;
    const canvas = canvasRef.current;
    const textEl = textRef.current;
    if (!canvas || !textEl) return;
    delete canvas.dataset.rendered;

    (async () => {
      const page = await getPage(originalIndex + 1);
      if (cancelled) return;
      const rot = ((page.rotate + rotation) % 360 + 360) % 360;
      const viewport = page.getViewport({ scale, rotation: rot });
      setSheet({ w: viewport.width, h: viewport.height });
      const outputScale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const transform =
        outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;
      const task = page.render({
        canvasContext: ctx,
        viewport,
        canvas,
        transform,
      });
      await task.promise;
      if (cancelled) return;
      canvas.dataset.rendered = "1";
      const snap = document.createElement("canvas");
      snap.width = canvas.width;
      snap.height = canvas.height;
      snap.getContext("2d")!.drawImage(canvas, 0, 0);
      sourceRef.current = snap;
      paperRef.current = samplePaper(ctx, canvas.width, canvas.height);
      setRasterReady((n) => n + 1);
      textEl.replaceChildren();
      textEl.style.width = `${viewport.width}px`;
      textEl.style.height = `${viewport.height}px`;
      const content = await page.getTextContent();
      const { TextLayer } = await import("pdfjs-dist");
      textLayer = new TextLayer({
        textContentSource: content,
        container: textEl,
        viewport,
      });
      await textLayer.render();
    })().catch(() => {
      /* render cancelled */
    });

    return () => {
      cancelled = true;
      textLayer?.cancel();
    };
  }, [show, originalIndex, rotation, scale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const src = sourceRef.current;
    if (!canvas || !src || !rasterReady) return;
    knockoutEdits(canvas, src, pageEdits, paperRef.current);
  }, [rasterReady, knockoutKey, pageEdits]);

  useEffect(() => {
    if (tool !== "edit") return;
    void seedPageEdits(originalIndex, rotation);
  }, [tool, originalIndex, rotation]);

  const local = (e: React.PointerEvent) => {
    const r = hostRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) / r.width,
      y: (e.clientY - r.top) / r.height,
    };
  };

  const drawing = tool === "redact" || tool === "highlight";
  const placing =
    tool === "comment" ||
    tool === "sign" ||
    (tool === "edit" && editGesture === "place");

  const dropEmptyActive = () => {
    const s = useAppStore.getState();
    for (const a of s.annotations) {
      if (a.type === "edit" && a.source === "user" && !(a.text || "").trim()) {
        s.removeAnnotation(a.id);
      }
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-annot]")) return;

    if (tool === "select" || tool === "pan" || (tool === "edit" && editGesture === "pan")) {
      setActiveAnnotation(null);
      return;
    }

    const p = local(e);
    if (drawing) {
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      draft.current = { x: p.x, y: p.y, w: 0, h: 0 };
      setDraftBox(draft.current);
    } else if (placing) {
      if (tool === "sign") {
        if (!activeSignature) return;
        if (activeAnnotation) {
          setActiveAnnotation(null);
          return;
        }
        addAnnotation({
          type: "signature",
          pageIndex: originalIndex,
          x: p.x,
          y: p.y,
          w: 0.28,
          h: 0.08,
          imageDataUrl: activeSignature.dataUrl,
          text: activeSignature.name,
        });
      } else if (tool === "edit") {
        dropEmptyActive();
        const id = addAnnotation({
          type: "edit",
          pageIndex: originalIndex,
          x: Math.min(p.x, 0.7),
          y: Math.min(p.y, 0.94),
          w: 0.32,
          h: 0.045,
          text: "",
          fontFamily: "Times New Roman",
          fontSize: 12,
          color: "#1C1917",
          source: "user",
        });
        setEditGesture("select");
        focusAnnotField(id);
      } else if (tool === "comment") {
        const id = addAnnotation({
          type: "comment",
          pageIndex: originalIndex,
          x: p.x,
          y: p.y,
          w: 0.04,
          h: 0.03,
          text: "",
          confirmed: false,
        });
        setRightTab("comments");
        focusAnnotField(id);
      }
    } else if (tool === "edit") {
      dropEmptyActive();
      setActiveAnnotation(null);
    } else {
      setActiveAnnotation(null);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draft.current) return;
    const p = local(e);
    const x = Math.min(draft.current.x, p.x);
    const y = Math.min(draft.current.y, p.y);
    const w = Math.abs(p.x - draft.current.x);
    const h = Math.abs(p.y - draft.current.y);
    const box = { x, y, w, h };
    draft.current = box;
    setDraftBox(box);
  };

  const onPointerUp = () => {
    if (!draft.current) return;
    const box = draft.current;
    draft.current = null;
    setDraftBox(null);
    if (box.w < 0.008 && box.h < 0.008) return;
    addAnnotation({
      type: tool === "redact" ? "redact" : "highlight",
      pageIndex: originalIndex,
      ...box,
    });
  };

  const onTextSelect = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !hostRef.current) return;
    const range = sel.getRangeAt(0);
    if (!hostRef.current.contains(range.commonAncestorContainer)) return;
    const r = range.getBoundingClientRect();
    const host = hostRef.current.getBoundingClientRect();
    setSelection({
      pageIndex: originalIndex,
      text: sel.toString(),
      x: (r.left - host.left) / host.width,
      y: (r.top - host.top) / host.height,
      w: r.width / host.width,
      h: r.height / host.height,
    });
  };

  const hasEdits = pageEdits.some((a) => (a.text || "").trim() || tool === "edit");
  const pageAnnots = annotations.filter((a) => {
    if (a.pageIndex !== originalIndex) return false;
    if (a.type === "edit") {
      const empty = !(a.text || "").trim();
      if (empty && tool !== "edit") return false;
      return true;
    }
    return true;
  });

  return (
    <div
      ref={hostRef}
      className="page-sheet relative mx-auto bg-white shadow-[var(--shadow-border)]"
      style={{ width: sheet.w, height: sheet.h }}
      data-page={displayIndex + 1}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("[data-annot]")) return;
        if ((e.target as HTMLElement).closest(".annot-layer")) return;
        setActiveAnnotation(null);
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      <div
        ref={textRef}
        className="textLayer"
        onMouseUp={onTextSelect}
        style={{
          pointerEvents: tool === "select" && !hasEdits ? "auto" : "none",
          opacity: tool === "edit" || hasEdits ? 0 : 1,
        }}
      />
      <div
        className={cn(
          "annot-layer absolute inset-0",
          (tool === "select" || tool === "pan" || (tool === "edit" && editGesture === "pan")) &&
            "pointer-events-none",
          tool === "pan" && "cursor-grab",
          tool === "edit" && editGesture === "pan" && "cursor-grab",
          drawing && "cursor-crosshair",
          placing && "cursor-copy",
          tool === "edit" && editGesture === "select" && "cursor-default",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {pageAnnots.map((a) => (
          <AnnotBox
            key={a.id}
            a={a}
            active={activeAnnotation === a.id}
            pageWidth={sheet.w}
            pageHeight={sheet.h}
            rotation={rotation}
            editing={tool === "edit"}
            onSelect={() => setActiveAnnotation(a.id)}
            onChange={(patch) => {
              updateAnnotation(a.id, patch);
              if (patch.confirmed) setActiveAnnotation(null);
            }}
            onRemove={() => removeAnnotation(a.id)}
            t={t}
          />
        ))}
        {draftBox ? (
          <div
            className={cn(
              "absolute border",
              tool === "redact"
                ? "border-fg bg-ink/80"
                : "border-highlight bg-highlight/40",
            )}
            style={{
              left: `${draftBox.x * 100}%`,
              top: `${draftBox.y * 100}%`,
              width: `${draftBox.w * 100}%`,
              height: `${draftBox.h * 100}%`,
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

function AnnotBox({
  a,
  active,
  pageWidth,
  pageHeight,
  editing,
  rotation,
  onSelect,
  onChange,
  onRemove,
  t,
}: {
  a: Annotation;
  active: boolean;
  pageWidth: number;
  pageHeight: number;
  editing: boolean;
  rotation: number;
  onSelect: () => void;
  onChange: (patch: Partial<Annotation>) => void;
  onRemove: () => void;
  t: ReturnType<typeof useT>;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!active || !editing) return;
    if (a.type !== "text" && a.type !== "comment" && a.type !== "edit") return;
    const id = window.setTimeout(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      const len = el.value.length;
      try {
        el.setSelectionRange(len, len);
      } catch {
        /* ignore */
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, [active, a.type, a.id, editing]);

  const style: React.CSSProperties = {
    left: `${a.x * 100}%`,
    top: `${a.y * 100}%`,
    width: `${a.w * 100}%`,
    height: `${a.h * 100}%`,
    pointerEvents: "auto",
  };
  if (a.type === "redact") {
    return (
      <button
        type="button"
        data-annot={a.id}
        aria-label={t("tool.redact")}
        className={cn("absolute bg-ink", active && "ring-2 ring-accent")}
        style={style}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onDoubleClick={onRemove}
      />
    );
  }
  if (a.type === "highlight") {
    return (
      <button
        type="button"
        data-annot={a.id}
        aria-label={t("tool.highlight")}
        className={cn("absolute bg-highlight/45", active && "ring-2 ring-accent")}
        style={style}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onDoubleClick={onRemove}
      />
    );
  }
  if (a.type === "signature") {
    return (
      <StampBox
        a={a}
        active={active}
        pageWidth={pageWidth}
        pageHeight={pageHeight}
        rotation={rotation}
        onSelect={onSelect}
        onChange={onChange}
        onRemove={onRemove}
        t={t}
      />
    );
  }
  if (a.type === "text" || a.type === "edit") {
    return (
      <EditBox
        a={a}
        active={active}
        editing={editing}
        rotation={rotation}
        pageWidth={pageWidth}
        pageHeight={pageHeight}
        inputRef={inputRef}
        onSelect={onSelect}
        onChange={onChange}
        t={t}
      />
    );
  }
  const open = a.confirmed !== true;
  return (
    <div
      data-annot={a.id}
      className="absolute z-10"
      style={{
        left: `${a.x * 100}%`,
        top: `${a.y * 100}%`,
        pointerEvents: "auto",
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className={cn(
          "flex size-6 items-center justify-center rounded-[2px] bg-sticky text-ink shadow-[var(--shadow-border)]",
          active && "ring-2 ring-accent",
        )}
        aria-label={t("tool.comment")}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onChange({ confirmed: false });
          onSelect();
        }}
      >
        <MessageSquare className="size-3.5" />
      </button>
      {open ? (
        <div
          className="absolute start-7 top-0 z-20 w-56 rounded-md bg-surface p-2 shadow-[var(--shadow-border)]"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <textarea
            ref={inputRef}
            data-annot-id={a.id}
            className="min-h-16 w-full resize-none bg-transparent text-sm text-fg outline-none placeholder:text-subtle"
            placeholder={t("comment.placeholder")}
            value={a.text ?? ""}
            autoFocus
            onChange={(e) => onChange({ text: e.target.value })}
            onKeyDown={(e) => {
              e.stopPropagation();
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                onChange({ confirmed: true });
              }
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="mt-1 flex items-center justify-between gap-2">
            <button type="button" className="text-xs text-danger" onClick={onRemove}>
              {t("action.delete")}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-sm bg-accent px-2 py-1 text-xs text-accent-fg"
              onClick={() => onChange({ confirmed: true })}
            >
              <Check className="size-3.5" />
              {t("comment.confirm")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StampBox({
  a,
  active,
  pageWidth,
  pageHeight,
  rotation,
  onSelect,
  onChange,
  onRemove,
  t,
}: {
  a: Annotation;
  active: boolean;
  pageWidth: number;
  pageHeight: number;
  rotation: number;
  onSelect: () => void;
  onChange: (patch: Partial<Annotation>) => void;
  onRemove: () => void;
  t: ReturnType<typeof useT>;
}) {
  const tool = useAppStore((s) => s.tool);
  const editGesture = useAppStore((s) => s.editGesture);
  const locked = tool === "pan" || (tool === "edit" && editGesture === "pan");
  const drag = useRef<{
    kind: "move" | "resize";
    px: number;
    py: number;
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  const startDrag = (kind: "move" | "resize") => (e: React.PointerEvent) => {
    if (locked) return;
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    onSelect();
    drag.current = {
      kind,
      px: e.clientX,
      py: e.clientY,
      x: a.x,
      y: a.y,
      w: a.w,
      h: a.h,
    };
  };

  const onDragMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = (e.clientX - drag.current.px) / pageWidth;
    const dy = (e.clientY - drag.current.py) / pageHeight;
    if (drag.current.kind === "move") {
      onChange({
        x: Math.max(0, Math.min(1 - drag.current.w, drag.current.x + dx)),
        y: Math.max(0, Math.min(1 - drag.current.h, drag.current.y + dy)),
      });
    } else {
      onChange({
        w: Math.max(0.06, Math.min(1 - drag.current.x, drag.current.w + dx)),
        h: Math.max(0.03, Math.min(1 - drag.current.y, drag.current.h + dy)),
      });
    }
  };

  const onDragUp = (e: React.PointerEvent) => {
    if (!drag.current) return;
    drag.current = null;
    if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div
      data-annot={a.id}
      className={cn(
        "absolute outline-none",
        !locked && "cursor-grab active:cursor-grabbing",
        active && "ring-2 ring-accent",
      )}
      style={{
        left: `${a.x * 100}%`,
        top: `${a.y * 100}%`,
        width: `${a.w * 100}%`,
        height: `${a.h * 100}%`,
        pointerEvents: "auto",
      }}
      onPointerDown={startDrag("move")}
      onPointerMove={onDragMove}
      onPointerUp={onDragUp}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
    >
      {a.imageDataUrl ? (
        <img
          src={a.imageDataUrl}
          alt={a.text || t("action.sign")}
          className="pointer-events-none object-contain"
          draggable={false}
          style={fieldOrient(rotation, pageWidth, pageHeight, a)}
        />
      ) : null}
      {active && !locked ? (
        <button
          type="button"
          className="absolute -bottom-1.5 -end-1.5 z-10 size-3 cursor-nwse-resize rounded-sm border border-accent bg-surface"
          aria-label={t("edit.resize")}
          onPointerDown={startDrag("resize")}
          onPointerMove={onDragMove}
          onPointerUp={onDragUp}
        />
      ) : null}
    </div>
  );
}

function EditBox({
  a,
  active,
  editing,
  rotation,
  pageWidth,
  pageHeight,
  inputRef,
  onSelect,
  onChange,
  t,
}: {
  a: Annotation;
  active: boolean;
  editing: boolean;
  rotation: number;
  pageWidth: number;
  pageHeight: number;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  onSelect: () => void;
  onChange: (patch: Partial<Annotation>) => void;
  t: ReturnType<typeof useT>;
}) {
  const drag = useRef<{
    kind: "move" | "resize";
    px: number;
    py: number;
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const viewScale = useAppStore((s) => s.scale);

  const fontSize = (a.fontSize ?? 12) * viewScale;
  const prefix = a.list && a.list !== "none" ? (BULLET[a.list] ?? "") : "";
  const display = `${prefix}${a.text ?? ""}`;
  const chrome = editing && active;

  const startDrag = (kind: "move" | "resize") => (e: React.PointerEvent) => {
    if (!editing) return;
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = {
      kind,
      px: e.clientX,
      py: e.clientY,
      x: a.x,
      y: a.y,
      w: a.w,
      h: a.h,
    };
    onSelect();
  };

  const onDragMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = (e.clientX - drag.current.px) / pageWidth;
    const dy = (e.clientY - drag.current.py) / pageHeight;
    if (drag.current.kind === "move") {
      onChange({
        x: Math.max(0, Math.min(1 - drag.current.w, drag.current.x + dx)),
        y: Math.max(0, Math.min(1 - drag.current.h, drag.current.y + dy)),
      });
    } else {
      onChange({
        w: Math.max(0.04, Math.min(1 - drag.current.x, drag.current.w + dx)),
        h: Math.max(0.018, Math.min(1 - drag.current.y, drag.current.h + dy)),
      });
    }
  };

  const onDragUp = (e: React.PointerEvent) => {
    if (!drag.current) return;
    drag.current = null;
    if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  const boxStyle: React.CSSProperties = {
    left: `${a.x * 100}%`,
    top: `${a.y * 100}%`,
    width: `${a.w * 100}%`,
    height: `${a.h * 100}%`,
    pointerEvents: "auto",
    fontFamily: a.fontFamily || "Times New Roman",
    fontSize: `${Math.max(8, fontSize * (a.superScript || a.subScript ? 0.65 : 1))}px`,
    fontWeight: a.bold ? 700 : 400,
    fontStyle: a.italic ? "italic" : "normal",
    textDecoration: [
      a.underline ? "underline" : "",
      a.strike ? "line-through" : "",
    ]
      .filter(Boolean)
      .join(" ") || undefined,
    color: a.color || "#1C1917",
    textAlign: a.align || "left",
    paddingLeft: a.indent ? `${a.indent}px` : 0,
    background: "transparent",
    lineHeight: 1.05,
    verticalAlign: a.superScript ? "super" : a.subScript ? "sub" : undefined,
  };

  if (!editing) {
    return (
      <div
        data-annot={a.id}
        className="absolute overflow-hidden leading-none"
        style={{
          left: `${a.x * 100}%`,
          top: `${a.y * 100}%`,
          width: `${a.w * 100}%`,
          height: `${a.h * 100}%`,
          pointerEvents: "auto",
        }}
      >
        <div
          className="whitespace-pre-wrap break-words"
          style={{
            ...fieldOrient(rotation, pageWidth, pageHeight, a),
            fontFamily: boxStyle.fontFamily,
            fontSize: boxStyle.fontSize,
            fontWeight: boxStyle.fontWeight,
            fontStyle: boxStyle.fontStyle,
            textDecoration: boxStyle.textDecoration,
            color: boxStyle.color,
            textAlign: boxStyle.textAlign,
            paddingLeft: boxStyle.paddingLeft,
            lineHeight: 1.05,
          }}
        >
          {display}
        </div>
      </div>
    );
  }

  return (
    <div
      data-annot={a.id}
      className={cn(
        "absolute",
        chrome ? "ring-2 ring-accent" : "cursor-text",
      )}
      style={{
        left: `${a.x * 100}%`,
        top: `${a.y * 100}%`,
        width: `${a.w * 100}%`,
        height: `${a.h * 100}%`,
        pointerEvents: "auto",
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {chrome ? (
        <button
          type="button"
          className="absolute -start-4 top-0 z-10 flex h-full w-4 cursor-grab items-center justify-center text-accent active:cursor-grabbing"
          aria-label={t("edit.move")}
          onPointerDown={startDrag("move")}
          onPointerMove={onDragMove}
          onPointerUp={onDragUp}
        >
          <GripVertical className="size-3.5" />
        </button>
      ) : null}
      <textarea
        ref={inputRef}
        data-annot-id={a.id}
        className="resize-none overflow-hidden border-0 bg-transparent p-0 leading-none shadow-none outline-none"
        style={{
          ...fieldOrient(rotation, pageWidth, pageHeight, a),
          fontFamily: boxStyle.fontFamily,
          fontSize: boxStyle.fontSize,
          fontWeight: boxStyle.fontWeight,
          fontStyle: boxStyle.fontStyle,
          textDecoration: boxStyle.textDecoration,
          color: boxStyle.color,
          textAlign: boxStyle.textAlign,
          paddingLeft: boxStyle.paddingLeft,
          lineHeight: 1.05,
        }}
        value={display}
        placeholder={a.source === "user" && active ? t("edit.addText") : ""}
        onChange={(e) => {
          let next = e.target.value;
          if (prefix && next.startsWith(prefix)) next = next.slice(prefix.length);
          const el = e.currentTarget;
          const extra =
            el.scrollHeight > el.clientHeight + 2
              ? (el.scrollHeight - el.clientHeight) / pageHeight
              : 0;
          onChange({
            text: next,
            h: extra ? Math.min(1 - a.y, a.h + extra) : a.h,
          });
        }}
        onFocus={onSelect}
        onKeyDown={(e) => e.stopPropagation()}
      />
      {chrome ? (
        <button
          type="button"
          className="absolute -bottom-1.5 -end-1.5 z-10 size-3 cursor-nwse-resize rounded-sm border border-accent bg-surface"
          aria-label={t("edit.resize")}
          onPointerDown={startDrag("resize")}
          onPointerMove={onDragMove}
          onPointerUp={onDragUp}
        />
      ) : null}
    </div>
  );
}

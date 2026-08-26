import { MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Annotation, Tool } from "@/lib/types";

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
    const el = document.querySelector<HTMLTextAreaElement>(
      `textarea[data-annot-id="${id}"]`,
    );
    if (!el) return false;
    el.focus();
    const len = el.value.length;
    try {
      el.setSelectionRange(len, len);
    } catch {
      /* ignore */
    }
    return true;
  };
  if (run()) return;
  requestAnimationFrame(() => {
    if (run()) return;
    window.setTimeout(run, 40);
  });
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
  const printMode = useAppStore((s) => s.printMode);
  const [visible, setVisible] = useState(displayIndex < 3);
  const [height, setHeight] = useState(width * 1.294);
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
      setHeight(viewport.height);
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

  const local = (e: React.PointerEvent) => {
    const r = hostRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) / r.width,
      y: (e.clientY - r.top) / r.height,
    };
  };

  const drawing = tool === "redact" || tool === "highlight";
  const placing = tool === "text" || tool === "comment" || tool === "sign";

  const onPointerDown = (e: React.PointerEvent) => {
    if (tool === "select" || tool === "pan") return;
    const target = e.target as HTMLElement;
    if (target.closest("[data-annot]")) return;

    const p = local(e);
    if (drawing) {
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      draft.current = { x: p.x, y: p.y, w: 0, h: 0 };
      setDraftBox(draft.current);
    } else if (placing) {
      if (tool === "sign") {
        if (!activeSignature) return;
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
      } else if (tool === "text") {
        const id = addAnnotation({
          type: "text",
          pageIndex: originalIndex,
          x: Math.min(p.x, 0.72),
          y: Math.min(p.y, 0.92),
          w: 0.28,
          h: 0.06,
          text: "",
        });
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
        });
        setRightTab("comments");
        focusAnnotField(id);
      }
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

  const pageAnnots = annotations.filter((a) => a.pageIndex === originalIndex);

  return (
    <div
      ref={hostRef}
      className="page-sheet relative mx-auto bg-white shadow-[var(--shadow-border)]"
      style={{ width, height }}
      data-page={displayIndex + 1}
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      <div
        ref={textRef}
        className="textLayer"
        onMouseUp={onTextSelect}
        style={{ pointerEvents: tool === "select" ? "auto" : "none" }}
      />
      <div
        className={cn(
          "annot-layer absolute inset-0",
          (tool === "select" || tool === "pan") && "pointer-events-none",
          tool === "pan" && "cursor-grab",
          drawing && "cursor-crosshair",
          placing && "cursor-copy",
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
            onSelect={() => setActiveAnnotation(a.id)}
            onChange={(patch) => updateAnnotation(a.id, patch)}
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
  onSelect,
  onChange,
  onRemove,
  t,
}: {
  a: Annotation;
  active: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<Annotation>) => void;
  onRemove: () => void;
  t: ReturnType<typeof useT>;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!active) return;
    if (a.type !== "text" && a.type !== "comment") return;
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
  }, [active, a.type, a.id]);

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
      <button
        type="button"
        data-annot={a.id}
        className={cn("absolute", active && "ring-2 ring-accent")}
        style={style}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onDoubleClick={onRemove}
      >
        {a.imageDataUrl ? (
          <img
            src={a.imageDataUrl}
            alt={a.text || t("action.sign")}
            className="size-full object-contain"
            draggable={false}
          />
        ) : null}
      </button>
    );
  }
  if (a.type === "text") {
    return (
      <textarea
        ref={inputRef}
        data-annot={a.id}
        data-annot-id={a.id}
        className={cn(
          "absolute resize-none p-1.5 text-sm leading-snug text-ink outline-none",
          active
            ? "bg-surface ring-2 ring-accent"
            : "border border-dashed border-accent/50 bg-surface/70",
        )}
        style={style}
        value={a.text ?? ""}
        placeholder={t("tool.text")}
        autoFocus={active}
        onFocus={onSelect}
        onChange={(e) => onChange({ text: e.target.value })}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      />
    );
  }
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
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <MessageSquare className="size-3.5" />
      </button>
      {active ? (
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
            onKeyDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          />
          <button type="button" className="text-xs text-danger" onClick={onRemove}>
            {t("action.delete")}
          </button>
        </div>
      ) : null}
    </div>
  );
}

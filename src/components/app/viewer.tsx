import { useEffect, useRef, useState } from "react";
import { getPageMetrics } from "@/lib/pdf/engine";
import { useAppStore } from "@/lib/store";
import { PageView } from "./page-view";

export function Viewer() {
  const pageOrder = useAppStore((s) => s.pageOrder);
  const rotations = useAppStore((s) => s.rotations);
  const scale = useAppStore((s) => s.scale);
  const fit = useAppStore((s) => s.fit);
  const tool = useAppStore((s) => s.tool);
  const zoomTick = useAppStore((s) => s.zoomTick);
  const setScale = useAppStore((s) => s.setScale);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const scroller = useRef<HTMLDivElement>(null);
  const [pageWidth, setPageWidth] = useState(700);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let cancelled = false;
    const apply = async () => {
      const first = pageOrder[0] ?? 0;
      const m = await getPageMetrics(first + 1, rotations[first] ?? 0);
      if (cancelled) return;
      const avail = Math.max(240, el.clientWidth - 48);
      const availH = Math.max(240, el.clientHeight - 48);
      if (fit === "width") {
        const next = Math.max(0.35, avail / m.width);
        setPageWidth(m.width * next);
        setScale(next, "width");
      } else if (fit === "page") {
        const s = Math.max(0.25, Math.min(avail / m.width, availH / m.height));
        setPageWidth(m.width * s);
        setScale(s, "page");
      }
    };
    void apply();
    return () => {
      cancelled = true;
    };
  }, [fit, pageOrder, rotations, setScale]);

  useEffect(() => {
    if (fit !== "custom") return;
    const first = pageOrder[0] ?? 0;
    void getPageMetrics(first + 1, rotations[first] ?? 0).then((m) => {
      setPageWidth(m.width * scale);
    });
  }, [fit, scale, pageOrder, rotations]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => {
      const pages = el.querySelectorAll<HTMLElement>("[data-page]");
      const mid = el.scrollTop + el.clientHeight * 0.35;
      let best = 1;
      pages.forEach((p) => {
        const top = p.offsetTop;
        if (top <= mid) best = Number(p.dataset.page) || best;
      });
      setCurrentPage(best);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [setCurrentPage]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setScale(scale + (e.deltaY < 0 ? 0.08 : -0.08), "custom");
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [scale, setScale]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    if (tool !== "pan") {
      el.style.cursor = "";
      el.style.touchAction = "";
      el.style.userSelect = "";
      return;
    }
    el.style.cursor = "grab";
    el.style.touchAction = "none";
    el.style.userSelect = "none";
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
      e.preventDefault();
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      el.scrollLeft -= e.clientX - lastX;
      el.scrollTop -= e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      el.style.cursor = "grab";
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    };
    el.addEventListener("pointerdown", onDown, true);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown, true);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [tool]);

  return (
    <div
      ref={scroller}
      className="print-pages h-full overflow-auto px-3 py-6 md:px-8"
      style={{ cursor: tool === "pan" ? "grab" : undefined }}
    >
      <div className="mx-auto flex flex-col gap-6 print:gap-0">
        {pageOrder.map((original, display) => (
          <PageView
            key={`${original}-${rotations[original] ?? 0}-${zoomTick}`}
            originalIndex={original}
            displayIndex={display}
            width={pageWidth}
            rotation={rotations[original] ?? 0}
            scale={scale}
            tool={tool}
          />
        ))}
      </div>
    </div>
  );
}

export function scrollToPage(n: number) {
  const el = document.querySelector(`[data-page="${n}"]`);
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

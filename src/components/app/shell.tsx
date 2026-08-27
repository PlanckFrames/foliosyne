import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  BookmarkPlus,
  Bold,
  Check,
  ChevronDown,
  ChevronUp,
  FileOutput,
  FilePlus,
  FileUp,
  Globe,
  Hand,
  HelpCircle,
  Highlighter,
  ImagePlus,
  Italic,
  Languages,
  List,
  Lock,
  Menu,
  MessageSquare,
  Moon,
  MousePointer2,
  Palette,
  Pencil,
  PenLine,
  Printer,
  Undo2,
  Redo2,
  RotateCw,
  Scaling,
  Save,
  Scan,
  Share2,
  SquareDashed,
  Strikethrough,
  Subscript,
  Sun,
  Superscript,
  Type,
  Underline,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Tip, TooltipProvider } from "@/components/ui/tooltip";
import { LANGS, langMeta } from "@/lib/i18n";
import { getFile, listRecentMeta } from "@/lib/idb";
import { ingestFile, ingestPdf, openBlankDocument, openSampleDocument } from "@/lib/open-document";
import { seedPageEdits, EDIT_FONTS } from "@/lib/edit-pdf";
import { detectHeadings } from "@/lib/pdf/engine";
import { bakePdf } from "@/lib/pdf/mutate";
import { printStudio } from "@/lib/print";
import { useAppStore, useT } from "@/lib/store";
import type { Annotation, RecentFile, Tool, UiLang } from "@/lib/types";
import { bytesToBlob, downloadBlob, formatBytes } from "@/lib/utils";
import { FolioMark } from "./mark";
import { AppPanels } from "./panels";
import { FilePicker } from "./file-picker";
import { ColorPop } from "./color-pop";
import { scrollToPage, Viewer } from "./viewer";

export function AppShell() {
  const theme = useAppStore((s) => s.theme);
  const lang = useAppStore((s) => s.lang);
  const bytes = useAppStore((s) => s.bytes);
  const loading = useAppStore((s) => s.loading);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("foliosyne-settings");
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        theme?: "light" | "dark";
        lang?: UiLang;
        homePrinter?: string;
        workPrinter?: string;
        signatures?: { id: string; name: string; kind: "typed" | "initials" | "upload"; dataUrl: string }[];
      };
      const s = useAppStore.getState();
      if (parsed.theme === "dark" || parsed.theme === "light") s.setTheme(parsed.theme);
      if (parsed.lang) s.setLang(parsed.lang);
      if (parsed.homePrinter && parsed.workPrinter) {
        s.setPrinters(parsed.homePrinter, parsed.workPrinter);
      }
      if (Array.isArray(parsed.signatures)) {
        for (const sig of parsed.signatures) {
          if (!s.signatures.some((x) => x.id === sig.id)) s.addSignature(sig);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const meta = langMeta(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = meta.dir;
  }, [lang]);

  useHotkeys();

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const open = q.get("open");
    if (open === "sample") {
      window.history.replaceState({}, "", window.location.pathname);
      void openSampleDocument();
    } else if (open === "drive") {
      window.history.replaceState({}, "", window.location.pathname);
      useAppStore.getState().setPanel("share");
    }
  }, []);

  useEffect(() => {
    if (!loading) return;
    const id = window.setTimeout(() => {
      const s = useAppStore.getState();
      if (!s.loading) return;
      s.setLoading(false);
      s.setStatus("");
      toast.error("That took too long. Try the sample document or another file.");
    }, 25000);
    return () => window.clearTimeout(id);
  }, [loading]);

  return (
    <TooltipProvider>
      <div className="paper-grain flex h-dvh min-h-0 flex-col bg-bg text-fg print-root">
        <TopBar />
        {bytes ? <Studio /> : <EmptyState />}
        <AppPanels />
        <Toaster
          theme={theme}
          position="bottom-center"
          toastOptions={{ className: "font-sans" }}
        />
      </div>
    </TooltipProvider>
  );
}

function useHotkeys() {
  const setScale = useAppStore((s) => s.setScale);
  const scale = useAppStore((s) => s.scale);
  const setPanel = useAppStore((s) => s.setPanel);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const currentPage = useAppStore((s) => s.currentPage);
  const pageCount = useAppStore((s) => s.pageCount);
  const removeAnnotation = useAppStore((s) => s.removeAnnotation);
  const activeAnnotation = useAppStore((s) => s.activeAnnotation);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "o") {
        e.preventDefault();
        document.getElementById("file-open")?.click();
      }
      if (meta && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setPanel("save");
      }
      if (meta && e.key.toLowerCase() === "p") {
        e.preventDefault();
        void printStudio();
      }
      if (meta && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        setScale(scale + 0.1);
      }
      if (meta && e.key === "-") {
        e.preventDefault();
        setScale(scale - 0.1);
      }
      if (meta && e.key === "0") {
        e.preventDefault();
        setScale(1, "width");
      }
      if (e.key === "PageDown") {
        e.preventDefault();
        const n = Math.min(pageCount, currentPage + 1);
        setCurrentPage(n);
        scrollToPage(n);
      }
      if (e.key === "PageUp") {
        e.preventDefault();
        const n = Math.max(1, currentPage - 1);
        setCurrentPage(n);
        scrollToPage(n);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) useAppStore.getState().redo();
        else useAppStore.getState().undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        useAppStore.getState().redo();
      }
      if (e.key === "Escape") {
        setPanel(null);
        useAppStore.getState().setActiveAnnotation(null);
      }
      if ((e.key === "Delete" || e.key === "Backspace") && activeAnnotation) {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        removeAnnotation(activeAnnotation);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    scale,
    setScale,
    setPanel,
    currentPage,
    pageCount,
    setCurrentPage,
    activeAnnotation,
    removeAnnotation,
  ]);
}

async function saveCurrent() {
  const s = useAppStore.getState();
  if (!s.bytes) return;
  s.setStatus("saving");
  try {
    const out = await bakePdf({
      bytes: s.bytes,
      pageOrder: s.pageOrder,
      rotations: s.rotations,
      annotations: s.annotations,
      userPassword: s.userPassword || undefined,
      openPassword: s.password || undefined,
    });
    downloadBlob(bytesToBlob(out, "application/pdf"), s.name || "foliosyne.pdf");
    s.markSaved();
    toast.success("PDF");
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "Save failed");
  } finally {
    s.setStatus("");
  }
}

function TopBar() {
  const t = useT();
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const lang = useAppStore((s) => s.lang);
  const setLang = useAppStore((s) => s.setLang);
  const setPanel = useAppStore((s) => s.setPanel);
  const name = useAppStore((s) => s.name);
  const dirty = useAppStore((s) => s.dirty);
  const bytes = useAppStore((s) => s.bytes);
  const setLeftOpen = useAppStore((s) => s.setLeftOpen);
  const leftOpen = useAppStore((s) => s.leftOpen);
  const canUndo = useAppStore((s) => s.past.length > 0);
  const canRedo = useAppStore((s) => s.future.length > 0);
  const undo = useAppStore((s) => s.undo);
  const redo = useAppStore((s) => s.redo);

  return (
    <header className="no-print flex h-14 shrink-0 items-center gap-2 border-b border-border bg-surface/90 px-2 backdrop-blur md:px-4">
      <Button
        variant="ghost"
        size="icon-sm"
        className="md:hidden"
        aria-label="Menu"
        onClick={() => setLeftOpen(!leftOpen)}
      >
        <Menu />
      </Button>
      <FolioMark className="size-8 shrink-0" />
      <div className="min-w-0">
        <div className="font-display text-base font-medium leading-tight tracking-tight">
          {t("app.name")}
        </div>
        <div className="hidden truncate text-[11px] text-muted sm:block">
          {name ? `${name}${dirty ? " · " + t("status.unsaved") : ""}` : t("app.tagline")}
        </div>
      </div>
      <div className="ms-auto flex items-center gap-1">
        <FilePicker
          id="file-open"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onFile={(f) => void ingestFile(f)}
        >
          {(pick) => (
            <Tip label={t("action.open")}>
              <Button
                variant="ghost"
                size="icon-sm"
                type="button"
                aria-label={t("action.open")}
                onClick={pick}
              >
                <FileUp />
              </Button>
            </Tip>
          )}
        </FilePicker>
        <Tip label={t("file.blank")}>
          <Button
            variant="ghost"
            size="icon-sm"
            type="button"
            aria-label={t("file.blank")}
            onClick={() => void openBlankDocument()}
          >
            <FilePlus />
          </Button>
        </Tip>
        <Tip label={t("action.save")}>
          <Button variant="ghost" size="icon-sm" aria-label={t("action.save")} disabled={!bytes} onClick={() => setPanel("save")}>
            <Save />
          </Button>
        </Tip>
        <Tip label={`${t("action.undo")} (Ctrl+Z)`}>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("action.undo")}
            disabled={!bytes || !canUndo}
            onClick={() => undo()}
          >
            <Undo2 />
          </Button>
        </Tip>
        <Tip label={`${t("action.redo")} (Ctrl+Y)`}>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("action.redo")}
            disabled={!bytes || !canRedo}
            onClick={() => redo()}
          >
            <Redo2 />
          </Button>
        </Tip>
        <Tip label={t("action.print")}>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("action.print")}
            disabled={!bytes}
            onClick={() => void printStudio()}
          >
            <Printer />
          </Button>
        </Tip>
        <Tip label={t("action.share")}>
          <Button variant="ghost" size="icon-sm" aria-label={t("action.share")} disabled={!bytes} onClick={() => setPanel("share")}>
            <Share2 />
          </Button>
        </Tip>
        <Tip label={t("action.convert")}>
          <Button variant="ghost" size="icon-sm" aria-label={t("action.convert")} onClick={() => setPanel("convert")}>
            <FileOutput />
          </Button>
        </Tip>
        <div className="mx-1 hidden h-5 w-px bg-border sm:block" />
        <label className="relative hidden sm:flex">
          <Globe className="pointer-events-none absolute start-2 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
          <select
            aria-label={t("lang.label")}
            className="h-8 max-w-36 appearance-none rounded-sm border border-border bg-surface pe-6 ps-7 text-xs"
            value={lang}
            onChange={(e) => setLang(e.target.value as UiLang)}
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <Tip label={theme === "light" ? t("theme.dark") : t("theme.light")}>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={theme === "light" ? t("theme.dark") : t("theme.light")}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? <Moon /> : <Sun />}
          </Button>
        </Tip>
        <Tip label={t("help.title")}>
          <Button variant="ghost" size="icon-sm" aria-label={t("help.title")} onClick={() => setPanel("help")}>
            <HelpCircle />
          </Button>
        </Tip>
      </div>
    </header>
  );
}

function Studio() {
  return (
    <div className="flex min-h-0 flex-1">
      <LeftRail />
      <div className="flex min-w-0 flex-1 flex-col">
        <ToolStrip />
        <EditBar />
        <div className="min-h-0 flex-1">
          <Viewer />
        </div>
        <StatusBar />
      </div>
      <RightRail />
    </div>
  );
}

function ToolStrip() {
  const t = useT();
  const tool = useAppStore((s) => s.tool);
  const setTool = useAppStore((s) => s.setTool);
  const setPanel = useAppStore((s) => s.setPanel);
  const setScale = useAppStore((s) => s.setScale);
  const scale = useAppStore((s) => s.scale);
  const currentPage = useAppStore((s) => s.currentPage);
  const pageCount = useAppStore((s) => s.pageCount);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const pageOrder = useAppStore((s) => s.pageOrder);

  const tools: {
    id: Tool;
    icon: typeof MousePointer2;
    key: Parameters<typeof t>[0];
    help: Parameters<typeof t>[0];
  }[] = [
    { id: "select", icon: MousePointer2, key: "tool.select", help: "tool.help.select" },
    { id: "pan", icon: Hand, key: "tool.pan", help: "tool.help.pan" },
    { id: "edit", icon: Pencil, key: "tool.edit", help: "tool.help.edit" },
    { id: "highlight", icon: Highlighter, key: "tool.highlight", help: "tool.help.highlight" },
    { id: "comment", icon: MessageSquare, key: "tool.comment", help: "tool.help.comment" },
    { id: "redact", icon: Scan, key: "tool.redact", help: "tool.help.redact" },
    { id: "sign", icon: PenLine, key: "tool.sign", help: "tool.help.sign" },
  ];

  return (
    <div className="no-print flex flex-wrap items-center gap-1 border-b border-border bg-surface px-2 py-1.5">
      {tools.map((item) => {
        const Icon = item.icon;
        return (
          <Tip key={item.id} label={`${t(item.key)} — ${t(item.help)}`}>
            <Button
              variant={tool === item.id ? "default" : "ghost"}
              size="icon-sm"
              aria-label={t(item.key)}
              aria-pressed={tool === item.id}
              onClick={() => {
                if (item.id === "sign") setPanel("sign");
                setTool(item.id);
                if (item.id === "edit") {
                  useAppStore.getState().setEditGesture("select");
                  const st = useAppStore.getState();
                  const orig = st.pageOrder[st.currentPage - 1] ?? 0;
                  void seedPageEdits(orig, st.rotations[orig] ?? 0);
                }
              }}
            >
              <Icon />
            </Button>
          </Tip>
        );
      })}
      <div className="mx-1 h-5 w-px bg-border" />
      <span className="px-1 text-xs tabular-nums text-muted">{Math.round(scale * 100)}%</span>
      <Tip label={t("view.zoomOut")}>
        <Button variant="ghost" size="icon-sm" aria-label={t("view.zoomOut")} onClick={() => setScale(scale - 0.1)}>
          <ZoomOut />
        </Button>
      </Tip>
      <Tip label={t("view.zoomIn")}>
        <Button variant="ghost" size="icon-sm" aria-label={t("view.zoomIn")} onClick={() => setScale(scale + 0.1)}>
          <ZoomIn />
        </Button>
      </Tip>
      <Button variant="ghost" size="sm" onClick={() => setScale(1, "width")}>
        {t("view.fitWidth")}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setScale(1, "page")}>
        {t("view.fitPage")}
      </Button>
      <div className="mx-1 h-5 w-px bg-border" />
      <Tip label={t("view.pageUp")}>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("view.pageUp")}
          onClick={() => {
            const n = Math.max(1, currentPage - 1);
            setCurrentPage(n);
            scrollToPage(n);
          }}
        >
          <ChevronUp />
        </Button>
      </Tip>
      <span className="min-w-24 px-1 text-center text-xs tabular-nums text-muted">
        {t("view.pageOf", { n: currentPage, total: pageCount })}
      </span>
      <Tip label={t("view.pageDown")}>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("view.pageDown")}
          onClick={() => {
            const n = Math.min(pageCount, currentPage + 1);
            setCurrentPage(n);
            scrollToPage(n);
          }}
        >
          <ChevronDown />
        </Button>
      </Tip>
      <Tip label={t("rotate.title")}>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("action.rotate")}
          onClick={() => setPanel("rotate")}
        >
          <RotateCw />
        </Button>
      </Tip>
      <Tip label={t("resize.title")}>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("resize.title")}
          onClick={() => setPanel("resize")}
        >
          <Scaling />
        </Button>
      </Tip>
      <Tip label={t("margins.title")}>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("margins.title")}
          onClick={() => setPanel("margins")}
        >
          <SquareDashed />
        </Button>
      </Tip>
      <div className="ms-auto flex items-center gap-1">
        <Tip label={t("action.translate")}>
          <Button variant="ghost" size="icon-sm" aria-label={t("action.translate")} onClick={() => setPanel("translate")}>
            <Languages />
          </Button>
        </Tip>
        <Tip label={t("action.protect")}>
          <Button variant="ghost" size="icon-sm" aria-label={t("action.protect")} onClick={() => setPanel("protect")}>
            <Lock />
          </Button>
        </Tip>
      </div>
    </div>
  );
}

function EditBar() {
  const t = useT();
  const tool = useAppStore((s) => s.tool);
  const editGesture = useAppStore((s) => s.editGesture);
  const setEditGesture = useAppStore((s) => s.setEditGesture);
  const confirmEdits = useAppStore((s) => s.confirmEdits);
  const setStatus = useAppStore((s) => s.setStatus);
  const updateAnnotation = useAppStore((s) => s.updateAnnotation);
  const activeAnnotation = useAppStore((s) => s.activeAnnotation);
  const annotations = useAppStore((s) => s.annotations);
  const currentPage = useAppStore((s) => s.currentPage);
  const pageOrder = useAppStore((s) => s.pageOrder);
  const movePage = useAppStore((s) => s.movePage);
  const setPanel = useAppStore((s) => s.setPanel);
  const setPendingImage = useAppStore((s) => s.setPendingImage);
  const setEyedropFor = useAppStore((s) => s.setEyedropFor);
  const eyedropFor = useAppStore((s) => s.eyedropFor);
  const picRef = useRef<HTMLInputElement>(null);
  const [colorOpen, setColorOpen] = useState(false);
  const active = annotations.find((a) => a.id === activeAnnotation && a.type === "edit");

  if (tool !== "edit") return null;

  const patch = (p: Partial<Annotation>) => {
    if (!active) return;
    updateAnnotation(active.id, p);
  };

  const addText = () => {
    setEditGesture("place");
    setStatus(t("edit.placeHint"));
  };

  const confirm = () => {
    confirmEdits();
    setStatus("");
    toast.success(t("edit.confirmed"));
  };

  const btn = (on: boolean) =>
    on ? "bg-accent text-accent-fg" : "text-fg hover:bg-paper";

  return (
    <div className="no-print flex flex-wrap items-center gap-1 border-b border-border bg-paper px-2 py-1.5">
      <span className="pe-2 text-[11px] font-medium uppercase tracking-wide text-subtle">
        {t("tool.edit")}
      </span>
      <Tip label={t("tool.select")}>
        <Button
          variant="ghost"
          size="icon-sm"
          className={btn(editGesture === "select")}
          aria-pressed={editGesture === "select"}
          aria-label={t("tool.select")}
          onClick={() => setEditGesture("select")}
        >
          <MousePointer2 />
        </Button>
      </Tip>
      <Tip label={t("tool.pan")}>
        <Button
          variant="ghost"
          size="icon-sm"
          className={btn(editGesture === "pan")}
          aria-pressed={editGesture === "pan"}
          aria-label={t("tool.pan")}
          onClick={() => setEditGesture("pan")}
        >
          <Hand />
        </Button>
      </Tip>
      <Tip label={t("edit.addText")}>
        <Button
          variant={editGesture === "place" ? "default" : "outline"}
          size="sm"
          onClick={addText}
        >
          <Type />
          {t("edit.addText")}
        </Button>
      </Tip>
      <select
        className="h-8 max-w-40 rounded-sm border border-border bg-surface px-2 text-xs"
        aria-label={t("edit.font")}
        value={active?.fontFamily || "Times New Roman"}
        onChange={(e) => patch({ fontFamily: e.target.value })}
      >
        {EDIT_FONTS.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>
      <input
        type="number"
        min={8}
        max={72}
        className="h-8 w-14 rounded-sm border border-border bg-surface px-1 text-xs"
        aria-label={t("edit.size")}
        value={Math.round(active?.fontSize || 12)}
        onChange={(e) => patch({ fontSize: Number(e.target.value) || 12 })}
      />
      <Tip label={t("edit.bold")}>
        <Button
          variant="ghost"
          size="icon-sm"
          className={btn(!!active?.bold)}
          aria-pressed={!!active?.bold}
          onClick={() => patch({ bold: !active?.bold })}
        >
          <Bold />
        </Button>
      </Tip>
      <Tip label={t("edit.italic")}>
        <Button
          variant="ghost"
          size="icon-sm"
          className={btn(!!active?.italic)}
          aria-pressed={!!active?.italic}
          onClick={() => patch({ italic: !active?.italic })}
        >
          <Italic />
        </Button>
      </Tip>
      <Tip label={t("edit.underline")}>
        <Button
          variant="ghost"
          size="icon-sm"
          className={btn(!!active?.underline)}
          aria-pressed={!!active?.underline}
          onClick={() => patch({ underline: !active?.underline })}
        >
          <Underline />
        </Button>
      </Tip>
      <Tip label={t("edit.strike")}>
        <Button
          variant="ghost"
          size="icon-sm"
          className={btn(!!active?.strike)}
          aria-pressed={!!active?.strike}
          onClick={() => patch({ strike: !active?.strike })}
        >
          <Strikethrough />
        </Button>
      </Tip>
      <Tip label={t("edit.super")}>
        <Button
          variant="ghost"
          size="icon-sm"
          className={btn(!!active?.superScript)}
          onClick={() => patch({ superScript: !active?.superScript, subScript: false })}
        >
          <Superscript />
        </Button>
      </Tip>
      <Tip label={t("edit.sub")}>
        <Button
          variant="ghost"
          size="icon-sm"
          className={btn(!!active?.subScript)}
          onClick={() => patch({ subScript: !active?.subScript, superScript: false })}
        >
          <Subscript />
        </Button>
      </Tip>
      <div className="relative">
        <button
          type="button"
          className="size-8 rounded-sm border border-border"
          aria-label={t("edit.color")}
          style={{ background: active?.color || "#1C1917" }}
          onClick={() => setColorOpen((v) => !v)}
        />
        {colorOpen ? (
          <div className="absolute start-0 top-9 z-40 rounded-md bg-surface p-2 shadow-[var(--shadow-border)]">
            <ColorPop
              value={active?.color || "#1C1917"}
              eyedropActive={eyedropFor === "font"}
              onEyedrop={() => {
                setEyedropFor(eyedropFor === "font" ? null : "font");
                setColorOpen(false);
              }}
              onChange={(hex) => patch({ color: hex })}
            />
          </div>
        ) : null}
      </div>
      <Tip label={t("color.page")}>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("color.page")}
          onClick={() => setPanel("pageColor")}
        >
          <Palette />
        </Button>
      </Tip>
      <input
        ref={picRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.currentTarget.value = "";
          if (!f) return;
          const reader = new FileReader();
          reader.onload = () => {
            const url = String(reader.result || "");
            if (!url) return;
            setPendingImage(url);
            setEditGesture("place");
            setStatus(t("edit.pictureHint"));
          };
          reader.readAsDataURL(f);
        }}
      />
      <Tip label={t("edit.picture")}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => picRef.current?.click()}
        >
          <ImagePlus />
          {t("edit.picture")}
        </Button>
      </Tip>
      <Tip label={t("edit.alignLeft")}>
        <Button
          variant="ghost"
          size="icon-sm"
          className={btn(active?.align === "left" || !active?.align)}
          onClick={() => patch({ align: "left" })}
        >
          <AlignLeft />
        </Button>
      </Tip>
      <Tip label={t("edit.alignCenter")}>
        <Button
          variant="ghost"
          size="icon-sm"
          className={btn(active?.align === "center")}
          onClick={() => patch({ align: "center" })}
        >
          <AlignCenter />
        </Button>
      </Tip>
      <Tip label={t("edit.alignRight")}>
        <Button
          variant="ghost"
          size="icon-sm"
          className={btn(active?.align === "right")}
          onClick={() => patch({ align: "right" })}
        >
          <AlignRight />
        </Button>
      </Tip>
      <Tip label={t("edit.indent")}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => patch({ indent: Math.min(48, (active?.indent || 0) + 12) })}
        >
          {t("edit.indent")}
        </Button>
      </Tip>
      <label className="flex items-center gap-1 text-xs text-muted">
        <List className="size-3.5" />
        <select
          className="h-8 rounded-sm border border-border bg-surface px-1 text-xs"
          aria-label={t("edit.bullet")}
          value={active?.list || "none"}
          onChange={(e) => patch({ list: e.target.value as Annotation["list"] })}
        >
          <option value="none">—</option>
          <option value="disc">{t("edit.bulletDisc")}</option>
          <option value="circle">{t("edit.bulletCircle")}</option>
          <option value="square">{t("edit.bulletSquare")}</option>
          <option value="dash">{t("edit.bulletDash")}</option>
        </select>
      </label>
      <div className="ms-auto flex items-center gap-1">
        <Tip label={t("edit.confirm")}>
          <Button variant="default" size="sm" onClick={confirm}>
            <Check />
            {t("edit.confirm")}
          </Button>
        </Tip>
        <Tip label={t("view.moveUp")}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => movePage(currentPage - 1, -1)}
          >
            <ChevronUp />
            {t("view.moveUp")}
          </Button>
        </Tip>
        <Tip label={t("view.moveDown")}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => movePage(currentPage - 1, 1)}
          >
            <ChevronDown />
            {t("view.moveDown")}
          </Button>
        </Tip>
      </div>
    </div>
  );
}

function LeftRail() {
  const t = useT();
  const pageOrder = useAppStore((s) => s.pageOrder);
  const currentPage = useAppStore((s) => s.currentPage);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const leftOpen = useAppStore((s) => s.leftOpen);
  const setLeftOpen = useAppStore((s) => s.setLeftOpen);

  return (
    <>
      {leftOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-ink/20 md:hidden"
          aria-label={t("action.close")}
          onClick={() => setLeftOpen(false)}
        />
      ) : null}
      <aside
        className={`no-print z-30 w-44 shrink-0 overflow-auto border-e border-border bg-surface p-3 ${
          leftOpen ? "fixed inset-y-14 start-0 md:static md:inset-auto" : "hidden md:block"
        }`}
      >
        <h2 className="text-[11px] font-medium uppercase tracking-wide text-subtle">{t("sidebar.pages")}</h2>
        <ol className="mt-2 grid grid-cols-2 gap-2">
          {pageOrder.map((original, display) => {
            const n = display + 1;
            return (
              <li key={`${original}-${display}`}>
                <button
                  type="button"
                  className={`flex aspect-[3/4] w-full cursor-pointer items-center justify-center rounded-sm bg-paper text-sm tabular-nums shadow-[var(--shadow-border)] ${
                    currentPage === n ? "ring-2 ring-accent" : "hover:bg-bg"
                  }`}
                  onClick={() => {
                    setCurrentPage(n);
                    scrollToPage(n);
                    setLeftOpen(false);
                  }}
                >
                  {n}
                </button>
              </li>
            );
          })}
        </ol>
      </aside>
    </>
  );
}

function RightRail() {
  const t = useT();
  const rightTab = useAppStore((s) => s.rightTab);
  const setRightTab = useAppStore((s) => s.setRightTab);
  const bookmarks = useAppStore((s) => s.bookmarks);
  const addBookmark = useAppStore((s) => s.addBookmark);
  const removeBookmark = useAppStore((s) => s.removeBookmark);
  const setBookmarks = useAppStore((s) => s.setBookmarks);
  const currentPage = useAppStore((s) => s.currentPage);
  const pageOrder = useAppStore((s) => s.pageOrder);
  const pageCount = useAppStore((s) => s.pageCount);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const annotations = useAppStore((s) => s.annotations);
  const updateAnnotation = useAppStore((s) => s.updateAnnotation);
  const setActiveAnnotation = useAppStore((s) => s.setActiveAnnotation);
  const comments = annotations.filter((a) => a.type === "comment");

  return (
    <aside className="no-print hidden w-64 shrink-0 flex-col overflow-auto border-s border-border bg-surface lg:flex">
      <div className="flex border-b border-border">
        <button
          type="button"
          className={`flex-1 cursor-pointer px-3 py-2 text-xs font-medium ${rightTab === "bookmarks" ? "border-b-2 border-accent text-fg" : "text-muted"}`}
          onClick={() => setRightTab("bookmarks")}
        >
          {t("sidebar.bookmarks")}
        </button>
        <button
          type="button"
          className={`flex-1 cursor-pointer px-3 py-2 text-xs font-medium ${rightTab === "comments" ? "border-b-2 border-accent text-fg" : "text-muted"}`}
          onClick={() => setRightTab("comments")}
        >
          {t("sidebar.comments")}
        </button>
      </div>
      {rightTab === "bookmarks" ? (
        <div className="flex flex-col gap-2 p-3">
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="secondary"
              className="flex-1"
              onClick={async () => {
                try {
                  const auto = await detectHeadings(
                    pageCount,
                    pageOrder,
                  );
                  if (auto.length) setBookmarks(auto);
                  else toast.message(t("sidebar.noBookmarks"));
                } catch {
                  toast.error(t("sidebar.noBookmarks"));
                }
              }}
            >
              {t("sidebar.autoHeadings")}
            </Button>
            <Tip label={t("sidebar.addBookmark")}>
              <Button
                size="icon-sm"
                variant="outline"
                aria-label={t("sidebar.addBookmark")}
                onClick={() => {
                  const pageIndex = pageOrder[currentPage - 1] ?? 0;
                  addBookmark({ title: `${t("sidebar.bookmarkName")} ${currentPage}`, pageIndex });
                }}
              >
                <BookmarkPlus />
              </Button>
            </Tip>
          </div>
          {bookmarks.length === 0 ? (
            <p className="text-xs text-muted">{t("sidebar.noBookmarks")}</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {bookmarks.map((b) => {
                const n = Math.max(1, pageOrder.indexOf(b.pageIndex) + 1);
                return (
                  <li key={b.id} className="flex items-center gap-1">
                    <button
                      type="button"
                      className="min-w-0 flex-1 cursor-pointer truncate rounded-sm px-2 py-1.5 text-start text-sm hover:bg-paper"
                      onClick={() => {
                        setCurrentPage(n);
                        scrollToPage(n);
                      }}
                    >
                      {b.title}
                    </button>
                    <button
                      type="button"
                      className="cursor-pointer px-1 text-xs text-subtle hover:text-danger"
                      onClick={() => removeBookmark(b.id)}
                      aria-label={t("action.delete")}
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2 p-3">
          {comments.length === 0 ? (
            <p className="text-xs text-muted">{t("sidebar.noComments")}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {comments.map((c) => (
                <li key={c.id}>
                  <textarea
                    data-annot-id={c.id}
                    className="w-full resize-y rounded-sm border border-border bg-paper p-2 text-sm"
                    rows={3}
                    placeholder={t("comment.placeholder")}
                    value={c.text ?? ""}
                    onFocus={() => {
                      setActiveAnnotation(c.id);
                      const n = Math.max(1, pageOrder.indexOf(c.pageIndex) + 1);
                      setCurrentPage(n);
                      scrollToPage(n);
                    }}
                    onChange={(e) => updateAnnotation(c.id, { text: e.target.value })}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </aside>
  );
}

function StatusBar() {
  const t = useT();
  const loading = useAppStore((s) => s.loading);
  const status = useAppStore((s) => s.status);
  const pageCount = useAppStore((s) => s.pageCount);
  const userPassword = useAppStore((s) => s.userPassword);
  return (
    <footer className="no-print flex h-8 items-center gap-3 border-t border-border bg-surface px-3 text-[11px] text-muted">
      <span>{loading ? t("status.loading") : status || t("status.ready")}</span>
      <span className="tabular-nums">{t("status.pages", { n: pageCount })}</span>
      {userPassword ? <span className="text-warn">{t("protect.locked")}</span> : null}
    </footer>
  );
}

function EmptyState() {
  const t = useT();
  const loading = useAppStore((s) => s.loading);
  const status = useAppStore((s) => s.status);
  const [recent, setRecent] = useState<RecentFile[]>([]);
  const [over, setOver] = useState(false);
  const drag = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void listRecentMeta()
      .then(setRecent)
      .catch(() => setRecent([]));
  }, [loading]);

  const pickFile = () => {
    const el = fileRef.current;
    if (!el) {
      toast.error("File picker is not ready yet — try again.");
      return;
    }
    el.value = "";
    el.click();
  };

  return (
    <main
      className="flex min-h-0 flex-1 flex-col items-center overflow-auto px-4 py-10"
      onDragEnter={(e) => {
        e.preventDefault();
        drag.current += 1;
        setOver(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => {
        drag.current -= 1;
        if (drag.current <= 0) setOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        drag.current = 0;
        setOver(false);
        const f = e.dataTransfer.files[0];
        if (f) void ingestFile(f);
      }}
    >
      <input
        ref={fileRef}
        id="empty-file-open"
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="file-ghost"
        tabIndex={-1}
        aria-hidden="true"
        suppressHydrationWarning
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void ingestFile(f);
          e.currentTarget.value = "";
        }}
      />
      <div className="mx-auto w-full max-w-xl">
        <p className="font-display text-3xl font-medium tracking-tight md:text-4xl">
          {t("empty.title")}
        </p>
        <p className="mt-3 max-w-prose text-muted">{t("empty.body")}</p>
        <div
          className={`mt-8 rounded-xl bg-surface p-6 shadow-[var(--shadow-border)] ${over ? "ring-2 ring-accent" : ""}`}
        >
          <p className="font-medium">{t("file.dropTitle")}</p>
          <p className="mt-1 text-sm text-muted">{t("file.dropHint")}</p>
          <div className="mt-5 flex flex-wrap gap-2" id="empty-actions">
            <Button
              type="button"
              aria-label={t("file.browse")}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                pickFile();
              }}
            >
              {t("file.browse")}
            </Button>
            <Button
              type="button"
              variant="outline"
              aria-label={t("file.blank")}
              disabled={loading}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void openBlankDocument();
              }}
            >
              {t("file.blank")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              aria-label={t("file.sample")}
              disabled={loading}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void openSampleDocument();
              }}
            >
              {loading ? t("status.loading") : t("file.sample")}
            </Button>
            <Button
              type="button"
              variant="outline"
              aria-label={t("file.openDrive")}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                useAppStore.getState().setPanel("share");
              }}
            >
              {t("file.openDrive")}
            </Button>
          </div>
          {loading ? (
            <p className="mt-4 text-sm text-muted" role="status">
              {status || t("status.loading")}
            </p>
          ) : null}
        </div>
        <section className="mt-8">
          <h2 className="text-xs font-medium uppercase tracking-wide text-subtle">
            {t("file.recent")}
          </h2>
          {recent.length === 0 ? (
            <p className="mt-2 text-sm text-muted">{t("file.noRecent")}</p>
          ) : (
            <ul className="mt-2 divide-y divide-border rounded-lg bg-surface">
              {recent.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-start text-sm hover:bg-paper"
                    onClick={() => {
                      void (async () => {
                        const row = await getFile(r.id);
                        if (!row) return;
                        await ingestPdf(new Uint8Array(row.bytes), row.name);
                      })();
                    }}
                  >
                    <span className="truncate">{r.name}</span>
                    <span className="text-xs text-subtle">{formatBytes(r.size)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <p className="mt-10 text-xs text-subtle">{t("app.subtitle")}</p>
      </div>
    </main>
  );
}

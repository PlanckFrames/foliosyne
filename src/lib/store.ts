import { create } from "zustand";
import type {
  Annotation,
  Bookmark,
  EditGesture,
  Panel,
  SavedSignature,
  TextSelection,
  Theme,
  Tool,
  UiLang,
} from "./types";
import { translate } from "./i18n";
import { uid } from "./utils";

const SETTINGS_KEY = "foliosyne-settings";

type DocSnapshot = {
  annotations: Annotation[];
  rotations: Record<number, number>;
  pageOrder: number[];
  bookmarks: Bookmark[];
  userPassword: string;
};

function cloneSnap(s: {
  annotations: Annotation[];
  rotations: Record<number, number>;
  pageOrder: number[];
  bookmarks: Bookmark[];
  userPassword: string;
}): DocSnapshot {
  return {
    annotations: s.annotations.map((a) => ({ ...a })),
    rotations: { ...s.rotations },
    pageOrder: [...s.pageOrder],
    bookmarks: s.bookmarks.map((b) => ({ ...b })),
    userPassword: s.userPassword,
  };
}

function rotateBox(
  r: { x: number; y: number; w: number; h: number },
  delta: number,
) {
  const d = ((delta % 360) + 360) % 360;
  if (d === 90) return { x: 1 - r.y - r.h, y: r.x, w: r.h, h: r.w };
  if (d === 180) return { x: 1 - r.x - r.w, y: 1 - r.y - r.h, w: r.w, h: r.h };
  if (d === 270) return { x: r.y, y: 1 - r.x - r.w, w: r.h, h: r.w };
  return r;
}

let historyLock = false;
let historyTimer: ReturnType<typeof setTimeout> | null = null;

interface Settings {
  theme: Theme;
  lang: UiLang;
  homePrinter: string;
  workPrinter: string;
  signatures: SavedSignature[];
}

function loadSettings(): Settings {
  return {
    theme: "light",
    lang: "en",
    homePrinter: "Home printer",
    workPrinter: "Work printer",
    signatures: [],
  };
}

function persist(s: Pick<AppState, keyof Settings>) {
  try {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        theme: s.theme,
        lang: s.lang,
        homePrinter: s.homePrinter,
        workPrinter: s.workPrinter,
        signatures: s.signatures,
      }),
    );
  } catch {
    /* quota */
  }
}

export interface AppState {
  theme: Theme;
  lang: UiLang;
  homePrinter: string;
  workPrinter: string;
  signatures: SavedSignature[];

  name: string;
  kind: "pdf" | "docx" | null;
  bytes: Uint8Array | null;
  pageCount: number;
  pageOrder: number[];
  rotations: Record<number, number>;
  annotations: Annotation[];
  bookmarks: Bookmark[];
  currentPage: number;
  scale: number;
  fit: "width" | "page" | "custom";
  tool: Tool;
  editGesture: EditGesture;
  panel: Panel;
  status: string;
  dirty: boolean;
  loading: boolean;
  password: string;
  pendingPassword: boolean;
  pendingBytes: Uint8Array | null;
  pendingName: string;
  userPassword: string;
  selection: TextSelection | null;
  activeAnnotation: string | null;
  activeSignature: SavedSignature | null;
  draftComment: string;
  leftOpen: boolean;
  rightTab: "bookmarks" | "comments";
  zoomTick: number;
  printMode: boolean;
  past: DocSnapshot[];
  future: DocSnapshot[];

  setTheme: (theme: Theme) => void;
  setLang: (lang: UiLang) => void;
  setPrinters: (home: string, work: string) => void;
  addSignature: (sig: SavedSignature) => void;
  removeSignature: (id: string) => void;
  setActiveSignature: (sig: SavedSignature | null) => void;

  resetDocument: () => void;
  setDocument: (opts: {
    name: string;
    kind: "pdf" | "docx";
    bytes: Uint8Array;
    pageCount: number;
  }) => void;
  setLoading: (v: boolean) => void;
  setStatus: (s: string) => void;
  setScale: (n: number, fit?: AppState["fit"]) => void;
  setTool: (t: Tool) => void;
  setEditGesture: (g: EditGesture) => void;
  confirmEdits: () => void;
  setPanel: (p: Panel) => void;
  setCurrentPage: (n: number) => void;
  setSelection: (s: TextSelection | null) => void;
  setPasswordGate: (bytes: Uint8Array, name: string) => void;
  clearPasswordGate: () => void;
  setOpenPassword: (p: string) => void;
  setUserPassword: (p: string) => void;
  addAnnotation: (a: Omit<Annotation, "id" | "createdAt"> & { id?: string }) => string;
  updateAnnotation: (id: string, patch: Partial<Annotation>) => void;
  removeAnnotation: (id: string) => void;
  setActiveAnnotation: (id: string | null) => void;
  setBookmarks: (b: Bookmark[]) => void;
  addBookmark: (b: Omit<Bookmark, "id"> & { id?: string }) => void;
  removeBookmark: (id: string) => void;
  rotatePages: (originalIndices: number[], delta: number) => void;
  movePage: (displayIndex: number, dir: -1 | 1) => void;
  setDraftComment: (s: string) => void;
  setLeftOpen: (v: boolean) => void;
  setRightTab: (t: "bookmarks" | "comments") => void;
  markSaved: () => void;
  setPrintMode: (v: boolean) => void;
  seedEdits: (list: Annotation[]) => void;
  undo: () => void;
  redo: () => void;
}

const initialDoc = {
  name: "",
  kind: null as AppState["kind"],
  bytes: null as Uint8Array | null,
  pageCount: 0,
  pageOrder: [] as number[],
  rotations: {} as Record<number, number>,
  annotations: [] as Annotation[],
  bookmarks: [] as Bookmark[],
  currentPage: 1,
  scale: 1.1,
  fit: "width" as const,
  tool: "select" as Tool,
  editGesture: "select" as EditGesture,
  panel: null as Panel,
  status: "",
  dirty: false,
  loading: false,
  password: "",
  pendingPassword: false,
  pendingBytes: null as Uint8Array | null,
  pendingName: "",
  userPassword: "",
  selection: null as TextSelection | null,
  activeAnnotation: null as string | null,
  activeSignature: null as SavedSignature | null,
  draftComment: "",
  leftOpen: true,
  rightTab: "bookmarks" as const,
  zoomTick: 0,
  printMode: false,
  past: [] as DocSnapshot[],
  future: [] as DocSnapshot[],
};

export const useAppStore = create<AppState>((set, get) => ({
  ...loadSettings(),
  ...initialDoc,

  setTheme: (theme) => {
    set({ theme });
    persist(get());
  },
  setLang: (lang) => {
    set({ lang });
    persist(get());
  },
  setPrinters: (homePrinter, workPrinter) => {
    set({ homePrinter, workPrinter });
    persist(get());
  },
  addSignature: (sig) => {
    set({ signatures: [...get().signatures, sig], activeSignature: sig });
    persist(get());
  },
  removeSignature: (id) => {
    set({
      signatures: get().signatures.filter((s) => s.id !== id),
      activeSignature:
        get().activeSignature?.id === id ? null : get().activeSignature,
    });
    persist(get());
  },
  setActiveSignature: (sig) =>
    set({ activeSignature: sig, tool: sig ? "sign" : get().tool }),

  resetDocument: () => set({ ...initialDoc, status: get().status }),
  setDocument: ({ name, kind, bytes, pageCount }) =>
    set({
      name,
      kind,
      bytes,
      pageCount,
      pageOrder: Array.from({ length: pageCount }, (_, i) => i),
      rotations: {},
      annotations: [],
      bookmarks: [],
      currentPage: 1,
      dirty: false,
      loading: false,
      pendingPassword: false,
      pendingBytes: null,
      pendingName: "",
      userPassword: "",
      selection: null,
      activeAnnotation: null,
      panel: null,
      scale: 1.1,
      fit: "width",
      zoomTick: get().zoomTick + 1,
      printMode: false,
      past: [],
      future: [],
    }),
  setLoading: (loading) => set({ loading }),
  setStatus: (status) => set({ status }),
  setScale: (scale, fit = "custom") => {
    const next = Math.max(0.25, Math.min(4, scale));
    const cur = get();
    if (cur.scale === next && cur.fit === fit) return;
    set({ scale: next, fit, zoomTick: cur.zoomTick + 1 });
  },
  setTool: (tool) => {
    const cur = get();
    let annotations = cur.annotations;
    let activeAnnotation = cur.activeAnnotation;
    if (cur.tool === "edit" && tool !== "edit") {
      annotations = annotations.filter(
        (a) => !(a.type === "edit" && !(a.text || "").trim()),
      );
      const active = annotations.find((a) => a.id === activeAnnotation);
      if (active?.type === "edit") activeAnnotation = null;
    }
    set({
      tool,
      annotations,
      activeAnnotation: tool === cur.tool ? activeAnnotation : null,
      editGesture: tool === "edit" ? cur.editGesture : "select",
      panel: tool === "sign" && !cur.activeSignature ? "sign" : cur.panel,
    });
  },
  setEditGesture: (editGesture) => set({ editGesture }),
  confirmEdits: () => {
    const s = get();
    set({
      past: [...s.past.slice(-79), cloneSnap(s)],
      future: [],
    });
    const annotations = get()
      .annotations.filter(
        (a) => !(a.type === "edit" && !(a.text || "").trim()),
      )
      .map((a) => (a.type === "edit" ? { ...a, confirmed: true } : a));
    set({
      annotations,
      activeAnnotation: null,
      editGesture: "select",
      tool: "select",
      dirty: true,
    });
  },
  setPanel: (panel) => set({ panel }),
  setCurrentPage: (currentPage) => {
    const next = Math.max(1, Math.min(get().pageCount || 1, currentPage));
    if (get().currentPage === next) return;
    set({ currentPage: next });
  },
  setSelection: (selection) => set({ selection }),
  setPasswordGate: (pendingBytes, pendingName) =>
    set({ pendingPassword: true, pendingBytes, pendingName, panel: "password" }),
  clearPasswordGate: () =>
    set({ pendingPassword: false, pendingBytes: null, pendingName: "", panel: null }),
  setOpenPassword: (password) => set({ password }),
  setUserPassword: (userPassword) => set({ userPassword, dirty: true }),
  addAnnotation: (a) => {
    if (!historyLock) {
      set({
        past: [...get().past.slice(-79), cloneSnap(get())],
        future: [],
      });
    }
    const id = a.id ?? uid("ann");
    const next: Annotation = { ...a, id, createdAt: Date.now() };
    set({
      annotations: [...get().annotations, next],
      dirty: true,
      activeAnnotation: id,
    });
    return id;
  },
  updateAnnotation: (id, patch) => {
    if (!historyLock) {
      set({
        past: [...get().past.slice(-79), cloneSnap(get())],
        future: [],
      });
      historyLock = true;
    }
    if (historyTimer) clearTimeout(historyTimer);
    historyTimer = setTimeout(() => {
      historyLock = false;
    }, 500);
    set({
      annotations: get().annotations.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      dirty: true,
    });
  },
  removeAnnotation: (id) => {
    set({
      past: [...get().past.slice(-79), cloneSnap(get())],
      future: [],
      annotations: get().annotations.filter((x) => x.id !== id),
      activeAnnotation: get().activeAnnotation === id ? null : get().activeAnnotation,
      dirty: true,
    });
  },
  setActiveAnnotation: (activeAnnotation) => set({ activeAnnotation }),
  setBookmarks: (bookmarks) => set({ bookmarks }),
  addBookmark: (b) =>
    set({
      bookmarks: [...get().bookmarks, { ...b, id: b.id ?? uid("bm") }],
    }),
  removeBookmark: (id) =>
    set({ bookmarks: get().bookmarks.filter((b) => b.id !== id) }),
  rotatePages: (originalIndices, delta) => {
    const s = get();
    set({
      past: [...s.past.slice(-79), cloneSnap(s)],
      future: [],
    });
    const hit = new Set(originalIndices);
    const rotations = { ...s.rotations };
    for (const i of originalIndices) {
      rotations[i] = (((rotations[i] ?? 0) + delta) % 360 + 360) % 360;
    }
    const annotations = s.annotations.map((a) => {
      if (!hit.has(a.pageIndex)) return a;
      const box = rotateBox({ x: a.x, y: a.y, w: a.w, h: a.h }, delta);
      const next = { ...a, ...box };
      if (a.originX != null && a.originY != null) {
        const origin = rotateBox(
          {
            x: a.originX,
            y: a.originY,
            w: a.originW ?? a.w,
            h: a.originH ?? a.h,
          },
          delta,
        );
        next.originX = origin.x;
        next.originY = origin.y;
        next.originW = origin.w;
        next.originH = origin.h;
      }
      return next;
    });
    set({ rotations, annotations, dirty: true, zoomTick: s.zoomTick + 1 });
  },
  movePage: (displayIndex, dir) => {
    const s = get();
    const order = [...s.pageOrder];
    const j = displayIndex + dir;
    if (j < 0 || j >= order.length) return;
    set({
      past: [...s.past.slice(-79), cloneSnap(s)],
      future: [],
    });
    const tmp = order[displayIndex]!;
    order[displayIndex] = order[j]!;
    order[j] = tmp;
    set({ pageOrder: order, dirty: true, currentPage: j + 1 });
  },
  setDraftComment: (draftComment) => set({ draftComment }),
  setLeftOpen: (leftOpen) => set({ leftOpen }),
  setRightTab: (rightTab) => set({ rightTab }),
  markSaved: () => set({ dirty: false }),
  setPrintMode: (printMode) => set({ printMode }),
  seedEdits: (list) => {
    if (!list.length) return;
    const have = new Set(
      get()
        .annotations.filter((a) => a.type === "edit" && a.source === "pdf")
        .map((a) => `${a.pageIndex}:${a.y.toFixed(4)}:${a.x.toFixed(4)}`),
    );
    const extra = list.filter((a) => {
      const key = `${a.pageIndex}:${a.y.toFixed(4)}:${a.x.toFixed(4)}`;
      if (have.has(key)) return false;
      have.add(key);
      return true;
    });
    if (!extra.length) return;
    set({ annotations: [...get().annotations, ...extra] });
  },
  undo: () => {
    const s = get();
    if (!s.past.length) return;
    historyLock = false;
    if (historyTimer) {
      clearTimeout(historyTimer);
      historyTimer = null;
    }
    const prev = s.past[s.past.length - 1]!;
    set({
      annotations: prev.annotations,
      rotations: prev.rotations,
      pageOrder: prev.pageOrder,
      bookmarks: prev.bookmarks,
      userPassword: prev.userPassword,
      past: s.past.slice(0, -1),
      future: [...s.future, cloneSnap(s)],
      dirty: true,
      activeAnnotation: null,
      zoomTick: s.zoomTick + 1,
    });
  },
  redo: () => {
    const s = get();
    if (!s.future.length) return;
    historyLock = false;
    if (historyTimer) {
      clearTimeout(historyTimer);
      historyTimer = null;
    }
    const next = s.future[s.future.length - 1]!;
    set({
      annotations: next.annotations,
      rotations: next.rotations,
      pageOrder: next.pageOrder,
      bookmarks: next.bookmarks,
      userPassword: next.userPassword,
      future: s.future.slice(0, -1),
      past: [...s.past, cloneSnap(s)],
      dirty: true,
      activeAnnotation: null,
      zoomTick: s.zoomTick + 1,
    });
  },
}));

export function useT() {
  const lang = useAppStore((s) => s.lang);
  return (
    key: Parameters<typeof translate>[1],
    params?: Record<string, string | number>,
  ) => translate(lang, key, params);
}

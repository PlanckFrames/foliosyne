import { create } from "zustand";
import type {
  Annotation,
  Bookmark,
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
    }),
  setLoading: (loading) => set({ loading }),
  setStatus: (status) => set({ status }),
  setScale: (scale, fit = "custom") => {
    const next = Math.max(0.25, Math.min(4, scale));
    const cur = get();
    if (cur.scale === next && cur.fit === fit) return;
    set({ scale: next, fit, zoomTick: cur.zoomTick + 1 });
  },
  setTool: (tool) =>
    set({
      tool,
      panel: tool === "sign" && !get().activeSignature ? "sign" : get().panel,
    }),
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
    const id = a.id ?? uid("ann");
    const next: Annotation = { ...a, id, createdAt: Date.now() };
    set({
      annotations: [...get().annotations, next],
      dirty: true,
      activeAnnotation: id,
    });
    return id;
  },
  updateAnnotation: (id, patch) =>
    set({
      annotations: get().annotations.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      dirty: true,
    }),
  removeAnnotation: (id) =>
    set({
      annotations: get().annotations.filter((x) => x.id !== id),
      activeAnnotation: get().activeAnnotation === id ? null : get().activeAnnotation,
      dirty: true,
    }),
  setActiveAnnotation: (activeAnnotation) => set({ activeAnnotation }),
  setBookmarks: (bookmarks) => set({ bookmarks }),
  addBookmark: (b) =>
    set({
      bookmarks: [...get().bookmarks, { ...b, id: b.id ?? uid("bm") }],
    }),
  removeBookmark: (id) =>
    set({ bookmarks: get().bookmarks.filter((b) => b.id !== id) }),
  rotatePages: (originalIndices, delta) => {
    const rotations = { ...get().rotations };
    for (const i of originalIndices) {
      rotations[i] = (((rotations[i] ?? 0) + delta) % 360 + 360) % 360;
    }
    set({ rotations, dirty: true, zoomTick: get().zoomTick + 1 });
  },
  movePage: (displayIndex, dir) => {
    const order = [...get().pageOrder];
    const j = displayIndex + dir;
    if (j < 0 || j >= order.length) return;
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
}));

export function useT() {
  const lang = useAppStore((s) => s.lang);
  return (
    key: Parameters<typeof translate>[1],
    params?: Record<string, string | number>,
  ) => translate(lang, key, params);
}

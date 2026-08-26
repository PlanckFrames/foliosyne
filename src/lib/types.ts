export type Tool =
  | "select"
  | "pan"
  | "text"
  | "highlight"
  | "comment"
  | "redact"
  | "sign";

export type AnnotationType =
  | "text"
  | "highlight"
  | "comment"
  | "redact"
  | "signature";

export type Panel =
  | null
  | "convert"
  | "protect"
  | "sign"
  | "translate"
  | "share"
  | "print"
  | "rotate"
  | "password"
  | "help"
  | "cloud";

export interface Annotation {
  id: string;
  type: AnnotationType;
  /** Original page index in the source PDF (stable across reorder). */
  pageIndex: number;
  /** Normalized 0–1, top-left origin. */
  x: number;
  y: number;
  w: number;
  h: number;
  text?: string;
  color?: string;
  imageDataUrl?: string;
  createdAt: number;
}

export interface Bookmark {
  id: string;
  title: string;
  pageIndex: number;
  auto?: boolean;
}

export interface SavedSignature {
  id: string;
  name: string;
  kind: "typed" | "initials" | "upload";
  dataUrl: string;
}

export interface RecentFile {
  id: string;
  name: string;
  kind: "pdf" | "docx";
  size: number;
  savedAt: number;
}

export interface TextSelection {
  pageIndex: number;
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PageMetrics {
  width: number;
  height: number;
  rotation: number;
}

export type UiLang =
  | "en"
  | "es"
  | "fr"
  | "de"
  | "pt"
  | "it"
  | "ja"
  | "zh"
  | "ko"
  | "ar"
  | "hi"
  | "nl"
  | "ru";

export type Theme = "light" | "dark";

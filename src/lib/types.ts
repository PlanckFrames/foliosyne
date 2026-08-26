export type Tool =
  | "select"
  | "pan"
  | "edit"
  | "highlight"
  | "comment"
  | "redact"
  | "sign";

/** Sub-tool while Edit PDF is active. */
export type EditGesture = "select" | "pan" | "place";

export type AnnotationType =
  | "text"
  | "edit"
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

export type TextAlign = "left" | "center" | "right";
export type BulletStyle = "none" | "disc" | "circle" | "square" | "dash";

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
  /** Comment is collapsed to a pin after confirm. */
  confirmed?: boolean;
  fontFamily?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  superScript?: boolean;
  subScript?: boolean;
  align?: TextAlign;
  indent?: number;
  list?: BulletStyle;
  /** pdf = seeded from the file; user = typed in Edit PDF. */
  source?: "pdf" | "user";
  /** Original PDF box, used to hide source glyphs after the overlay is moved. */
  originX?: number;
  originY?: number;
  originW?: number;
  originH?: number;
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

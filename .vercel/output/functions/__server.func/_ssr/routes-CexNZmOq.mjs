import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { A as FileOutput, C as List, D as Hand, E as Highlighter, F as BookmarkPlus, I as Bold, L as AlignLeft, M as ChevronUp, N as ChevronDown, O as Globe, P as Check, R as AlignRight, S as Lock, T as Italic, _ as PenLine, a as Type, b as MessageSquare, c as Sun, d as Share2, f as Scan, g as Pencil, h as Printer, i as Underline, j as CircleHelp, k as FileUp, l as Subscript, m as RotateCw, n as ZoomOut, p as Save, r as X, s as Superscript, t as ZoomIn, u as Strikethrough, v as MousePointer2, w as Languages, x as Menu, y as Moon, z as AlignCenter } from "../_libs/lucide-react.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { a as DialogPortal, h as Slot, i as DialogOverlay, n as DialogClose, o as DialogTitle, r as DialogContent$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { a as Trigger, i as Root3, n as Portal, r as Provider, t as Content2 } from "../_libs/@radix-ui/react-tooltip+[...].mjs";
import { i as degrees, n as StandardFonts, r as rgb, t as PDFDocument } from "../_libs/@cantoo/pdf-lib+[...].mjs";
import { a as HorizontalPositionRelativeFrom, c as Packer, d as SectionType, f as TextRun, i as FrameWrap, l as PageOrientation, m as VerticalPositionRelativeFrom, n as File$1, o as ImageRun, p as TextWrappingType, r as FrameAnchorType, s as LineRuleType, t as AlignmentType, u as Paragraph } from "../_libs/docx.mjs";
import { t as require_lib } from "../_libs/jszip+[...].mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CexNZmOq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_lib = /* @__PURE__ */ __toESM(require_lib());
function isLoginRequired(result) {
	return result.ok === false && result.loginRequired === true;
}
function isFramed() {
	try {
		return window.self !== window.top;
	} catch {
		return true;
	}
}
function redirectToLoginIfRequired(result) {
	if (!isLoginRequired(result)) return false;
	const url = result.loginUrl;
	if (!url) return false;
	if (typeof window === "undefined") return false;
	if (isFramed()) {
		const opened = window.open(url, "_blank");
		if (opened) {
			opened.opener = null;
			return true;
		}
	}
	window.location.assign(url);
	return true;
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function uid(prefix = "id") {
	return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}
function downloadBlob(blob, filename) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
function bytesToBlob(bytes, type) {
	const copy = new Uint8Array(bytes.byteLength);
	copy.set(bytes);
	return new Blob([copy], { type });
}
function dataUrlToBytes(dataUrl) {
	const comma = dataUrl.indexOf(",");
	const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
	const bin = atob(b64);
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out;
}
function formatBytes(n) {
	if (n < 1024) return `${n} B`;
	if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
	return `${(n / 1048576).toFixed(1)} MB`;
}
function stemFilename(name) {
	return name.replace(/\.[^.]+$/, "") || "document";
}
var buttonVariants = cva("inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-[opacity,transform,background-color,color,box-shadow] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-accent text-accent-fg hover:opacity-90 active:scale-[0.98]",
			secondary: "bg-surface text-fg shadow-[var(--shadow-border)] hover:bg-paper",
			ghost: "text-fg hover:bg-paper",
			outline: "border border-border bg-transparent text-fg hover:bg-paper",
			danger: "bg-danger text-accent-fg hover:opacity-90"
		},
		size: {
			default: "h-10 px-3.5",
			sm: "h-8 px-2.5 text-xs",
			lg: "h-11 px-4",
			icon: "size-10",
			"icon-sm": "size-8"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild, type = "button", ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		ref,
		type: asChild ? void 0 : type,
		...props
	});
});
Button.displayName = "Button";
function TooltipProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Provider, {
		delayDuration: 280,
		children
	});
}
function Tip({ label, children, side = "bottom" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root3, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
		asChild: true,
		children
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		side,
		sideOffset: 6,
		className: cn("z-50 max-w-xs rounded-sm bg-ink px-2.5 py-1.5 text-xs text-accent-fg shadow-[var(--shadow-border)]"),
		children: label
	}) })] });
}
var LANGS = [
	{
		code: "en",
		label: "English",
		dir: "ltr"
	},
	{
		code: "es",
		label: "Español",
		dir: "ltr"
	},
	{
		code: "fr",
		label: "Français",
		dir: "ltr"
	},
	{
		code: "de",
		label: "Deutsch",
		dir: "ltr"
	},
	{
		code: "pt",
		label: "Português",
		dir: "ltr"
	},
	{
		code: "it",
		label: "Italiano",
		dir: "ltr"
	},
	{
		code: "ja",
		label: "日本語",
		dir: "ltr"
	},
	{
		code: "zh",
		label: "中文",
		dir: "ltr"
	},
	{
		code: "ko",
		label: "한국어",
		dir: "ltr"
	},
	{
		code: "ar",
		label: "العربية",
		dir: "rtl"
	},
	{
		code: "hi",
		label: "हिन्दी",
		dir: "ltr"
	},
	{
		code: "nl",
		label: "Nederlands",
		dir: "ltr"
	},
	{
		code: "ru",
		label: "Русский",
		dir: "ltr"
	}
];
var en = {
	"app.name": "Foliosyne",
	"app.tagline": "Documents, composed.",
	"app.subtitle": "Read, edit, protect, and share PDFs, Word, and Google Docs in the browser.",
	"action.open": "Open",
	"action.save": "Save PDF",
	"action.print": "Print",
	"action.share": "Share",
	"action.convert": "Convert",
	"action.protect": "Protect",
	"action.sign": "Sign",
	"action.translate": "Translate",
	"action.rotate": "Rotate",
	"action.close": "Close",
	"action.cancel": "Cancel",
	"action.apply": "Apply",
	"action.delete": "Delete",
	"action.done": "Done",
	"action.download": "Download",
	"action.copy": "Copy",
	"action.unlock": "Unlock",
	"action.place": "Place on page",
	"action.run": "Run",
	"action.add": "Add",
	"tool.select": "Select",
	"tool.pan": "Pan",
	"tool.edit": "Edit PDF",
	"tool.highlight": "Highlight",
	"tool.comment": "Comment",
	"tool.redact": "Redact",
	"tool.sign": "Stamp signature",
	"tool.help.select": "Select and copy text. The pointer becomes a text cursor over words.",
	"tool.help.pan": "Drag to move the page. Scroll or use page up/down to change pages.",
	"tool.help.edit": "Edit the PDF in place. Change font, size, color, lists, and add text.",
	"tool.help.highlight": "Drag over text or a region to highlight it.",
	"tool.help.comment": "Click to drop a comment pin, then type a note and confirm.",
	"tool.help.redact": "Drag a rectangle to permanently cover content on export.",
	"tool.help.sign": "Choose or create a signature, then click the page to stamp it.",
	"edit.addText": "Add text",
	"edit.font": "Font",
	"edit.size": "Size",
	"edit.bold": "Bold",
	"edit.italic": "Italic",
	"edit.underline": "Underline",
	"edit.strike": "Strikethrough",
	"edit.super": "Superscript",
	"edit.sub": "Subscript",
	"edit.color": "Color",
	"edit.indent": "Indent",
	"edit.bullet": "Bullets",
	"edit.bulletDisc": "Disc",
	"edit.bulletCircle": "Circle",
	"edit.bulletSquare": "Square",
	"edit.bulletDash": "Dash",
	"edit.alignLeft": "Align left",
	"edit.alignCenter": "Align center",
	"edit.alignRight": "Align right",
	"view.zoomIn": "Zoom in",
	"view.zoomOut": "Zoom out",
	"view.fitWidth": "Fit width",
	"view.fitPage": "Fit page",
	"view.pageUp": "Page up",
	"view.pageDown": "Page down",
	"view.rotatePage": "Rotate this page",
	"view.rotateAll": "Rotate whole document",
	"view.pageOf": "Page {n} of {total}",
	"view.moveUp": "Move page up",
	"view.moveDown": "Move page down",
	"file.openPdf": "Open PDF",
	"file.openWord": "Open Word",
	"file.openDrive": "From Google Drive",
	"file.sample": "Open sample document",
	"file.recent": "Recent",
	"file.dropTitle": "Drop a document",
	"file.dropHint": "PDF or Word (.docx). Large files stay in this browser.",
	"file.passwordTitle": "This file is protected",
	"file.passwordHint": "Enter the password to open it.",
	"file.noRecent": "No recent files yet.",
	"file.browse": "Browse files",
	"empty.title": "A quieter studio for serious documents.",
	"empty.body": "Open a PDF or Word file, import from Drive, or start with the sample to try editing, redaction, signatures, translation, and export.",
	"sidebar.pages": "Pages",
	"sidebar.bookmarks": "Bookmarks",
	"sidebar.comments": "Comments",
	"sidebar.autoHeadings": "Detect headings",
	"sidebar.addBookmark": "Bookmark this page",
	"sidebar.noBookmarks": "No bookmarks yet. Detect headings or pin the current page.",
	"sidebar.noComments": "No comments on this document.",
	"sidebar.bookmarkName": "Placeholder name",
	"convert.title": "Convert",
	"convert.toWord": "PDF to Word",
	"convert.toGdoc": "PDF to Google Docs",
	"convert.toPdf": "Word / Docs to PDF",
	"convert.hintWord": "Each PDF page becomes a Word page with the original paper color, headers, and artwork, plus real selectable text on top.",
	"convert.hintGdoc": "Downloads a Word file with real text you can open in Google Docs. Page 1 of the PDF is page 1 of the file.",
	"convert.hintPdf": "Open a .docx (including Google Docs exports) to turn it into a PDF here.",
	"convert.working": "Converting…",
	"convert.copied": "Layout-faithful Word file ready. Open it in Google Docs from Drive or File → Open.",
	"convert.done": "Conversion ready.",
	"protect.title": "Password protect",
	"protect.user": "Open password",
	"protect.owner": "Owner password (optional)",
	"protect.hint": "Readers will need the open password. Applied when you save.",
	"protect.apply": "Set password",
	"protect.remove": "Remove protection",
	"protect.locked": "This document will be encrypted on save.",
	"protect.confirm": "Confirm password",
	"protect.mismatch": "Passwords do not match.",
	"sign.title": "Signatures",
	"sign.typed": "Typed",
	"sign.initials": "Initials",
	"sign.fullName": "Full name",
	"sign.upload": "Upload",
	"sign.placeholder": "Your name",
	"sign.initialsPh": "JS",
	"sign.formats": "JPG, PNG, or WebP. White backgrounds are knocked out.",
	"sign.saved": "Saved signatures",
	"sign.empty": "Create a typed name, initials, or upload a photo of your signature.",
	"sign.use": "Use",
	"comment.placeholder": "Write a comment",
	"comment.add": "Add comment",
	"comment.empty": "Click the page with the comment tool to leave a note.",
	"comment.confirm": "Confirm",
	"redact.hint": "Drag to cover. Redactions become opaque on save and are omitted from exports.",
	"translate.title": "Language conversion",
	"translate.target": "Target language",
	"translate.selection": "Selected text",
	"translate.page": "This page",
	"translate.document": "Whole document",
	"translate.run": "Convert language",
	"translate.working": "Translating…",
	"translate.replace": "Place translation on the page",
	"translate.result": "Translation",
	"translate.needSelection": "Select text on the page first, or choose page / document.",
	"translate.unavailable": "Translation is unavailable in this environment.",
	"translate.copied": "Translation copied.",
	"share.title": "Share & export",
	"share.download": "Download file",
	"share.webShare": "Share",
	"share.drive": "Google Drive",
	"share.dropbox": "Dropbox",
	"share.box": "Box",
	"share.onedrive": "OneDrive",
	"share.icloud": "iCloud",
	"share.hint": "Files stay on this device until you download or share them. Share opens the system sheet when the browser allows it.",
	"share.driveHint": "Search and open files from the Drive connected to this Grok session.",
	"share.cloudSave": "Download, then save into {service} from your computer or phone.",
	"share.unsupported": "System share is not available here — the file will download instead.",
	"share.search": "Search Drive",
	"share.openFile": "Open",
	"share.noResults": "No matching Drive files.",
	"share.connect": "Connect Drive in Grok to import files.",
	"print.title": "Print",
	"print.home": "Home printer",
	"print.work": "Work printer",
	"print.detect": "Use detected printers",
	"print.send": "Send to printer",
	"print.hint": "Foliosyne opens the system print dialog, which lists printers on this Wi-Fi — AirPrint, IPP, and shared home or office devices.",
	"print.saveHome": "Label",
	"print.saveWork": "Label",
	"print.os": "The next dialog is your operating system’s printer list.",
	"rotate.title": "Rotate pages",
	"rotate.this": "Current page",
	"rotate.all": "Entire document",
	"rotate.range": "Page range",
	"rotate.rangeHint": "e.g. 1-3, 7",
	"rotate.left": "90° left",
	"rotate.right": "90° right",
	"rotate.around": "180°",
	"theme.light": "Light",
	"theme.dark": "Dark",
	"lang.label": "Interface language",
	"lang.doc": "Document language",
	"status.ready": "Ready",
	"status.loading": "Opening document…",
	"status.saving": "Writing PDF…",
	"status.pages": "{n} pages",
	"status.unsaved": "Unsaved marks",
	"status.rendering": "Rendering page {n}…",
	"help.title": "Studio guide",
	"help.body": "Hover any tool for a short explanation. Text under the pointer is always selectable. Bookmarks can be detected from headings or pinned by hand. Translation can target a selection, a page, or the whole file.",
	"help.shortcuts": "Shortcuts",
	"help.kOpen": "Open file",
	"help.kSave": "Save PDF",
	"help.kPrint": "Print",
	"help.kZoom": "Zoom",
	"help.kFit": "Fit width",
	"help.kPages": "Previous / next page",
	"error.open": "Could not open that file.",
	"error.password": "Incorrect password.",
	"error.ai": "Translation failed. Try a smaller selection.",
	"error.drive": "Could not reach Google Drive.",
	"error.word": "That does not look like a Word document.",
	"error.print": "Print dialog could not be opened.",
	"target.en": "English",
	"target.es": "Spanish",
	"target.fr": "French",
	"target.de": "German",
	"target.pt": "Portuguese",
	"target.it": "Italian",
	"target.ja": "Japanese",
	"target.zh": "Chinese",
	"target.ko": "Korean",
	"target.ar": "Arabic",
	"target.hi": "Hindi",
	"target.nl": "Dutch",
	"target.ru": "Russian"
};
var dictionaries = {
	en,
	es: {
		"app.name": "Foliosyne",
		"app.tagline": "Documentos, compuestos.",
		"app.subtitle": "Lea, edite, proteja y comparta PDF, Word y Google Docs en el navegador.",
		"action.open": "Abrir",
		"action.save": "Guardar PDF",
		"action.print": "Imprimir",
		"action.share": "Compartir",
		"action.convert": "Convertir",
		"action.protect": "Proteger",
		"action.sign": "Firmar",
		"action.translate": "Traducir",
		"action.rotate": "Rotar",
		"action.close": "Cerrar",
		"action.cancel": "Cancelar",
		"action.apply": "Aplicar",
		"action.delete": "Eliminar",
		"action.done": "Listo",
		"action.download": "Descargar",
		"action.copy": "Copiar",
		"action.unlock": "Desbloquear",
		"action.place": "Colocar en la página",
		"action.run": "Ejecutar",
		"action.add": "Añadir",
		"tool.select": "Seleccionar",
		"tool.pan": "Mover",
		"tool.edit": "Editar PDF",
		"tool.highlight": "Resaltar",
		"tool.comment": "Comentar",
		"tool.redact": "Censurar",
		"tool.sign": "Sello de firma",
		"tool.help.select": "Seleccione y copie texto. El puntero se vuelve cursor de texto sobre las palabras.",
		"tool.help.pan": "Arrastre para mover la página. Use re Pág / av Pág para cambiar de hoja.",
		"tool.help.edit": "Edite el PDF en su sitio. Cambie fuente, tamaño, color y añada texto.",
		"tool.help.highlight": "Arrastre sobre texto o una zona para resaltarla.",
		"tool.help.comment": "Haga clic para dejar un comentario, escriba y confirme.",
		"tool.help.redact": "Arrastre un rectángulo para cubrir el contenido al guardar.",
		"tool.help.sign": "Cree una firma y haga clic en la página para estamparla.",
		"edit.addText": "Añadir texto",
		"edit.font": "Fuente",
		"edit.size": "Tamaño",
		"edit.bold": "Negrita",
		"edit.italic": "Cursiva",
		"edit.underline": "Subrayado",
		"edit.strike": "Tachado",
		"edit.super": "Superíndice",
		"edit.sub": "Subíndice",
		"edit.color": "Color",
		"edit.indent": "Sangría",
		"edit.bullet": "Viñetas",
		"edit.bulletDisc": "Disco",
		"edit.bulletCircle": "Círculo",
		"edit.bulletSquare": "Cuadrado",
		"edit.bulletDash": "Guion",
		"edit.alignLeft": "Alinear a la izquierda",
		"edit.alignCenter": "Centrar",
		"edit.alignRight": "Alinear a la derecha",
		"view.zoomIn": "Acercar",
		"view.zoomOut": "Alejar",
		"view.fitWidth": "Ajustar al ancho",
		"view.fitPage": "Ajustar a la página",
		"view.pageUp": "Página anterior",
		"view.pageDown": "Página siguiente",
		"view.rotatePage": "Rotar esta página",
		"view.rotateAll": "Rotar todo el documento",
		"view.pageOf": "Página {n} de {total}",
		"view.moveUp": "Subir página",
		"view.moveDown": "Bajar página",
		"file.openPdf": "Abrir PDF",
		"file.openWord": "Abrir Word",
		"file.openDrive": "Desde Google Drive",
		"file.sample": "Abrir documento de ejemplo",
		"file.recent": "Recientes",
		"file.dropTitle": "Suelte un documento",
		"file.dropHint": "PDF o Word (.docx). Los archivos grandes permanecen en este navegador.",
		"file.passwordTitle": "Este archivo está protegido",
		"file.passwordHint": "Introduzca la contraseña para abrirlo.",
		"file.noRecent": "Aún no hay archivos recientes.",
		"file.browse": "Examinar archivos",
		"empty.title": "Un estudio más sereno para documentos serios.",
		"empty.body": "Abra un PDF o Word, importe desde Drive o use el ejemplo para probar edición, censura, firmas, traducción y exportación.",
		"sidebar.pages": "Páginas",
		"sidebar.bookmarks": "Marcadores",
		"sidebar.comments": "Comentarios",
		"sidebar.autoHeadings": "Detectar títulos",
		"sidebar.addBookmark": "Marcar esta página",
		"sidebar.noBookmarks": "Sin marcadores. Detecte títulos o fije la página actual.",
		"sidebar.noComments": "No hay comentarios en este documento.",
		"sidebar.bookmarkName": "Nombre del marcador",
		"convert.title": "Convertir",
		"convert.toWord": "PDF a Word",
		"convert.toGdoc": "PDF a Google Docs",
		"convert.toPdf": "Word / Docs a PDF",
		"convert.hintWord": "Cada página del PDF se convierte en una página de Word con la maquetación original.",
		"convert.hintGdoc": "Descarga un .docx fiel al diseño, que Google Docs puede abrir. La página 1 del PDF es la página 1 del archivo.",
		"convert.hintPdf": "Abra un .docx (incluidos exportados de Google Docs) para convertirlo a PDF.",
		"convert.working": "Convirtiendo…",
		"convert.copied": "Archivo Word listo. Ábralo en Google Docs.",
		"convert.done": "Conversión lista.",
		"protect.title": "Proteger con contraseña",
		"protect.user": "Contraseña de apertura",
		"protect.owner": "Contraseña de propietario (opcional)",
		"protect.hint": "Hará falta la contraseña para abrir. Se aplica al guardar.",
		"protect.apply": "Establecer contraseña",
		"protect.remove": "Quitar protección",
		"protect.locked": "Este documento se cifrará al guardar.",
		"protect.confirm": "Confirmar contraseña",
		"protect.mismatch": "Las contraseñas no coinciden.",
		"sign.title": "Firmas",
		"sign.typed": "Escrita",
		"sign.initials": "Iniciales",
		"sign.fullName": "Nombre completo",
		"sign.upload": "Subir",
		"sign.placeholder": "Su nombre",
		"sign.initialsPh": "JS",
		"sign.formats": "JPG, PNG o WebP. El fondo blanco se elimina.",
		"sign.saved": "Firmas guardadas",
		"sign.empty": "Escriba un nombre, iniciales o suba una foto de su firma.",
		"sign.use": "Usar",
		"comment.placeholder": "Escriba un comentario",
		"comment.add": "Añadir comentario",
		"comment.empty": "Haga clic en la página con la herramienta de comentario.",
		"comment.confirm": "Confirmar",
		"redact.hint": "Arrastre para cubrir. Las censuras son opacas al guardar.",
		"translate.title": "Conversión de idioma",
		"translate.target": "Idioma de destino",
		"translate.selection": "Texto seleccionado",
		"translate.page": "Esta página",
		"translate.document": "Documento entero",
		"translate.run": "Convertir idioma",
		"translate.working": "Traduciendo…",
		"translate.replace": "Colocar traducción en la página",
		"translate.result": "Traducción",
		"translate.needSelection": "Seleccione texto o elija página / documento.",
		"translate.unavailable": "La traducción no está disponible aquí.",
		"translate.copied": "Traducción copiada.",
		"share.title": "Compartir y exportar",
		"share.download": "Descargar archivo",
		"share.webShare": "Compartir",
		"share.drive": "Google Drive",
		"share.dropbox": "Dropbox",
		"share.box": "Box",
		"share.onedrive": "OneDrive",
		"share.icloud": "iCloud",
		"share.hint": "Los archivos permanecen en este dispositivo hasta que los descargue o comparta.",
		"share.driveHint": "Busque y abra archivos de Drive conectado a esta sesión de Grok.",
		"share.cloudSave": "Descargue y guarde en {service} desde su equipo o teléfono.",
		"share.unsupported": "Compartir no está disponible — se descargará el archivo.",
		"share.search": "Buscar en Drive",
		"share.openFile": "Abrir",
		"share.noResults": "No hay archivos coincidentes.",
		"share.connect": "Conecte Drive en Grok para importar.",
		"print.title": "Imprimir",
		"print.home": "Impresora de casa",
		"print.work": "Impresora del trabajo",
		"print.detect": "Usar impresoras detectadas",
		"print.send": "Enviar a impresora",
		"print.hint": "Se abre el diálogo del sistema, con impresoras de esta Wi-Fi (AirPrint, IPP, casa u oficina).",
		"print.saveHome": "Etiqueta",
		"print.saveWork": "Etiqueta",
		"print.os": "El siguiente diálogo es la lista de impresoras del sistema.",
		"rotate.title": "Rotar páginas",
		"rotate.this": "Página actual",
		"rotate.all": "Documento entero",
		"rotate.range": "Rango de páginas",
		"rotate.rangeHint": "p. ej. 1-3, 7",
		"rotate.left": "90° izquierda",
		"rotate.right": "90° derecha",
		"rotate.around": "180°",
		"theme.light": "Claro",
		"theme.dark": "Oscuro",
		"lang.label": "Idioma de la interfaz",
		"lang.doc": "Idioma del documento",
		"status.ready": "Listo",
		"status.loading": "Abriendo documento…",
		"status.saving": "Escribiendo PDF…",
		"status.pages": "{n} páginas",
		"status.unsaved": "Marcas sin guardar",
		"status.rendering": "Renderizando página {n}…",
		"help.title": "Guía del estudio",
		"help.body": "Pase el cursor por cada herramienta para una explicación. El texto bajo el puntero siempre se puede seleccionar.",
		"help.shortcuts": "Atajos",
		"help.kOpen": "Abrir archivo",
		"help.kSave": "Guardar PDF",
		"help.kPrint": "Imprimir",
		"help.kZoom": "Zoom",
		"help.kFit": "Ajustar al ancho",
		"help.kPages": "Página anterior / siguiente",
		"error.open": "No se pudo abrir ese archivo.",
		"error.password": "Contraseña incorrecta.",
		"error.ai": "La traducción falló. Pruebe una selección más pequeña.",
		"error.drive": "No se pudo acceder a Google Drive.",
		"error.word": "Eso no parece un documento de Word.",
		"error.print": "No se pudo abrir el diálogo de impresión.",
		"target.en": "Inglés",
		"target.es": "Español",
		"target.fr": "Francés",
		"target.de": "Alemán",
		"target.pt": "Portugués",
		"target.it": "Italiano",
		"target.ja": "Japonés",
		"target.zh": "Chino",
		"target.ko": "Coreano",
		"target.ar": "Árabe",
		"target.hi": "Hindi",
		"target.nl": "Neerlandés",
		"target.ru": "Ruso"
	},
	fr: {
		"app.name": "Foliosyne",
		"app.tagline": "Des documents, composés.",
		"app.subtitle": "Lisez, modifiez, protégez et partagez PDF, Word et Google Docs dans le navigateur.",
		"action.open": "Ouvrir",
		"action.save": "Enregistrer le PDF",
		"action.print": "Imprimer",
		"action.share": "Partager",
		"action.convert": "Convertir",
		"action.protect": "Protéger",
		"action.sign": "Signer",
		"action.translate": "Traduire",
		"action.rotate": "Pivoter",
		"action.close": "Fermer",
		"action.cancel": "Annuler",
		"action.apply": "Appliquer",
		"action.delete": "Supprimer",
		"action.done": "Terminé",
		"action.download": "Télécharger",
		"action.copy": "Copier",
		"action.unlock": "Déverrouiller",
		"action.place": "Placer sur la page",
		"action.run": "Lancer",
		"action.add": "Ajouter",
		"tool.select": "Sélection",
		"tool.pan": "Déplacer",
		"tool.edit": "Modifier le PDF",
		"tool.highlight": "Surligner",
		"tool.comment": "Commenter",
		"tool.redact": "Caviarder",
		"tool.sign": "Tampon de signature",
		"tool.help.select": "Sélectionnez et copiez le texte. Le curseur devient un I-beam au-dessus des mots.",
		"tool.help.pan": "Faites glisser pour déplacer la page. Page préc. / suiv. pour changer de feuille.",
		"tool.help.edit": "Modifiez le PDF sur place. Police, taille, couleur, listes et ajout de texte.",
		"tool.help.highlight": "Faites glisser sur du texte ou une zone pour surligner.",
		"tool.help.comment": "Cliquez pour poser une note, saisissez, puis confirmez.",
		"tool.help.redact": "Tracez un rectangle : le contenu sera masqué à l’enregistrement.",
		"tool.help.sign": "Créez une signature puis cliquez la page pour la poser.",
		"edit.addText": "Ajouter du texte",
		"edit.font": "Police",
		"edit.size": "Taille",
		"edit.bold": "Gras",
		"edit.italic": "Italique",
		"edit.underline": "Souligné",
		"edit.strike": "Barré",
		"edit.super": "Exposant",
		"edit.sub": "Indice",
		"edit.color": "Couleur",
		"edit.indent": "Retrait",
		"edit.bullet": "Puces",
		"edit.bulletDisc": "Disque",
		"edit.bulletCircle": "Cercle",
		"edit.bulletSquare": "Carré",
		"edit.bulletDash": "Tiret",
		"edit.alignLeft": "Aligner à gauche",
		"edit.alignCenter": "Centrer",
		"edit.alignRight": "Aligner à droite",
		"view.zoomIn": "Zoom avant",
		"view.zoomOut": "Zoom arrière",
		"view.fitWidth": "Ajuster à la largeur",
		"view.fitPage": "Ajuster à la page",
		"view.pageUp": "Page précédente",
		"view.pageDown": "Page suivante",
		"view.rotatePage": "Pivoter cette page",
		"view.rotateAll": "Pivoter tout le document",
		"view.pageOf": "Page {n} sur {total}",
		"view.moveUp": "Monter la page",
		"view.moveDown": "Descendre la page",
		"file.openPdf": "Ouvrir un PDF",
		"file.openWord": "Ouvrir Word",
		"file.openDrive": "Depuis Google Drive",
		"file.sample": "Ouvrir l’exemple",
		"file.recent": "Récents",
		"file.dropTitle": "Déposez un document",
		"file.dropHint": "PDF ou Word (.docx). Les gros fichiers restent dans ce navigateur.",
		"file.passwordTitle": "Ce fichier est protégé",
		"file.passwordHint": "Saisissez le mot de passe pour l’ouvrir.",
		"file.noRecent": "Aucun fichier récent.",
		"file.browse": "Parcourir",
		"empty.title": "Un atelier plus calme pour les documents exigeants.",
		"empty.body": "Ouvrez un PDF ou Word, importez depuis Drive, ou essayez l’exemple.",
		"sidebar.pages": "Pages",
		"sidebar.bookmarks": "Signets",
		"sidebar.comments": "Commentaires",
		"sidebar.autoHeadings": "Détecter les titres",
		"sidebar.addBookmark": "Marquer cette page",
		"sidebar.noBookmarks": "Pas encore de signets. Détectez les titres ou épinglez la page.",
		"sidebar.noComments": "Aucun commentaire.",
		"sidebar.bookmarkName": "Nom du signet",
		"convert.title": "Convertir",
		"convert.toWord": "PDF vers Word",
		"convert.toGdoc": "PDF vers Google Docs",
		"convert.toPdf": "Word / Docs vers PDF",
		"convert.hintWord": "Chaque page du PDF devient une page Word avec la mise en page d’origine.",
		"convert.hintGdoc": "Télécharge un .docx fidèle à la mise en page, ouvrable dans Google Docs.",
		"convert.hintPdf": "Ouvrez un .docx (y compris exporté de Google Docs) pour le passer en PDF.",
		"convert.working": "Conversion…",
		"convert.copied": "Fichier Word prêt. Ouvrez-le dans Google Docs.",
		"convert.done": "Conversion prête.",
		"protect.title": "Protéger par mot de passe",
		"protect.user": "Mot de passe d’ouverture",
		"protect.owner": "Mot de passe propriétaire (optionnel)",
		"protect.hint": "Le mot de passe sera exigé à l’ouverture. Appliqué à l’enregistrement.",
		"protect.apply": "Définir le mot de passe",
		"protect.remove": "Retirer la protection",
		"protect.locked": "Ce document sera chiffré à l’enregistrement.",
		"protect.confirm": "Confirmer le mot de passe",
		"protect.mismatch": "Les mots de passe ne correspondent pas.",
		"sign.title": "Signatures",
		"sign.typed": "Saisie",
		"sign.initials": "Initiales",
		"sign.fullName": "Nom complet",
		"sign.upload": "Importer",
		"sign.placeholder": "Votre nom",
		"sign.initialsPh": "JS",
		"sign.formats": "JPG, PNG ou WebP. Les fonds blancs sont retirés.",
		"sign.saved": "Signatures enregistrées",
		"sign.empty": "Saisissez un nom, des initiales, ou importez une photo de signature.",
		"sign.use": "Utiliser",
		"comment.placeholder": "Écrire un commentaire",
		"comment.add": "Ajouter",
		"comment.empty": "Cliquez la page avec l’outil commentaire.",
		"comment.confirm": "Confirmer",
		"redact.hint": "Faites glisser pour couvrir. Les caviardages sont opaques à l’enregistrement.",
		"translate.title": "Conversion de langue",
		"translate.target": "Langue cible",
		"translate.selection": "Texte sélectionné",
		"translate.page": "Cette page",
		"translate.document": "Document entier",
		"translate.run": "Convertir la langue",
		"translate.working": "Traduction…",
		"translate.replace": "Placer la traduction sur la page",
		"translate.result": "Traduction",
		"translate.needSelection": "Sélectionnez du texte, ou choisissez page / document.",
		"translate.unavailable": "Traduction indisponible ici.",
		"translate.copied": "Traduction copiée.",
		"share.title": "Partager et exporter",
		"share.download": "Télécharger",
		"share.webShare": "Partager",
		"share.drive": "Google Drive",
		"share.dropbox": "Dropbox",
		"share.box": "Box",
		"share.onedrive": "OneDrive",
		"share.icloud": "iCloud",
		"share.hint": "Les fichiers restent ici jusqu’au téléchargement ou au partage.",
		"share.driveHint": "Recherchez les fichiers Drive liés à cette session Grok.",
		"share.cloudSave": "Téléchargez puis enregistrez dans {service}.",
		"share.unsupported": "Partage indisponible — le fichier sera téléchargé.",
		"share.search": "Rechercher dans Drive",
		"share.openFile": "Ouvrir",
		"share.noResults": "Aucun fichier correspondant.",
		"share.connect": "Connectez Drive dans Grok pour importer.",
		"print.title": "Imprimer",
		"print.home": "Imprimante maison",
		"print.work": "Imprimante bureau",
		"print.detect": "Utiliser les imprimantes détectées",
		"print.send": "Envoyer à l’imprimante",
		"print.hint": "Le dialogue système liste les imprimantes Wi-Fi (AirPrint, IPP, maison ou bureau).",
		"print.saveHome": "Libellé",
		"print.saveWork": "Libellé",
		"print.os": "La liste suivante est celle de votre système.",
		"rotate.title": "Pivoter les pages",
		"rotate.this": "Page actuelle",
		"rotate.all": "Document entier",
		"rotate.range": "Plage de pages",
		"rotate.rangeHint": "ex. 1-3, 7",
		"rotate.left": "90° gauche",
		"rotate.right": "90° droite",
		"rotate.around": "180°",
		"theme.light": "Clair",
		"theme.dark": "Sombre",
		"lang.label": "Langue de l’interface",
		"lang.doc": "Langue du document",
		"status.ready": "Prêt",
		"status.loading": "Ouverture du document…",
		"status.saving": "Écriture du PDF…",
		"status.pages": "{n} pages",
		"status.unsaved": "Marques non enregistrées",
		"status.rendering": "Rendu de la page {n}…",
		"help.title": "Guide de l’atelier",
		"help.body": "Survolez un outil pour l’explication. Le texte sous le pointeur est toujours sélectionnable.",
		"help.shortcuts": "Raccourcis",
		"help.kOpen": "Ouvrir",
		"help.kSave": "Enregistrer",
		"help.kPrint": "Imprimer",
		"help.kZoom": "Zoom",
		"help.kFit": "Ajuster à la largeur",
		"help.kPages": "Page préc. / suiv.",
		"error.open": "Impossible d’ouvrir ce fichier.",
		"error.password": "Mot de passe incorrect.",
		"error.ai": "Échec de la traduction. Essayez une sélection plus courte.",
		"error.drive": "Impossible d’atteindre Google Drive.",
		"error.word": "Ceci n’est pas un document Word.",
		"error.print": "Impossible d’ouvrir l’impression.",
		"target.en": "Anglais",
		"target.es": "Espagnol",
		"target.fr": "Français",
		"target.de": "Allemand",
		"target.pt": "Portugais",
		"target.it": "Italien",
		"target.ja": "Japonais",
		"target.zh": "Chinois",
		"target.ko": "Coréen",
		"target.ar": "Arabe",
		"target.hi": "Hindi",
		"target.nl": "Néerlandais",
		"target.ru": "Russe"
	},
	de: { ...en },
	pt: { ...en },
	it: { ...en },
	ja: { ...en },
	zh: { ...en },
	ko: { ...en },
	ar: { ...en },
	hi: { ...en },
	nl: { ...en },
	ru: { ...en }
};
function overlay(lang, extra) {
	dictionaries[lang] = {
		...en,
		...extra
	};
}
overlay("de", {
	"app.tagline": "Dokumente, komponiert.",
	"app.subtitle": "PDF, Word und Google Docs im Browser lesen, bearbeiten, schützen und teilen.",
	"action.open": "Öffnen",
	"action.save": "PDF speichern",
	"action.print": "Drucken",
	"action.share": "Teilen",
	"action.convert": "Konvertieren",
	"action.protect": "Schützen",
	"action.sign": "Unterschreiben",
	"action.translate": "Übersetzen",
	"action.rotate": "Drehen",
	"action.close": "Schließen",
	"action.cancel": "Abbrechen",
	"action.apply": "Übernehmen",
	"action.delete": "Löschen",
	"action.done": "Fertig",
	"action.download": "Herunterladen",
	"action.copy": "Kopieren",
	"action.unlock": "Entsperren",
	"action.place": "Auf Seite setzen",
	"action.run": "Starten",
	"action.add": "Hinzufügen",
	"tool.select": "Auswählen",
	"tool.pan": "Verschieben",
	"tool.edit": "PDF bearbeiten",
	"tool.highlight": "Markieren",
	"tool.comment": "Kommentieren",
	"tool.redact": "Schwärzen",
	"tool.sign": "Signatur stempeln",
	"view.zoomIn": "Vergrößern",
	"view.zoomOut": "Verkleinern",
	"view.fitWidth": "Breite anpassen",
	"view.fitPage": "Seite anpassen",
	"view.pageUp": "Seite hoch",
	"view.pageDown": "Seite runter",
	"view.pageOf": "Seite {n} von {total}",
	"file.openPdf": "PDF öffnen",
	"file.openWord": "Word öffnen",
	"file.sample": "Beispieldokument öffnen",
	"file.dropTitle": "Dokument ablegen",
	"empty.title": "Ein ruhigeres Studio für ernste Dokumente.",
	"theme.light": "Hell",
	"theme.dark": "Dunkel",
	"lang.label": "Oberflächensprache",
	"status.ready": "Bereit",
	"status.loading": "Dokument wird geöffnet…",
	"protect.title": "Mit Passwort schützen",
	"translate.title": "Sprachumwandlung",
	"print.title": "Drucken",
	"share.title": "Teilen und exportieren"
});
overlay("pt", {
	"app.tagline": "Documentos, compostos.",
	"action.open": "Abrir",
	"action.save": "Guardar PDF",
	"action.print": "Imprimir",
	"action.share": "Partilhar",
	"action.convert": "Converter",
	"action.protect": "Proteger",
	"action.sign": "Assinar",
	"action.translate": "Traduzir",
	"action.rotate": "Rodar",
	"action.close": "Fechar",
	"action.cancel": "Cancelar",
	"theme.light": "Claro",
	"theme.dark": "Escuro",
	"lang.label": "Idioma da interface",
	"view.pageOf": "Página {n} de {total}",
	"file.sample": "Abrir documento de exemplo",
	"empty.title": "Um estúdio mais calmo para documentos sérios.",
	"status.ready": "Pronto",
	"status.loading": "A abrir documento…"
});
overlay("it", {
	"app.tagline": "Documenti, composti.",
	"action.open": "Apri",
	"action.save": "Salva PDF",
	"action.print": "Stampa",
	"action.share": "Condividi",
	"action.convert": "Converti",
	"action.protect": "Proteggi",
	"action.sign": "Firma",
	"action.translate": "Traduci",
	"action.rotate": "Ruota",
	"theme.light": "Chiaro",
	"theme.dark": "Scuro",
	"lang.label": "Lingua dell’interfaccia",
	"view.pageOf": "Pagina {n} di {total}",
	"empty.title": "Uno studio più quieto per documenti seri.",
	"status.ready": "Pronto"
});
overlay("ja", {
	"app.tagline": "文書を、編む。",
	"action.open": "開く",
	"action.save": "PDFを保存",
	"action.print": "印刷",
	"action.share": "共有",
	"action.convert": "変換",
	"action.protect": "保護",
	"action.sign": "署名",
	"action.translate": "翻訳",
	"action.rotate": "回転",
	"action.close": "閉じる",
	"action.cancel": "キャンセル",
	"action.apply": "適用",
	"theme.light": "ライト",
	"theme.dark": "ダーク",
	"lang.label": "表示言語",
	"view.pageOf": "{n} / {total} ページ",
	"file.sample": "サンプルを開く",
	"empty.title": "真剣な文書のための、静かなスタジオ。",
	"status.ready": "準備完了",
	"status.loading": "読み込み中…",
	"tool.select": "選択",
	"tool.pan": "移動",
	"tool.edit": "PDFを編集",
	"tool.highlight": "ハイライト",
	"tool.comment": "コメント",
	"tool.redact": "墨消し",
	"sidebar.pages": "ページ",
	"sidebar.bookmarks": "しおり",
	"sidebar.comments": "コメント"
});
overlay("zh", {
	"app.tagline": "文档，由此编排。",
	"action.open": "打开",
	"action.save": "保存 PDF",
	"action.print": "打印",
	"action.share": "分享",
	"action.convert": "转换",
	"action.protect": "保护",
	"action.sign": "签名",
	"action.translate": "翻译",
	"action.rotate": "旋转",
	"action.close": "关闭",
	"action.cancel": "取消",
	"action.apply": "应用",
	"theme.light": "浅色",
	"theme.dark": "深色",
	"lang.label": "界面语言",
	"view.pageOf": "第 {n} 页，共 {total} 页",
	"file.sample": "打开示例文档",
	"empty.title": "为严肃文档准备的安静工作室。",
	"status.ready": "就绪",
	"status.loading": "正在打开文档…",
	"tool.select": "选择",
	"tool.pan": "平移",
	"tool.edit": "编辑 PDF",
	"tool.highlight": "高亮",
	"tool.comment": "批注",
	"tool.redact": "密文",
	"sidebar.pages": "页面",
	"sidebar.bookmarks": "书签",
	"sidebar.comments": "批注"
});
overlay("ko", {
	"app.tagline": "문서를, 구성하다.",
	"action.open": "열기",
	"action.save": "PDF 저장",
	"action.print": "인쇄",
	"action.share": "공유",
	"action.convert": "변환",
	"action.protect": "보호",
	"action.sign": "서명",
	"action.translate": "번역",
	"action.rotate": "회전",
	"theme.light": "밝게",
	"theme.dark": "어둡게",
	"lang.label": "인터페이스 언어",
	"view.pageOf": "{n} / {total}페이지",
	"empty.title": "진지한 문서를 위한 조용한 스튜디오.",
	"status.ready": "준비됨"
});
overlay("ar", {
	"app.tagline": "وثائق، مؤلَّفة.",
	"action.open": "فتح",
	"action.save": "حفظ PDF",
	"action.print": "طباعة",
	"action.share": "مشاركة",
	"action.convert": "تحويل",
	"action.protect": "حماية",
	"action.sign": "توقيع",
	"action.translate": "ترجمة",
	"action.rotate": "تدوير",
	"action.close": "إغلاق",
	"action.cancel": "إلغاء",
	"theme.light": "فاتح",
	"theme.dark": "داكن",
	"lang.label": "لغة الواجهة",
	"view.pageOf": "صفحة {n} من {total}",
	"empty.title": "استوديو أكثر هدوءًا للمستندات الجادة.",
	"status.ready": "جاهز",
	"status.loading": "جارٍ فتح المستند…",
	"tool.select": "تحديد",
	"tool.comment": "تعليق",
	"tool.redact": "تنقيح",
	"sidebar.bookmarks": "إشارات"
});
overlay("hi", {
	"app.tagline": "दस्तावेज़, रचे हुए।",
	"action.open": "खोलें",
	"action.save": "PDF सहेजें",
	"action.print": "प्रिंट",
	"action.share": "साझा करें",
	"action.convert": "परिवर्तित करें",
	"action.protect": "सुरक्षित करें",
	"action.sign": "हस्ताक्षर",
	"action.translate": "अनुवाद",
	"theme.light": "हल्का",
	"theme.dark": "गहरा",
	"lang.label": "इंटरफ़ेस भाषा",
	"view.pageOf": "पृष्ठ {n} / {total}",
	"empty.title": "गंभीर दस्तावेज़ों के लिए एक शांत स्टूडियो।",
	"status.ready": "तैयार"
});
overlay("nl", {
	"app.tagline": "Documenten, gecomponeerd.",
	"action.open": "Openen",
	"action.save": "PDF opslaan",
	"action.print": "Afdrukken",
	"action.share": "Delen",
	"action.convert": "Converteren",
	"action.protect": "Beveiligen",
	"action.sign": "Ondertekenen",
	"action.translate": "Vertalen",
	"theme.light": "Licht",
	"theme.dark": "Donker",
	"lang.label": "Interfacetaal",
	"view.pageOf": "Pagina {n} van {total}",
	"empty.title": "Een stillere studio voor serieuze documenten.",
	"status.ready": "Gereed"
});
overlay("ru", {
	"app.tagline": "Документы, собранные вместе.",
	"action.open": "Открыть",
	"action.save": "Сохранить PDF",
	"action.print": "Печать",
	"action.share": "Поделиться",
	"action.convert": "Конвертировать",
	"action.protect": "Защитить",
	"action.sign": "Подписать",
	"action.translate": "Перевести",
	"theme.light": "Светлая",
	"theme.dark": "Тёмная",
	"lang.label": "Язык интерфейса",
	"view.pageOf": "Стр. {n} из {total}",
	"empty.title": "Спокойная студия для серьёзных документов.",
	"status.ready": "Готово",
	"status.loading": "Открытие документа…"
});
function langMeta(code) {
	return LANGS.find((l) => l.code === code) ?? LANGS[0];
}
function translate(lang, key, params) {
	let s = (dictionaries[lang] ?? en)[key] ?? en[key] ?? key;
	if (params) for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, String(v));
	return s;
}
var DB = "foliosyne";
var STORE = "files";
function openDb() {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB, 1);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}
async function putFile(file) {
	const db = await openDb();
	await new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, "readwrite");
		tx.objectStore(STORE).put(file);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
	db.close();
}
async function getFile(id) {
	const db = await openDb();
	const row = await new Promise((resolve, reject) => {
		const req = db.transaction(STORE, "readonly").objectStore(STORE).get(id);
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
	db.close();
	return row;
}
async function listRecentMeta() {
	const db = await openDb();
	const rows = await new Promise((resolve, reject) => {
		const req = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
		req.onsuccess = () => resolve(req.result ?? []);
		req.onerror = () => reject(req.error);
	});
	db.close();
	return rows.map((r) => ({
		id: r.id,
		name: r.name,
		kind: r.kind,
		size: r.bytes.byteLength,
		savedAt: r.savedAt
	})).sort((a, b) => b.savedAt - a.savedAt).slice(0, 8);
}
var pdfjs = null;
var current = null;
var pageCache = /* @__PURE__ */ new Map();
var metricsCache = /* @__PURE__ */ new Map();
async function loadPdfjs() {
	if (pdfjs) return pdfjs;
	const mod = await import("../_libs/pdfjs-dist.mjs").then((n) => n.t);
	try {
		const WorkerCtor = (await import("./pdf.worker.min-D8mGC_hv.mjs")).default;
		const port = new WorkerCtor();
		mod.GlobalWorkerOptions.workerPort = port;
	} catch {
		const worker = await import("./pdf.worker.min-C4v1Kq3M.mjs");
		mod.GlobalWorkerOptions.workerSrc = worker.default;
	}
	pdfjs = mod;
	return mod;
}
async function destroyOpenPdf() {
	pageCache.clear();
	metricsCache.clear();
	if (current) try {
		await current.cleanup();
	} catch {}
	current = null;
}
async function openPdfBytes(bytes, password) {
	const lib = await loadPdfjs();
	await destroyOpenPdf();
	const data = new Uint8Array(bytes.byteLength);
	data.set(bytes);
	try {
		const task = lib.getDocument({
			data,
			password: password || void 0,
			cMapUrl: `https://unpkg.com/pdfjs-dist@${lib.version}/cmaps/`,
			cMapPacked: true,
			standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${lib.version}/standard_fonts/`
		});
		const pdf = await Promise.race([task.promise, new Promise((_, reject) => {
			globalThis.setTimeout(() => reject(/* @__PURE__ */ new Error("Timed out opening this PDF.")), 2e4);
		})]);
		current = pdf;
		return {
			ok: true,
			pdf,
			pageCount: pdf.numPages
		};
	} catch (err) {
		const name = err.name ?? "";
		const msg = err instanceof Error ? err.message : String(err);
		if (name === "PasswordException" || /password/i.test(msg)) return {
			ok: false,
			needPassword: true
		};
		return {
			ok: false,
			needPassword: false,
			message: msg
		};
	}
}
async function getPage(pageNumber) {
	const cached = pageCache.get(pageNumber);
	if (cached) return cached;
	if (!current) throw new Error("No PDF open");
	const page = await current.getPage(pageNumber);
	pageCache.set(pageNumber, page);
	return page;
}
async function getPageMetrics(pageNumber, extraRotation = 0) {
	const key = pageNumber * 10 + (extraRotation % 360 + 360) % 360;
	const hit = metricsCache.get(key);
	if (hit) return hit;
	const page = await getPage(pageNumber);
	const vp = page.getViewport({
		scale: 1,
		rotation: ((page.rotate + extraRotation) % 360 + 360) % 360
	});
	const m = {
		width: vp.width,
		height: vp.height,
		rotation: extraRotation
	};
	metricsCache.set(key, m);
	return m;
}
async function extractPageLayout(pageNumber, extraRotation = 0) {
	const page = await getPage(pageNumber);
	const rot = ((page.rotate + extraRotation) % 360 + 360) % 360;
	const viewport = page.getViewport({
		scale: 1,
		rotation: rot
	});
	const content = await page.getTextContent();
	const spans = [];
	const fontStyles = content.styles ?? {};
	for (const raw of content.items) {
		if (!raw || typeof raw !== "object" || !("str" in raw)) continue;
		const item = raw;
		const text = item.str;
		if (!text) continue;
		const tx = item.transform ?? [
			1,
			0,
			0,
			1,
			0,
			0
		];
		const x0 = tx[4] ?? 0;
		const y0 = tx[5] ?? 0;
		const w0 = item.width ?? 0;
		const h0 = item.height ?? Math.hypot(tx[0] ?? 0, tx[1] ?? 0);
		const p1 = viewport.convertToViewportPoint(x0, y0);
		const p2 = viewport.convertToViewportPoint(x0 + w0, y0 + h0);
		const x = Math.min(p1[0], p2[0]);
		const y = Math.min(p1[1], p2[1]);
		const w = Math.max(1, Math.abs(p2[0] - p1[0]));
		const h = Math.max(1, Math.abs(p2[1] - p1[1]));
		const fontSize = Math.max(h, Math.hypot(tx[0] ?? 0, tx[1] ?? 0));
		const fontName = item.fontName || "";
		const family = fontStyles[fontName]?.fontFamily || fontName;
		spans.push({
			text,
			x,
			y,
			w,
			h,
			fontSize,
			fontName: family || fontName,
			bold: /bold|black|heavy|semibold/i.test(`${family} ${fontName}`),
			italic: /italic|oblique/i.test(`${family} ${fontName}`)
		});
	}
	spans.sort((a, b) => a.y === b.y ? a.x - b.x : a.y - b.y);
	const lines = [];
	for (const span of spans) {
		const last = lines[lines.length - 1];
		if (last && Math.abs(span.y - last.y) <= Math.max(span.fontSize, last.fontSize) * .45 && last) {
			const gap = span.x - (last.x + last.w);
			const joiner = gap > span.fontSize * .35 ? " " : gap > 1.5 ? " " : "";
			last.text += joiner + span.text;
			last.w = Math.max(last.w, span.x + span.w - last.x);
			last.h = Math.max(last.h, span.h);
			last.fontSize = Math.max(last.fontSize, span.fontSize);
			last.bold = last.bold || span.bold;
			last.italic = last.italic || span.italic;
			last.spans.push(span);
		} else lines.push({
			text: span.text,
			x: span.x,
			y: span.y,
			w: span.w,
			h: span.h,
			fontSize: span.fontSize,
			fontName: span.fontName,
			bold: span.bold,
			italic: span.italic,
			spans: [span]
		});
	}
	return {
		widthPt: viewport.width,
		heightPt: viewport.height,
		lines
	};
}
async function extractPageText(pageNumber) {
	return (await extractPageLayout(pageNumber)).lines.map((l) => l.text).join("\n");
}
async function extractDocumentText(pageCount, onPage) {
	const parts = [];
	for (let i = 1; i <= pageCount; i++) {
		onPage?.(i);
		const t = await extractPageText(i);
		if (t) parts.push(t);
	}
	return parts.join("\n\n");
}
function isHeadingRun(it) {
	return typeof it === "object" && it !== null && "str" in it && typeof it.str === "string";
}
async function detectHeadings(pageCount, pageOrder) {
	const found = [];
	const seen = /* @__PURE__ */ new Set();
	for (let display = 0; display < pageOrder.length; display++) {
		const original = pageOrder[display];
		const content = await (await getPage(original + 1)).getTextContent();
		const items = [];
		for (const it of content.items) if (isHeadingRun(it)) items.push(it);
		if (!items.length) continue;
		const heights = items.map((it) => it.height).filter((h) => h > 0);
		heights.sort((a, b) => a - b);
		const median = heights[Math.floor(heights.length / 2)] ?? 10;
		const threshold = Math.max(median * 1.35, 13);
		for (const it of items) {
			const str = it.str.trim();
			if (str.length < 3 || str.length > 80) continue;
			if (!(it.height >= threshold || /^[A-Z0-9][A-Z0-9 \-:,'’]{4,}$/.test(str) && str.length < 60)) continue;
			const key = `${original}:${str.toLowerCase()}`;
			if (seen.has(key)) continue;
			seen.add(key);
			found.push({
				id: uid("bm"),
				title: str,
				pageIndex: original,
				auto: true
			});
		}
	}
	return found;
}
async function outlineBookmarks() {
	if (!current) return [];
	try {
		const outline = await current.getOutline();
		if (!outline?.length) return [];
		const dest = async (item) => {
			let pageIndex = 0;
			try {
				const d = item.dest;
				if (typeof d === "string") {
					const ref = (await current.getDestination(d))?.[0];
					if (ref) pageIndex = Math.max(0, await current.getPageIndex(ref));
				} else if (Array.isArray(d) && d[0]) pageIndex = Math.max(0, await current.getPageIndex(d[0]));
			} catch {
				pageIndex = 0;
			}
			return {
				id: uid("bm"),
				title: (item.title || "Untitled").trim(),
				pageIndex,
				auto: true
			};
		};
		const out = [];
		const walk = async (items) => {
			for (const it of items) {
				out.push(await dest(it));
				if (Array.isArray(it.items) && it.items.length) await walk(it.items);
			}
		};
		await walk(outline);
		return out;
	} catch {
		return [];
	}
}
async function rasterizePage(opts) {
	const page = await getPage(opts.pageNumber);
	const extra = opts.extraRotation ?? 0;
	const rot = ((page.rotate + extra) % 360 + 360) % 360;
	const scale = opts.scale ?? 2;
	const viewport = page.getViewport({
		scale,
		rotation: rot
	});
	const canvas = document.createElement("canvas");
	canvas.width = Math.max(1, Math.floor(viewport.width));
	canvas.height = Math.max(1, Math.floor(viewport.height));
	const ctx = canvas.getContext("2d", { alpha: false });
	if (!ctx) throw new Error("Could not rasterize page");
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	let lastError;
	for (let attempt = 0; attempt < 8; attempt++) try {
		await page.render({
			canvasContext: ctx,
			viewport,
			canvas
		}).promise;
		lastError = null;
		break;
	} catch (err) {
		lastError = err;
		await new Promise((r) => setTimeout(r, 120));
	}
	if (lastError) throw lastError;
	if (opts.redactions?.length) {
		ctx.fillStyle = "#000000";
		for (const r of opts.redactions) {
			const pad = 2;
			ctx.fillRect(r.x * canvas.width - pad, r.y * canvas.height - pad, r.w * canvas.width + 4, r.h * canvas.height + 4);
		}
	}
	const mime = opts.mime ?? "image/png";
	const blob = await new Promise((resolve, reject) => {
		canvas.toBlob((b) => b ? resolve(b) : reject(/* @__PURE__ */ new Error("Rasterize failed")), mime, opts.quality ?? .88);
	});
	const bytes = new Uint8Array(await blob.arrayBuffer());
	const base = page.getViewport({
		scale: 1,
		rotation: rot
	});
	return {
		bytes,
		widthPx: canvas.width,
		heightPx: canvas.height,
		widthPt: base.width,
		heightPt: base.height
	};
}
function rgbHex(r, g, b) {
	const h = (n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
	return `${h(r)}${h(g)}${h(b)}`.toUpperCase();
}
function isPaperish(r, g, b) {
	return r > 220 && g > 210 && b > 200 && Math.abs(r - g) < 30 && Math.abs(g - b) < 30;
}
/** Full-page JPEG with glyphs knocked out so Word can overlay real text. */
async function rasterizePageBackdrop(opts) {
	const page = await getPage(opts.pageNumber);
	const extra = opts.extraRotation ?? 0;
	const rot = ((page.rotate + extra) % 360 + 360) % 360;
	const scale = 2;
	const viewport = page.getViewport({
		scale,
		rotation: rot
	});
	const canvas = document.createElement("canvas");
	canvas.width = Math.max(1, Math.floor(viewport.width));
	canvas.height = Math.max(1, Math.floor(viewport.height));
	const ctx = canvas.getContext("2d", { alpha: false });
	if (!ctx) throw new Error("Could not rasterize page");
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	await page.render({
		canvasContext: ctx,
		viewport,
		canvas
	}).promise;
	const w = canvas.width;
	const h = canvas.height;
	const sample = (x, y) => {
		const px = ctx.getImageData(Math.max(0, Math.min(w - 1, Math.round(x))), Math.max(0, Math.min(h - 1, Math.round(y))), 1, 1).data;
		return {
			r: px[0],
			g: px[1],
			b: px[2]
		};
	};
	const corners = [
		sample(8, 8),
		sample(w - 8, 8),
		sample(8, h - 8),
		sample(w - 8, h - 8),
		sample(w / 2, h / 2)
	];
	const paper = corners.find((c) => isPaperish(c.r, c.g, c.b)) ?? corners[0];
	const paperCss = `rgb(${paper.r},${paper.g},${paper.b})`;
	const colored = opts.lines.map((line) => {
		const sx = (line.x + Math.min(6, line.w * .15)) * scale;
		const sy = (line.y + line.h * .55) * scale;
		let best = sample(sx, sy);
		if (isPaperish(best.r, best.g, best.b)) best = sample(sx + 4, sy);
		if (isPaperish(best.r, best.g, best.b)) best = {
			r: 28,
			g: 25,
			b: 23
		};
		return {
			...line,
			color: rgbHex(best.r, best.g, best.b)
		};
	});
	ctx.fillStyle = paperCss;
	for (const line of opts.lines) {
		const pad = Math.max(2, line.fontSize * .12) * scale;
		ctx.fillRect(line.x * scale - pad, line.y * scale - pad * .4, line.w * scale + pad * 2, line.h * scale + pad * 1.1);
	}
	if (opts.redactions?.length) {
		ctx.fillStyle = "#000000";
		for (const r of opts.redactions) ctx.fillRect(r.x * w - 2, r.y * h - 2, r.w * w + 4, r.h * h + 4);
	}
	const blob = await new Promise((resolve, reject) => {
		canvas.toBlob((b) => b ? resolve(b) : reject(/* @__PURE__ */ new Error("Rasterize failed")), "image/jpeg", .9);
	});
	const bytes = new Uint8Array(await blob.arrayBuffer());
	const base = page.getViewport({
		scale: 1,
		rotation: rot
	});
	return {
		bytes,
		widthPt: base.width,
		heightPt: base.height,
		lines: colored
	};
}
async function paintTextOnRaster(raster, overlays) {
	const blob = new Blob([new Uint8Array(raster.bytes)], { type: "image/png" });
	const bmp = await createImageBitmap(blob);
	const canvas = document.createElement("canvas");
	canvas.width = raster.widthPx;
	canvas.height = raster.heightPx;
	const ctx = canvas.getContext("2d");
	if (!ctx) return raster.bytes;
	ctx.drawImage(bmp, 0, 0);
	bmp.close();
	const W = canvas.width;
	const H = canvas.height;
	const pt = W / raster.widthPt;
	for (const o of overlays) {
		const x = o.x * W;
		const y = o.y * H;
		const w = Math.max(8, o.w * W);
		const h = Math.max(8, o.h * H);
		if (o.knockout) {
			ctx.fillStyle = "#F4EEE6";
			ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
		}
		const sizePx = Math.max(8, (o.fontSize ?? 12) * pt);
		const weight = o.bold ? "700" : "400";
		ctx.font = `${o.italic ? "italic" : "normal"} ${weight} ${sizePx}px ${o.fontFamily || "Times New Roman"}`;
		ctx.fillStyle = o.color?.startsWith("#") ? o.color : `#${o.color || "1C1917"}`;
		ctx.textBaseline = "top";
		ctx.textAlign = o.align === "center" ? "center" : o.align === "right" ? "right" : "left";
		const tx = o.align === "center" ? x + w / 2 : o.align === "right" ? x + w : x + 1;
		const lines = (o.text || "").split("\n");
		let ty = y + 1;
		for (const line of lines) {
			ctx.fillText(line, tx, ty, w);
			if (o.underline || o.strike) {
				const tw = Math.min(w, ctx.measureText(line).width);
				const x0 = o.align === "center" ? tx - tw / 2 : o.align === "right" ? tx - tw : tx;
				ctx.strokeStyle = ctx.fillStyle;
				ctx.lineWidth = Math.max(1, sizePx * .06);
				ctx.beginPath();
				if (o.underline) {
					ctx.moveTo(x0, ty + sizePx * .95);
					ctx.lineTo(x0 + tw, ty + sizePx * .95);
				}
				if (o.strike) {
					ctx.moveTo(x0, ty + sizePx * .5);
					ctx.lineTo(x0 + tw, ty + sizePx * .5);
				}
				ctx.stroke();
			}
			ty += sizePx * 1.2;
		}
	}
	const out = await new Promise((resolve, reject) => {
		canvas.toBlob((b) => b ? resolve(b) : reject(/* @__PURE__ */ new Error("Paint failed")), "image/png");
	});
	return new Uint8Array(await out.arrayBuffer());
}
function rectsOverlap(a, b) {
	return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
function annotationCovers(annotations, pageIndex, box) {
	return annotations.some((a) => a.type === "redact" && a.pageIndex === pageIndex && rectsOverlap(a, box));
}
async function parseDocx(buffer) {
	const xml = await (await import_lib.default.loadAsync(buffer)).file("word/document.xml")?.async("string");
	if (!xml) throw new Error("Not a Word document");
	const parsed = new DOMParser().parseFromString(xml, "application/xml");
	const blocks = [];
	const paras = [...parsed.getElementsByTagName("*")].filter((el) => el.localName === "p" && el.namespaceURI?.includes("wordprocessingml"));
	const list = paras.length > 0 ? paras : [...parsed.getElementsByTagName("*")].filter((el) => el.localName === "p");
	for (const p of list) {
		const style = [...p.getElementsByTagName("*")].find((el) => el.localName === "pStyle");
		const val = style?.getAttribute("w:val") || style?.getAttribute("val") || "";
		let heading;
		if (/heading1|title/i.test(val)) heading = 1;
		else if (/heading2/i.test(val)) heading = 2;
		else if (/heading3/i.test(val)) heading = 3;
		const text = [...p.getElementsByTagName("*")].filter((el) => el.localName === "t").map((t) => t.textContent ?? "").join("");
		if (text.trim()) blocks.push({
			text: text.trim(),
			heading
		});
	}
	return blocks;
}
async function blocksToPdf(blocks, title) {
	const doc = await PDFDocument.create();
	const serif = await doc.embedFont(StandardFonts.TimesRoman);
	const serifBold = await doc.embedFont(StandardFonts.TimesRomanBold);
	const W = 612;
	const H = 792;
	const margin = 64;
	const max = 484;
	let page = doc.addPage([W, H]);
	let y = 720;
	const newPage = () => {
		page = doc.addPage([W, H]);
		y = 720;
	};
	const write = (text, size, bold) => {
		const font = bold ? serifBold : serif;
		const words = text.split(/\s+/);
		let line = "";
		const flush = () => {
			if (!line) return;
			if (y < 64) newPage();
			page.drawText(line, {
				x: margin,
				y,
				size,
				font,
				color: rgb(.11, .1, .09)
			});
			y -= size + 6;
			line = "";
		};
		for (const w of words) {
			const next = line ? `${line} ${w}` : w;
			if (font.widthOfTextAtSize(next, size) > max && line) flush();
			else line = next;
			if (!line) line = w;
		}
		flush();
		y -= 8;
	};
	page.drawText(title.replace(/\.[^.]+$/, "") || "Document", {
		x: margin,
		y,
		size: 22,
		font: serifBold,
		color: rgb(.11, .1, .09)
	});
	y -= 36;
	for (const b of blocks) if (b.heading === 1) write(b.text, 18, true);
	else if (b.heading === 2) write(b.text, 14, true);
	else if (b.heading === 3) write(b.text, 12, true);
	else write(b.text, 11.5, false);
	return doc.save();
}
function ptToTwip(pt) {
	return Math.max(0, Math.round(pt * 20));
}
function ptToPx(pt) {
	return Math.max(1, Math.round(pt * 96 / 72));
}
function mapFont$1(name) {
	const n = name.toLowerCase();
	if (/courier|mono/.test(n)) return "Courier New";
	if (/helvetica|arial|sans|outfit|ui/.test(n)) return "Arial";
	return "Times New Roman";
}
function lineCovered(annotations, pageIndex, line, pageW, pageH) {
	return annotationCovers(annotations, pageIndex, {
		x: line.x / pageW,
		y: line.y / pageH,
		w: Math.max(line.w, 1) / pageW,
		h: Math.max(line.h, 1) / pageH
	});
}
function halfPoints(pt) {
	return Math.max(14, Math.min(96, Math.round(pt * 2)));
}
async function pdfPagesToDocx(opts) {
	const rotations = opts.rotations ?? {};
	const annotations = opts.annotations ?? [];
	const sections = [];
	for (let i = 0; i < opts.pageOrder.length; i++) {
		const original = opts.pageOrder[i];
		const extra = rotations[original] ?? 0;
		const layout = await extractPageLayout(original + 1, extra);
		const pageW = layout.widthPt;
		const pageH = layout.heightPt;
		const landscape = pageW > pageH;
		const redactions = annotations.filter((a) => a.type === "redact" && a.pageIndex === original).map((a) => ({
			x: a.x,
			y: a.y,
			w: a.w,
			h: a.h
		}));
		const backdrop = await rasterizePageBackdrop({
			pageNumber: original + 1,
			extraRotation: extra,
			lines: layout.lines,
			redactions
		});
		const visible = backdrop.lines.filter((line) => line.text.trim() && !lineCovered(annotations, original, line, pageW, pageH));
		const bg = new Paragraph({
			spacing: {
				before: 0,
				after: 0,
				line: 20,
				lineRule: LineRuleType.EXACT
			},
			children: [new ImageRun({
				type: "jpg",
				data: backdrop.bytes,
				transformation: {
					width: ptToPx(pageW),
					height: ptToPx(pageH)
				},
				floating: {
					horizontalPosition: {
						relative: HorizontalPositionRelativeFrom.PAGE,
						offset: 0
					},
					verticalPosition: {
						relative: VerticalPositionRelativeFrom.PAGE,
						offset: 0
					},
					wrap: { type: TextWrappingType.NONE },
					behindDocument: true,
					allowOverlap: true
				}
			})]
		});
		const framed = visible.map((line) => {
			const trimmed = line.text.replace(/\s+/g, " ");
			const size = halfPoints(line.fontSize);
			return new Paragraph({
				frame: {
					type: "absolute",
					position: {
						x: ptToTwip(Math.max(0, line.x)),
						y: ptToTwip(Math.max(0, line.y))
					},
					width: ptToTwip(Math.max(line.w + 8, 24)),
					height: ptToTwip(Math.max(line.h + 2, line.fontSize + 2)),
					wrap: FrameWrap.NONE,
					anchor: {
						horizontal: FrameAnchorType.PAGE,
						vertical: FrameAnchorType.PAGE
					}
				},
				spacing: {
					before: 0,
					after: 0,
					line: Math.round(Math.max(line.fontSize, 8) * 20),
					lineRule: LineRuleType.EXACT
				},
				alignment: AlignmentType.START,
				children: [new TextRun({
					text: trimmed,
					bold: line.bold,
					italics: line.italic,
					size,
					font: mapFont$1(line.fontName),
					color: line.color || "1C1917"
				})]
			});
		});
		for (const a of annotations) {
			if (a.pageIndex !== original) continue;
			if ((a.type === "text" || a.type === "edit") && a.text?.trim()) framed.push(new Paragraph({
				frame: {
					type: "absolute",
					position: {
						x: ptToTwip(a.x * pageW),
						y: ptToTwip(a.y * pageH)
					},
					width: ptToTwip(Math.max(a.w * pageW, 48)),
					height: ptToTwip(Math.max(a.h * pageH, 16)),
					wrap: FrameWrap.NONE,
					anchor: {
						horizontal: FrameAnchorType.PAGE,
						vertical: FrameAnchorType.PAGE
					}
				},
				children: [new TextRun({
					text: a.text.trim(),
					size: halfPoints(a.fontSize ?? 12),
					font: a.fontFamily || "Times New Roman",
					bold: a.bold,
					italics: a.italic,
					underline: a.underline ? { type: "single" } : void 0,
					strike: a.strike,
					superScript: a.superScript,
					subScript: a.subScript,
					color: (a.color || "#1C1917").replace("#", "")
				})]
			}));
		}
		sections.push({
			properties: {
				type: SectionType.NEXT_PAGE,
				page: {
					size: {
						width: ptToTwip(pageW),
						height: ptToTwip(pageH),
						orientation: landscape ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT
					},
					margin: {
						top: 0,
						right: 0,
						bottom: 0,
						left: 0,
						header: 0,
						footer: 0
					}
				}
			},
			children: [bg, ...framed]
		});
	}
	const doc = new File$1({
		title: opts.title,
		creator: "Foliosyne",
		description: "Word conversion with page artwork and real editable text.",
		sections
	});
	return Packer.toBlob(doc);
}
var ink = rgb(.11, .1, .09);
var muted = rgb(.42, .39, .36);
var teal = rgb(.184, .365, .337);
var paper = rgb(.957, .937, .902);
var rule = rgb(.82, .78, .72);
function wrap(font, text, size, max) {
	const words = text.split(/\s+/);
	const lines = [];
	let cur = "";
	for (const w of words) {
		const next = cur ? `${cur} ${w}` : w;
		if (font.widthOfTextAtSize(next, size) > max && cur) {
			lines.push(cur);
			cur = w;
		} else cur = next;
	}
	if (cur) lines.push(cur);
	return lines;
}
async function buildSamplePdf() {
	const doc = await PDFDocument.create();
	const serif = await doc.embedFont(StandardFonts.TimesRoman);
	const serifBold = await doc.embedFont(StandardFonts.TimesRomanBold);
	const sans = await doc.embedFont(StandardFonts.Helvetica);
	await doc.embedFont(StandardFonts.HelveticaBold);
	const W = 612;
	const H = 792;
	const footer = (page, n, total) => {
		page.drawLine({
			start: {
				x: 64,
				y: 48
			},
			end: {
				x: 548,
				y: 48
			},
			thickness: .4,
			color: rule
		});
		page.drawText("Foliosyne  ·  Studio guide", {
			x: 64,
			y: 32,
			size: 9,
			font: sans,
			color: muted
		});
		page.drawText(`${n} / ${total}`, {
			x: 548 - sans.widthOfTextAtSize(`${n} / ${total}`, 9),
			y: 32,
			size: 9,
			font: sans,
			color: muted
		});
	};
	const heading = (page, title, y) => {
		page.drawText(title, {
			x: 64,
			y,
			size: 22,
			font: serifBold,
			color: ink
		});
		page.drawRectangle({
			x: 64,
			y: y - 10,
			width: 36,
			height: 2,
			color: teal
		});
	};
	const body = (page, text, yStart, size = 11.5) => {
		let y = yStart;
		for (const para of text.split("\n\n")) {
			for (const line of wrap(serif, para, size, 484)) {
				page.drawText(line, {
					x: 64,
					y,
					size,
					font: serif,
					color: ink
				});
				y -= size + 5;
			}
			y -= 8;
		}
		return y;
	};
	{
		const p = doc.addPage([W, H]);
		p.drawRectangle({
			x: 0,
			y: 0,
			width: W,
			height: H,
			color: paper
		});
		p.drawRectangle({
			x: 0,
			y: 774,
			width: W,
			height: 18,
			color: teal
		});
		p.drawRectangle({
			x: 0,
			y: 0,
			width: W,
			height: 18,
			color: teal
		});
		p.drawText("FOLIOSYNE", {
			x: 64,
			y: 520,
			size: 42,
			font: serifBold,
			color: ink
		});
		p.drawText("Documents, composed.", {
			x: 64,
			y: 478,
			size: 18,
			font: serif,
			color: teal
		});
		p.drawText("A sample eight-page document for the in-browser studio.", {
			x: 64,
			y: 430,
			size: 12,
			font: sans,
			color: muted
		});
		const notes = [
			"Read and search long PDFs without leaving the page.",
			"Edit, comment, redact, and sign — then save a real PDF.",
			"Convert to Word or Google Docs, and back again.",
			"Protect with a password. Translate a selection, a page, or the file."
		];
		let y = 360;
		for (const n of notes) {
			p.drawRectangle({
				x: 64,
				y: y + 2,
				width: 7,
				height: 7,
				color: teal
			});
			p.drawText(n, {
				x: 82,
				y,
				size: 11,
				font: serif,
				color: ink
			});
			y -= 28;
		}
		p.drawText("Open  ·  Annotate  ·  Convert  ·  Share", {
			x: 64,
			y: 96,
			size: 10,
			font: sans,
			color: muted
		});
	}
	[
		{
			title: "Reading & navigation",
			text: "Foliosyne renders pages on demand, so a long report does not stall the studio. Use the zoom controls, fit-width, and fit-page. Page Up and Page Down walk the document; the page stack in the rail jumps to a leaf immediately.\n\nMove a page up or down in the stack when the order is wrong. Rotate a single page, a typed range such as 2-5, 9, or the whole file — ninety degrees at a time, or one hundred eighty.\n\nWhen the pointer rests on words, it becomes a text-selection cursor. Drag to copy. Nothing extra to switch on."
		},
		{
			title: "Editing, comments, signatures",
			text: "Add text boxes where the original layout needs a correction. Highlight a passage. Drop a comment pin and write the note — every comment also lives in the side rail.\n\nSignatures come three ways: typed full name, typed initials, or a photograph of a real signature in JPG, PNG, or WebP. White paper behind a photo is knocked out so the ink sits on the page. Save a signature once, stamp it on any page.\n\nMarks stay on the document until you save. Saving bakes them into a new PDF you can download, print, or share."
		},
		{
			title: "Protect, redact, convert",
			text: "Set an open password. Foliosyne encrypts the file with AES-256 when you save, so the next reader must know the phrase.\n\nRedaction is a drag rectangle. On export the cover is opaque, and redacted runs are omitted from Word, Google Docs, and translation so the hidden words do not leak through a conversion.\n\nConvert a PDF to Word for further drafting, or to Google Docs via a .docx plus formatted HTML you can paste. Word files and Google Docs exports (.docx) convert the other way — into a clean PDF you can sign and protect."
		},
		{
			title: "Translate & cloud",
			text: "Choose a target language, then convert the current selection, this page, or the whole document. Place the translation as a text box, or copy it.\n\nThe interface itself has a language menu in the top bar: every label, tooltip, and help dialogue follows that choice, including right-to-left Arabic.\n\nShare downloads the file, uses the system share sheet when the browser allows it, or sends you toward Drive, Dropbox, Box, OneDrive, and iCloud. Printers discovered on this Wi-Fi appear in the system print dialog — save Home and Work labels so the destination is obvious."
		},
		{
			title: "Bookmarks & large files",
			text: "Detect section headings automatically, or pin a custom placeholder on the page you are looking at. Click a bookmark to travel. Outlines already inside a PDF are imported when the file opens.\n\nThumbnails on the left keep place in a long deck. Only pages near the viewport are painted, so a hundred-leaf contract stays responsive.\n\nLight is the default paper. Dark mode inverts the chrome, not the page ink, so proofs stay readable at night."
		},
		{
			title: "Keyboard shortcuts",
			text: "Ctrl or Cmd with O opens a file. S saves a PDF. P prints. Plus and minus zoom; 0 fits the width. Page Up and Page Down turn leaves. Escape closes a panel or cancels a drawing tool. Delete removes the selected mark.\n\nHover any tool for a short explanation. The Help panel repeats this map in the language you chose.\n\nThis sample is itself a PDF generated in the studio — save it, sign it, redact a line, translate a paragraph, and convert it to Word to confirm the round trip."
		},
		{
			title: "Colophon",
			text: "Foliosyne is an editorial name: folio, a leaf of paper; syne, together. It is not Adobe, not Acrobat, and not a cloud locker pretending to be a reader.\n\nWork stays in this browser until you export. There is no account wall on the studio floor. Drive import uses the Drive already connected to the Grok session when that grant exists.\n\nPrint through the operating system so home and office printers on Wi-Fi — AirPrint, IPP, shared queues — are the ones you already trust.\n\nSet a language. Set a mode. Open something that matters."
		}
	].forEach((block, i) => {
		const p = doc.addPage([W, H]);
		p.drawRectangle({
			x: 0,
			y: 0,
			width: W,
			height: H,
			color: paper
		});
		p.drawRectangle({
			x: 0,
			y: 784,
			width: W,
			height: 8,
			color: teal
		});
		heading(p, block.title, 704);
		body(p, block.text, 662);
		footer(p, i + 2, 8);
	});
	const last = doc.getPage(doc.getPageCount() - 1);
	last.drawText("Foliosyne", {
		x: 64,
		y: 120,
		size: 14,
		font: serifBold,
		color: teal
	});
	last.setRotation(degrees(0));
	return await doc.save();
}
var SETTINGS_KEY = "foliosyne-settings";
function loadSettings() {
	return {
		theme: "light",
		lang: "en",
		homePrinter: "Home printer",
		workPrinter: "Work printer",
		signatures: []
	};
}
function persist(s) {
	try {
		localStorage.setItem(SETTINGS_KEY, JSON.stringify({
			theme: s.theme,
			lang: s.lang,
			homePrinter: s.homePrinter,
			workPrinter: s.workPrinter,
			signatures: s.signatures
		}));
	} catch {}
}
var initialDoc = {
	name: "",
	kind: null,
	bytes: null,
	pageCount: 0,
	pageOrder: [],
	rotations: {},
	annotations: [],
	bookmarks: [],
	currentPage: 1,
	scale: 1.1,
	fit: "width",
	tool: "select",
	panel: null,
	status: "",
	dirty: false,
	loading: false,
	password: "",
	pendingPassword: false,
	pendingBytes: null,
	pendingName: "",
	userPassword: "",
	selection: null,
	activeAnnotation: null,
	activeSignature: null,
	draftComment: "",
	leftOpen: true,
	rightTab: "bookmarks",
	zoomTick: 0,
	printMode: false
};
var useAppStore = create((set, get) => ({
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
		set({
			homePrinter,
			workPrinter
		});
		persist(get());
	},
	addSignature: (sig) => {
		set({
			signatures: [...get().signatures, sig],
			activeSignature: sig
		});
		persist(get());
	},
	removeSignature: (id) => {
		set({
			signatures: get().signatures.filter((s) => s.id !== id),
			activeSignature: get().activeSignature?.id === id ? null : get().activeSignature
		});
		persist(get());
	},
	setActiveSignature: (sig) => set({
		activeSignature: sig,
		tool: sig ? "sign" : get().tool
	}),
	resetDocument: () => set({
		...initialDoc,
		status: get().status
	}),
	setDocument: ({ name, kind, bytes, pageCount }) => set({
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
		printMode: false
	}),
	setLoading: (loading) => set({ loading }),
	setStatus: (status) => set({ status }),
	setScale: (scale, fit = "custom") => {
		const next = Math.max(.25, Math.min(4, scale));
		const cur = get();
		if (cur.scale === next && cur.fit === fit) return;
		set({
			scale: next,
			fit,
			zoomTick: cur.zoomTick + 1
		});
	},
	setTool: (tool) => set({
		tool,
		panel: tool === "sign" && !get().activeSignature ? "sign" : get().panel
	}),
	setPanel: (panel) => set({ panel }),
	setCurrentPage: (currentPage) => {
		const next = Math.max(1, Math.min(get().pageCount || 1, currentPage));
		if (get().currentPage === next) return;
		set({ currentPage: next });
	},
	setSelection: (selection) => set({ selection }),
	setPasswordGate: (pendingBytes, pendingName) => set({
		pendingPassword: true,
		pendingBytes,
		pendingName,
		panel: "password"
	}),
	clearPasswordGate: () => set({
		pendingPassword: false,
		pendingBytes: null,
		pendingName: "",
		panel: null
	}),
	setOpenPassword: (password) => set({ password }),
	setUserPassword: (userPassword) => set({
		userPassword,
		dirty: true
	}),
	addAnnotation: (a) => {
		const id = a.id ?? uid("ann");
		const next = {
			...a,
			id,
			createdAt: Date.now()
		};
		set({
			annotations: [...get().annotations, next],
			dirty: true,
			activeAnnotation: id
		});
		return id;
	},
	updateAnnotation: (id, patch) => set({
		annotations: get().annotations.map((x) => x.id === id ? {
			...x,
			...patch
		} : x),
		dirty: true
	}),
	removeAnnotation: (id) => set({
		annotations: get().annotations.filter((x) => x.id !== id),
		activeAnnotation: get().activeAnnotation === id ? null : get().activeAnnotation,
		dirty: true
	}),
	setActiveAnnotation: (activeAnnotation) => set({ activeAnnotation }),
	setBookmarks: (bookmarks) => set({ bookmarks }),
	addBookmark: (b) => set({ bookmarks: [...get().bookmarks, {
		...b,
		id: b.id ?? uid("bm")
	}] }),
	removeBookmark: (id) => set({ bookmarks: get().bookmarks.filter((b) => b.id !== id) }),
	rotatePages: (originalIndices, delta) => {
		const rotations = { ...get().rotations };
		for (const i of originalIndices) rotations[i] = (((rotations[i] ?? 0) + delta) % 360 + 360) % 360;
		set({
			rotations,
			dirty: true,
			zoomTick: get().zoomTick + 1
		});
	},
	movePage: (displayIndex, dir) => {
		const order = [...get().pageOrder];
		const j = displayIndex + dir;
		if (j < 0 || j >= order.length) return;
		const tmp = order[displayIndex];
		order[displayIndex] = order[j];
		order[j] = tmp;
		set({
			pageOrder: order,
			dirty: true,
			currentPage: j + 1
		});
	},
	setDraftComment: (draftComment) => set({ draftComment }),
	setLeftOpen: (leftOpen) => set({ leftOpen }),
	setRightTab: (rightTab) => set({ rightTab }),
	markSaved: () => set({ dirty: false }),
	setPrintMode: (printMode) => set({ printMode }),
	seedEdits: (list) => {
		if (!list.length) return;
		const have = new Set(get().annotations.filter((a) => a.type === "edit" && a.source === "pdf").map((a) => `${a.pageIndex}:${a.y.toFixed(4)}:${a.x.toFixed(4)}`));
		const extra = list.filter((a) => {
			const key = `${a.pageIndex}:${a.y.toFixed(4)}:${a.x.toFixed(4)}`;
			if (have.has(key)) return false;
			have.add(key);
			return true;
		});
		if (!extra.length) return;
		set({ annotations: [...get().annotations, ...extra] });
	}
}));
function useT() {
	const lang = useAppStore((s) => s.lang);
	return (key, params) => translate(lang, key, params);
}
async function ingestPdf(bytes, name, password) {
	const store = useAppStore.getState();
	store.setLoading(true);
	store.setStatus("Opening document…");
	try {
		const result = await openPdfBytes(bytes, password);
		if (!result.ok && result.needPassword) {
			store.setLoading(false);
			store.setStatus("");
			store.setPasswordGate(bytes, name);
			return;
		}
		if (!result.ok) {
			store.setLoading(false);
			store.setStatus("");
			toast.error(result.message || "Could not open that file.");
			return;
		}
		store.setDocument({
			name,
			kind: "pdf",
			bytes,
			pageCount: result.pageCount
		});
		store.setOpenPassword(password || "");
		try {
			const outlined = await outlineBookmarks();
			if (outlined.length) store.setBookmarks(outlined);
			else {
				const auto = await detectHeadings(result.pageCount, Array.from({ length: result.pageCount }, (_, i) => i));
				store.setBookmarks(auto);
			}
		} catch {}
		try {
			await putFile({
				id: uid("file"),
				name,
				kind: "pdf",
				bytes: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
				savedAt: Date.now()
			});
		} catch {}
	} catch (err) {
		toast.error(err instanceof Error ? err.message : "Could not open that file.");
	} finally {
		const s = useAppStore.getState();
		s.setLoading(false);
		s.setStatus("");
	}
}
async function ingestDocx(buffer, name) {
	const store = useAppStore.getState();
	store.setLoading(true);
	try {
		await ingestPdf(await blocksToPdf(await parseDocx(buffer), name), name.replace(/\.docx?$/i, "") + ".pdf");
	} catch (err) {
		store.setLoading(false);
		store.setStatus("");
		toast.error(err instanceof Error ? err.message : "Not a Word document");
	}
}
async function ingestFile(file) {
	try {
		const name = file.name || "document";
		const buf = await file.arrayBuffer();
		const bytes = new Uint8Array(buf);
		const lower = name.toLowerCase();
		if (lower.endsWith(".docx") || lower.endsWith(".doc")) {
			await ingestDocx(buf, name);
			return;
		}
		await ingestPdf(bytes, name.endsWith(".pdf") ? name : `${name}.pdf`);
	} catch (err) {
		useAppStore.getState().setLoading(false);
		useAppStore.getState().setStatus("");
		toast.error(err instanceof Error ? err.message : "Could not open that file.");
	}
}
async function openSampleDocument() {
	const store = useAppStore.getState();
	store.setLoading(true);
	store.setStatus("Opening sample…");
	try {
		await ingestPdf(await buildSamplePdf(), "Foliosyne studio guide.pdf");
	} catch (err) {
		store.setLoading(false);
		store.setStatus("");
		toast.error(err instanceof Error ? err.message : "Could not open the sample document.");
	}
}
function mapFont(name) {
	const n = name.toLowerCase();
	if (/courier|mono/.test(n)) return "Courier New";
	if (/helvetica|arial|sans|outfit|ui/.test(n)) return "Arial";
	if (/georgia/.test(n)) return "Georgia";
	return "Times New Roman";
}
var seeding = /* @__PURE__ */ new Set();
async function seedPageEdits(pageIndex, extraRotation = 0) {
	const s = useAppStore.getState();
	if (seeding.has(pageIndex)) return;
	if (s.annotations.some((a) => a.type === "edit" && a.source === "pdf" && a.pageIndex === pageIndex)) return;
	seeding.add(pageIndex);
	try {
		const layout = await extractPageLayout(pageIndex + 1, extraRotation);
		const list = [];
		for (const line of layout.lines) {
			const text = line.text.replace(/\s+/g, " ");
			if (!text.trim()) continue;
			list.push({
				id: uid("ann"),
				type: "edit",
				pageIndex,
				x: line.x / layout.widthPt,
				y: line.y / layout.heightPt,
				w: Math.max(.03, (line.w + 6) / layout.widthPt),
				h: Math.max(.016, (line.h + 3) / layout.heightPt),
				text,
				fontFamily: mapFont(line.fontName),
				fontSize: line.fontSize,
				bold: line.bold,
				italic: line.italic,
				color: "#1C1917",
				align: "left",
				source: "pdf",
				createdAt: Date.now()
			});
		}
		useAppStore.getState().seedEdits(list);
	} finally {
		seeding.delete(pageIndex);
	}
}
var EDIT_FONTS = [
	"Times New Roman",
	"Georgia",
	"Garamond",
	"Arial",
	"Calibri",
	"Courier New"
];
function pdfBox(page, a) {
	const { width, height } = page.getSize();
	return {
		x: a.x * width,
		y: height - (a.y + a.h) * height,
		w: a.w * width,
		h: a.h * height
	};
}
function wrapFont(font, text, size, max) {
	const words = text.split(/\s+/);
	const lines = [];
	let cur = "";
	for (const w of words) {
		const next = cur ? `${cur} ${w}` : w;
		if (font.widthOfTextAtSize(next, size) > max && cur) {
			lines.push(cur);
			cur = w;
		} else cur = next;
	}
	if (cur) lines.push(cur);
	return lines;
}
async function drawMarks(page, list, out, helv, helvBold, skipRedact) {
	for (const a of list) {
		const box = pdfBox(page, a);
		if (a.type === "redact") {
			if (skipRedact) continue;
			page.drawRectangle({
				x: box.x,
				y: box.y,
				width: box.w,
				height: box.h,
				color: rgb(0, 0, 0)
			});
		} else if (a.type === "highlight") page.drawRectangle({
			x: box.x,
			y: box.y,
			width: box.w,
			height: box.h,
			color: rgb(.91, .79, .41),
			opacity: .38
		});
		else if (a.type === "text" && a.text) {
			if (skipRedact) continue;
			const size = Math.max(8, Math.min(18, box.h * .7));
			const lines = wrapFont(helv, a.text, size, Math.max(20, box.w - 4));
			let y = box.y + box.h - size - 2;
			for (const line of lines) {
				page.drawText(line, {
					x: box.x + 2,
					y,
					size,
					font: helv,
					color: rgb(.11, .1, .09),
					maxWidth: box.w - 4
				});
				y -= size + 2;
			}
		} else if (a.type === "comment") page.drawRectangle({
			x: box.x,
			y: box.y + box.h - 14,
			width: 14,
			height: 14,
			color: rgb(.95, .89, .63),
			borderColor: rgb(.55, .45, .2),
			borderWidth: .6
		});
		else if (a.type === "signature" && a.imageDataUrl) try {
			const bytes = dataUrlToBytes(a.imageDataUrl);
			const img = a.imageDataUrl.startsWith("data:image/jpeg") ? await out.embedJpg(bytes) : await out.embedPng(bytes);
			page.drawImage(img, {
				x: box.x,
				y: box.y,
				width: box.w,
				height: box.h
			});
		} catch {
			page.drawText(a.text || "Signature", {
				x: box.x,
				y: box.y + 4,
				size: 14,
				font: helvBold,
				color: rgb(.12, .2, .22)
			});
		}
	}
}
async function bakePdf(input) {
	const src = await PDFDocument.load(input.bytes, {
		ignoreEncryption: true,
		password: input.openPassword
	});
	const out = await PDFDocument.create();
	const helv = await out.embedFont(StandardFonts.Helvetica);
	const helvBold = await out.embedFont(StandardFonts.HelveticaBold);
	const byPage = /* @__PURE__ */ new Map();
	for (const a of input.annotations) {
		const list = byPage.get(a.pageIndex) ?? [];
		list.push(a);
		byPage.set(a.pageIndex, list);
	}
	for (let i = 0; i < input.pageOrder.length; i++) {
		const original = input.pageOrder[i];
		const extra = input.rotations[original] ?? 0;
		const list = byPage.get(original) ?? [];
		const redacts = list.filter((a) => a.type === "redact");
		const edits = list.filter((a) => a.type === "edit" || a.type === "text" && a.text);
		let page;
		let skipRedact = false;
		if (redacts.length > 0 || edits.length > 0) {
			const raster = await rasterizePage({
				pageNumber: original + 1,
				extraRotation: extra,
				redactions: redacts.map((a) => ({
					x: a.x,
					y: a.y,
					w: a.w,
					h: a.h
				})),
				scale: 2,
				mime: "image/png"
			});
			const painted = edits.length ? await paintTextOnRaster(raster, edits.map((a) => ({
				x: a.x,
				y: a.y,
				w: a.w,
				h: a.h,
				text: a.text || "",
				fontSize: a.fontSize,
				fontFamily: a.fontFamily,
				bold: a.bold,
				italic: a.italic,
				underline: a.underline,
				strike: a.strike,
				color: a.color,
				align: a.align,
				knockout: a.source === "pdf"
			}))) : raster.bytes;
			const img = await out.embedPng(painted);
			page = out.addPage([raster.widthPt, raster.heightPt]);
			page.drawImage(img, {
				x: 0,
				y: 0,
				width: raster.widthPt,
				height: raster.heightPt
			});
			skipRedact = true;
		} else {
			const [copied] = await out.copyPages(src, [original]);
			if (extra) {
				const current = copied.getRotation().angle;
				copied.setRotation(degrees(((current + extra) % 360 + 360) % 360));
			}
			out.addPage(copied);
			page = copied;
		}
		await drawMarks(page, list, out, helv, helvBold, skipRedact);
	}
	if (input.userPassword) out.encrypt({
		userPassword: input.userPassword,
		ownerPassword: input.ownerPassword || input.userPassword,
		permissions: {
			printing: "highResolution",
			modifying: false,
			copying: true,
			annotating: true,
			fillingForms: true,
			contentAccessibility: true,
			documentAssembly: false
		}
	});
	return out.save();
}
function parsePageRange(input, pageCount) {
	const out = /* @__PURE__ */ new Set();
	for (const part of input.split(",")) {
		const bit = part.trim();
		if (!bit) continue;
		const m = bit.match(/^(\d+)\s*-\s*(\d+)$/);
		if (m) {
			let a = Number(m[1]);
			let b = Number(m[2]);
			if (a > b) [a, b] = [b, a];
			for (let n = a; n <= b; n++) if (n >= 1 && n <= pageCount) out.add(n - 1);
		} else {
			const n = Number(bit);
			if (Number.isInteger(n) && n >= 1 && n <= pageCount) out.add(n - 1);
		}
	}
	return [...out];
}
function bytesToBlobUrl(bytes) {
	const copy = new Uint8Array(bytes.byteLength);
	copy.set(bytes);
	return URL.createObjectURL(new Blob([copy], { type: "application/pdf" }));
}
function removeFrame() {
	document.getElementById("folio-print-frame")?.remove();
}
/**
* Print the baked PDF itself (vector pages, exact count and size).
* Never print the studio HTML — that is what created blank/split sheets.
*/
async function printStudio() {
	const s = useAppStore.getState();
	s.setPanel(null);
	if (!s.bytes || s.pageOrder.length < 1) {
		window.print();
		return;
	}
	s.setStatus("Preparing print…");
	removeFrame();
	try {
		const url = bytesToBlobUrl(await bakePdf({
			bytes: s.bytes,
			pageOrder: s.pageOrder,
			rotations: s.rotations,
			annotations: s.annotations,
			openPassword: s.password || void 0
		}));
		const iframe = document.createElement("iframe");
		iframe.id = "folio-print-frame";
		iframe.title = "Print preview";
		iframe.setAttribute("aria-hidden", "true");
		iframe.src = url;
		iframe.style.cssText = [
			"position:fixed",
			"top:0",
			"left:0",
			"width:100vw",
			"height:100vh",
			"border:0",
			"margin:0",
			"padding:0",
			"opacity:0.02",
			"pointer-events:none",
			"z-index:2147483646",
			"background:#fff"
		].join(";");
		document.body.appendChild(iframe);
		let printed = false;
		const cleanup = () => {
			removeFrame();
			URL.revokeObjectURL(url);
			useAppStore.getState().setStatus("");
		};
		const trigger = () => {
			if (printed) return;
			printed = true;
			try {
				iframe.contentWindow?.focus();
				iframe.contentWindow?.print();
			} catch {
				const w = window.open(url, "_blank");
				w?.addEventListener("load", () => w.print());
			}
		};
		iframe.addEventListener("load", () => {
			try {
				iframe.contentWindow?.addEventListener("afterprint", cleanup, { once: true });
			} catch {}
			window.setTimeout(trigger, 350);
		});
		window.setTimeout(trigger, 1600);
		window.addEventListener("afterprint", cleanup, { once: true });
		window.setTimeout(cleanup, 18e4);
	} catch (err) {
		useAppStore.getState().setStatus("");
		throw err;
	}
}
function FolioMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className,
		"aria-hidden": "true",
		fill: "none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: "32",
				height: "32",
				rx: "7",
				className: "fill-paper"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M8.5 6.5h11.2L24.5 11.4V24a2.5 2.5 0 0 1-2.5 2.5H8.5A2.5 2.5 0 0 1 6 24V9a2.5 2.5 0 0 1 2.5-2.5z",
				className: "fill-accent"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M19.6 6.6v5.2h5.3",
				stroke: "currentColor",
				className: "stroke-accent-fg",
				strokeWidth: "1.4",
				strokeLinejoin: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M10.5 16.2h11M10.5 19.6h8.5",
				className: "stroke-accent-fg",
				strokeWidth: "1.3",
				strokeLinecap: "round"
			})
		]
	});
}
var Dialog = Dialog$1;
function DialogContent({ className, children, title, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "no-print fixed inset-0 z-50 bg-ink/40 data-[state=open]:animate-in" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("no-print fixed start-1/2 top-1/2 z-50 w-[min(520px,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-surface p-5 text-fg shadow-[var(--shadow-border)] outline-none", className),
		...props,
		children: [
			title ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				className: "font-display text-xl font-medium tracking-tight",
				children: title
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				className: "sr-only",
				children: "Dialog"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
				className: "absolute end-3 top-3 rounded-sm p-2 text-muted hover:bg-paper hover:text-fg",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children
			})
		]
	})] });
}
var Input = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
	ref,
	className: cn("flex h-10 w-full rounded-sm border border-border bg-surface px-3 text-sm text-fg placeholder:text-subtle outline-none focus-visible:ring-2 focus-visible:ring-accent/40", className),
	...props
}));
Input.displayName = "Input";
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
	ref,
	className: cn("flex min-h-24 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-subtle outline-none focus-visible:ring-2 focus-visible:ring-accent/40", className),
	...props
}));
Textarea.displayName = "Textarea";
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var searchDriveFiles = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("f1aca2be139248f5ec7cee55bc3924e7833c0f67726a4561980fcf7dbdcf4b04"));
var readDriveFile = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("5c1453c38c9410f20b2343c4347b4a9f22bfc9979c4388bb9f2225ba388b7772"));
var translateDocumentText = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("11be0401cd8211b14c08ac491e05df6a570c09aec92533fc1c553c503b7bcd45"));
async function renderTypedSignature(text, kind) {
	const family = "Great Vibes";
	const size = kind === "initials" ? 128 : 96;
	try {
		await document.fonts.load(`${size}px "${family}"`);
	} catch {}
	const canvas = document.createElement("canvas");
	canvas.width = kind === "initials" ? 520 : 900;
	canvas.height = 220;
	const ctx = canvas.getContext("2d");
	if (!ctx) return canvas.toDataURL("image/png");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#1c1917";
	ctx.font = `${size}px "${family}", "Palatino Linotype", cursive`;
	ctx.textBaseline = "middle";
	ctx.fillText(text.trim() || "Signature", 36, canvas.height / 2);
	return canvas.toDataURL("image/png");
}
function knockOutWhite(source) {
	const canvas = document.createElement("canvas");
	canvas.width = source.naturalWidth || source.width;
	canvas.height = source.naturalHeight || source.height;
	const ctx = canvas.getContext("2d");
	if (!ctx) return source.src;
	ctx.drawImage(source, 0, 0);
	const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const d = img.data;
	for (let i = 0; i < d.length; i += 4) {
		const r = d[i];
		const g = d[i + 1];
		const b = d[i + 2];
		if (r > 232 && g > 232 && b > 232) d[i + 3] = 0;
	}
	ctx.putImageData(img, 0, 0);
	return canvas.toDataURL("image/png");
}
function loadImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => reject(/* @__PURE__ */ new Error("image"));
		img.src = src;
	});
}
function AppPanels() {
	const panel = useAppStore((s) => s.panel);
	const setPanel = useAppStore((s) => s.setPanel);
	const t = useT();
	const titleMap = {
		convert: t("convert.title"),
		protect: t("protect.title"),
		sign: t("sign.title"),
		translate: t("translate.title"),
		share: t("share.title"),
		print: t("print.title"),
		rotate: t("rotate.title"),
		password: t("file.passwordTitle"),
		help: t("help.title"),
		cloud: t("share.title")
	};
	if (!(panel !== null)) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (v) => !v && setPanel(null),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			title: panel ? titleMap[panel] : void 0,
			children: [
				panel === "convert" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConvertPanel, {}),
				panel === "protect" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProtectPanel, {}),
				panel === "sign" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignPanel, {}),
				panel === "translate" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TranslatePanel, {}),
				panel === "share" || panel === "cloud" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SharePanel, {}) : null,
				panel === "rotate" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotatePanel, {}),
				panel === "password" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordPanel, {}),
				panel === "help" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HelpPanel, {})
			]
		})
	});
}
function ConvertPanel() {
	const t = useT();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const name = useAppStore((s) => s.name);
	const pageOrder = useAppStore((s) => s.pageOrder);
	const rotations = useAppStore((s) => s.rotations);
	const annotations = useAppStore((s) => s.annotations);
	const bytes = useAppStore((s) => s.bytes);
	const toWord = async () => {
		if (!bytes) return;
		setBusy(true);
		try {
			downloadBlob(await pdfPagesToDocx({
				title: stemFilename(name),
				pageOrder,
				rotations,
				annotations
			}), `${stemFilename(name)}.docx`);
			toast.success(t("convert.done"));
		} catch {
			toast.error(t("error.open"));
		} finally {
			setBusy(false);
		}
	};
	const toGdoc = async () => {
		if (!bytes) return;
		setBusy(true);
		try {
			downloadBlob(await pdfPagesToDocx({
				title: stemFilename(name),
				pageOrder,
				rotations,
				annotations
			}), `${stemFilename(name)}.docx`);
			toast.success(t("convert.copied"));
		} catch {
			toast.error(t("error.open"));
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: t("convert.hintWord")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				disabled: busy || !bytes,
				onClick: () => void toWord(),
				children: busy ? t("convert.working") : t("convert.toWord")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: t("convert.hintGdoc")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				disabled: busy || !bytes,
				onClick: () => void toGdoc(),
				children: t("convert.toGdoc")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: t("convert.hintPdf")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "inline-flex",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "file",
					accept: ".docx,.pdf",
					className: "hidden",
					onChange: (e) => {
						const f = e.target.files?.[0];
						if (f) ingestFile(f);
					}
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("convert.toPdf") })
				})]
			})
		]
	});
}
function ProtectPanel() {
	const t = useT();
	const [pass, setPass] = (0, import_react.useState)("");
	const [confirm, setConfirm] = (0, import_react.useState)("");
	const [owner, setOwner] = (0, import_react.useState)("");
	const userPassword = useAppStore((s) => s.userPassword);
	const setUserPassword = useAppStore((s) => s.setUserPassword);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: t("protect.hint")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "text-xs font-medium text-muted",
				children: [t("protect.user"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "password",
					className: "mt-1",
					value: pass,
					onChange: (e) => setPass(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "text-xs font-medium text-muted",
				children: [t("protect.confirm"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "password",
					className: "mt-1",
					value: confirm,
					onChange: (e) => setConfirm(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "text-xs font-medium text-muted",
				children: [t("protect.owner"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "password",
					className: "mt-1",
					value: owner,
					onChange: (e) => setOwner(e.target.value)
				})]
			}),
			userPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-success",
				children: t("protect.locked")
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => {
						if (pass !== confirm) {
							toast.error(t("protect.mismatch"));
							return;
						}
						setUserPassword(pass);
						toast.success(t("protect.locked"));
					},
					children: t("protect.apply")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: () => setUserPassword(""),
					children: t("protect.remove")
				})]
			})
		]
	});
}
function SignPanel() {
	const t = useT();
	const [tab, setTab] = (0, import_react.useState)("typed");
	const [full, setFull] = (0, import_react.useState)("");
	const [initials, setInitials] = (0, import_react.useState)("");
	const [preview, setPreview] = (0, import_react.useState)(null);
	const signatures = useAppStore((s) => s.signatures);
	const addSignature = useAppStore((s) => s.addSignature);
	const removeSignature = useAppStore((s) => s.removeSignature);
	const setActiveSignature = useAppStore((s) => s.setActiveSignature);
	const setPanel = useAppStore((s) => s.setPanel);
	const setTool = useAppStore((s) => s.setTool);
	(0, import_react.useEffect)(() => {
		let live = true;
		const run = async () => {
			if (tab === "typed" && full.trim()) {
				const url = await renderTypedSignature(full, "full");
				if (live) setPreview(url);
			} else if (tab === "initials" && initials.trim()) {
				const url = await renderTypedSignature(initials, "initials");
				if (live) setPreview(url);
			}
		};
		run();
		return () => {
			live = false;
		};
	}, [
		tab,
		full,
		initials
	]);
	const save = (kind, name, dataUrl) => {
		const sig = {
			id: uid("sig"),
			name,
			kind,
			dataUrl
		};
		addSignature(sig);
		setTool("sign");
		setPanel(null);
		toast.success(t("action.place"));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1 rounded-md bg-paper p-1",
				children: [
					"typed",
					"initials",
					"upload"
				].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: `h-8 flex-1 rounded-sm text-sm ${tab === k ? "bg-surface text-fg" : "text-muted"}`,
					onClick: () => setTab(k),
					children: t(`sign.${k}`)
				}, k))
			}),
			tab === "typed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: t("sign.placeholder"),
				value: full,
				onChange: (e) => setFull(e.target.value)
			}) : null,
			tab === "initials" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: t("sign.initialsPh"),
				value: initials,
				onChange: (e) => setInitials(e.target.value),
				maxLength: 6
			}) : null,
			tab === "upload" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: t("sign.formats")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "file",
					accept: "image/jpeg,image/png,image/webp,image/jpg",
					onChange: async (e) => {
						const f = e.target.files?.[0];
						if (!f) return;
						const url = URL.createObjectURL(f);
						try {
							const img = await loadImage(url);
							setPreview(knockOutWhite(img));
						} finally {
							URL.revokeObjectURL(url);
						}
					}
				})]
			}) : null,
			preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-md bg-paper p-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: preview,
					alt: "",
					className: "mx-auto h-20 object-contain"
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: t("sign.empty")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				disabled: !preview,
				onClick: () => preview && save(tab, tab === "initials" ? initials || "Initials" : full || "Signature", preview),
				children: t("action.place")
			}),
			signatures.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-xs font-medium text-muted",
				children: t("sign.saved")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: signatures.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-2 rounded-sm bg-paper p-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: s.dataUrl,
							alt: "",
							className: "h-8 w-20 object-contain"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex-1 truncate text-sm",
							children: s.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => {
								setActiveSignature(s);
								setTool("sign");
								setPanel(null);
							},
							children: t("sign.use")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => removeSignature(s.id),
							children: t("action.delete")
						})
					]
				}, s.id))
			})] }) : null
		]
	});
}
function TranslatePanel() {
	const t = useT();
	const [target, setTarget] = (0, import_react.useState)("es");
	const [scope, setScope] = (0, import_react.useState)("selection");
	const [result, setResult] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const selection = useAppStore((s) => s.selection);
	const currentPage = useAppStore((s) => s.currentPage);
	const pageOrder = useAppStore((s) => s.pageOrder);
	const pageCount = useAppStore((s) => s.pageCount);
	const addAnnotation = useAppStore((s) => s.addAnnotation);
	const run = async () => {
		let text = "";
		if (scope === "selection") text = selection?.text ?? "";
		else if (scope === "page") text = await extractPageText((pageOrder[currentPage - 1] ?? 0) + 1);
		else text = await extractDocumentText(pageCount);
		if (!text.trim()) {
			toast.error(t("translate.needSelection"));
			return;
		}
		setBusy(true);
		try {
			const res = await translateDocumentText({ data: {
				text,
				targetLang: target
			} });
			if (!res.ok) {
				toast.error(res.error === "unavailable" ? t("translate.unavailable") : t("error.ai"));
				return;
			}
			setResult(res.text);
		} catch {
			toast.error(t("error.ai"));
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "text-xs font-medium text-muted",
				children: [t("translate.target"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					className: "mt-1 h-10 w-full rounded-sm border border-border bg-surface px-2 text-sm",
					value: target,
					onChange: (e) => setTarget(e.target.value),
					children: LANGS.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: l.code,
						children: t(`target.${l.code}`)
					}, l.code))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1",
				children: [
					"selection",
					"page",
					"document"
				].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: scope === s ? "default" : "outline",
					onClick: () => setScope(s),
					children: t(`translate.${s}`)
				}, s))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				disabled: busy,
				onClick: () => void run(),
				children: busy ? t("translate.working") : t("translate.run")
			}),
			result ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				readOnly: true,
				value: result,
				className: "min-h-32"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: () => {
						const sel = selection;
						addAnnotation({
							type: "text",
							pageIndex: sel?.pageIndex ?? pageOrder[currentPage - 1] ?? 0,
							x: sel?.x ?? .1,
							y: (sel?.y ?? .1) + (sel?.h ?? .05) + .01,
							w: Math.max(sel?.w ?? .6, .4),
							h: .12,
							text: result
						});
						toast.success(t("translate.replace"));
					},
					children: t("translate.replace")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: () => {
						navigator.clipboard.writeText(result);
						toast.success(t("translate.copied"));
					},
					children: t("action.copy")
				})]
			})] }) : null
		]
	});
}
function unpackDrive(raw) {
	let data = null;
	if (raw.json) try {
		data = JSON.parse(raw.json);
	} catch {
		data = raw.json;
	}
	return {
		ok: raw.ok,
		data,
		errorMessage: raw.errorMessage,
		loginRequired: raw.loginRequired,
		loginUrl: raw.loginUrl
	};
}
function SharePanel() {
	const t = useT();
	const [query, setQuery] = (0, import_react.useState)("");
	const [results, setResults] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const name = useAppStore((s) => s.name);
	const bytes = useAppStore((s) => s.bytes);
	const pageOrder = useAppStore((s) => s.pageOrder);
	const rotations = useAppStore((s) => s.rotations);
	const annotations = useAppStore((s) => s.annotations);
	const userPassword = useAppStore((s) => s.userPassword);
	const password = useAppStore((s) => s.password);
	const baked = async () => {
		if (!bytes) return null;
		return bakePdf({
			bytes,
			pageOrder,
			rotations,
			annotations,
			userPassword: userPassword || void 0,
			openPassword: password || void 0
		});
	};
	const download = async () => {
		const out = await baked();
		if (!out) return;
		downloadBlob(bytesToBlob(out, "application/pdf"), name || "foliosyne.pdf");
	};
	const share = async () => {
		const out = await baked();
		if (!out) return;
		const file = new File([bytesToBlob(out, "application/pdf")], name || "foliosyne.pdf", { type: "application/pdf" });
		if (navigator.share && navigator.canShare?.({ files: [file] })) try {
			await navigator.share({
				files: [file],
				title: name
			});
			return;
		} catch {}
		downloadBlob(file, file.name);
		toast.message(t("share.unsupported"));
	};
	const search = async () => {
		setBusy(true);
		try {
			const res = unpackDrive(await searchDriveFiles({ data: { query } }));
			if (redirectToLoginIfRequired(res)) return;
			if (!res.ok) {
				toast.error(t("share.connect"));
				return;
			}
			const items = normalizeDriveList(res.data);
			setResults(items);
			if (!items.length) toast.message(t("share.noResults"));
		} catch {
			toast.error(t("error.drive"));
		} finally {
			setBusy(false);
		}
	};
	const openDrive = async (id, fileName) => {
		setBusy(true);
		try {
			const res = unpackDrive(await readDriveFile({ data: { fileId: id } }));
			if (redirectToLoginIfRequired(res)) return;
			if (!res.ok || res.data == null) {
				toast.error(t("error.drive"));
				return;
			}
			const fileBytes = decodeDriveFile(res.data);
			if (fileBytes) await ingestPdf(fileBytes, fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
		} catch {
			toast.error(t("error.drive"));
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [
			bytes ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: t("share.hint")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => void download(),
					children: t("share.download")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: () => void share(),
					children: t("share.webShare")
				})]
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: t("share.driveHint")
			}),
			bytes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: t("share.driveHint")
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: query,
					placeholder: t("share.search"),
					onChange: (e) => setQuery(e.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					disabled: busy,
					onClick: () => void search(),
					children: t("share.search")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "max-h-40 overflow-auto text-sm",
				children: results.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-2 border-b border-border py-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate",
						children: r.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => void openDrive(r.id, r.name),
						children: t("share.openFile")
					})]
				}, r.id))
			})
		]
	});
}
function normalizeDriveList(data) {
	if (!data) return [];
	return (Array.isArray(data) ? data : typeof data === "object" && data && "files" in data && Array.isArray(data.files) ? data.files : typeof data === "object" && data && "items" in data && Array.isArray(data.items) ? data.items : []).map((item) => {
		if (!item || typeof item !== "object") return null;
		const rec = item;
		const id = String(rec.id ?? rec.fileId ?? rec.documentId ?? "");
		const name = String(rec.name ?? rec.title ?? rec.filename ?? id);
		if (!id) return null;
		return {
			id,
			name
		};
	}).filter((x) => x !== null);
}
function decodeDriveFile(data) {
	if (!data) return null;
	if (data instanceof ArrayBuffer) return new Uint8Array(data);
	if (data instanceof Uint8Array) return data;
	if (typeof data === "string") try {
		const bin = atob(data);
		const out = new Uint8Array(bin.length);
		for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
		return out;
	} catch {
		return null;
	}
	if (typeof data === "object") {
		const rec = data;
		if (typeof rec.content === "string") return decodeDriveFile(rec.content);
		if (typeof rec.data === "string") return decodeDriveFile(rec.data);
		if (typeof rec.base64 === "string") return decodeDriveFile(rec.base64);
	}
	return null;
}
function RotatePanel() {
	const t = useT();
	const [mode, setMode] = (0, import_react.useState)("this");
	const [range, setRange] = (0, import_react.useState)("");
	const currentPage = useAppStore((s) => s.currentPage);
	const pageCount = useAppStore((s) => s.pageCount);
	const pageOrder = useAppStore((s) => s.pageOrder);
	const rotatePages = useAppStore((s) => s.rotatePages);
	const targets = () => {
		if (mode === "this") return [pageOrder[currentPage - 1] ?? 0];
		if (mode === "all") return pageOrder.slice();
		return parsePageRange(range, pageCount).map((display) => pageOrder[display] ?? display);
	};
	const go = (delta) => {
		rotatePages(targets(), delta);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1",
				children: [
					"this",
					"all",
					"range"
				].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: mode === m ? "default" : "outline",
					onClick: () => setMode(m),
					children: t(`rotate.${m}`)
				}, m))
			}),
			mode === "range" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: t("rotate.rangeHint"),
				value: range,
				onChange: (e) => setRange(e.target.value)
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: () => go(-90),
						children: t("rotate.left")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: () => go(90),
						children: t("rotate.right")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => go(180),
						children: t("rotate.around")
					})
				]
			})
		]
	});
}
function PasswordPanel() {
	const t = useT();
	const [value, setValue] = (0, import_react.useState)("");
	const pendingBytes = useAppStore((s) => s.pendingBytes);
	const pendingName = useAppStore((s) => s.pendingName);
	const clearPasswordGate = useAppStore((s) => s.clearPasswordGate);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "flex flex-col gap-3",
		onSubmit: (e) => {
			e.preventDefault();
			if (!pendingBytes) return;
			const fileBytes = pendingBytes;
			const fileName = pendingName;
			clearPasswordGate();
			ingestPdf(fileBytes, fileName, value);
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: t("file.passwordHint")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				type: "password",
				autoFocus: true,
				value,
				onChange: (e) => setValue(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				children: t("action.unlock")
			})
		]
	});
}
function HelpPanel() {
	const t = useT();
	const rows = [
		["Cmd/Ctrl O", t("help.kOpen")],
		["Cmd/Ctrl S", t("help.kSave")],
		["Cmd/Ctrl P", t("help.kPrint")],
		["Cmd/Ctrl + -", t("help.kZoom")],
		["Cmd/Ctrl 0", t("help.kFit")],
		["PgUp / PgDn", t("help.kPages")]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: t("help.body")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-wide text-subtle",
				children: t("help.shortcuts")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "text-sm",
				children: rows.map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between gap-4 border-b border-border py-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-xs text-muted",
						children: k
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: v })]
				}, k))
			})
		]
	});
}
var ACCEPT = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
/**
* Always-mounted file input (visually hidden, NOT display:none) plus a pick()
* callback. Label+display:none inputs silently do nothing in iframes/WebKit.
*/
function FilePicker({ id, accept = ACCEPT, onFile, children }) {
	const ref = (0, import_react.useRef)(null);
	const pick = () => {
		const el = ref.current;
		if (!el) return;
		el.value = "";
		el.click();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		ref,
		id,
		type: "file",
		accept,
		className: "file-ghost",
		tabIndex: -1,
		"aria-hidden": "true",
		suppressHydrationWarning: true,
		onChange: (e) => {
			const f = e.target.files?.[0];
			if (f) onFile(f);
			e.currentTarget.value = "";
		}
	}), typeof children === "function" ? children(pick) : children] });
}
function focusAnnotField(id) {
	const run = () => {
		const el = document.querySelector(`[data-annot-id="${id}"]`);
		if (!el) return false;
		el.focus();
		if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
			const len = el.value.length;
			try {
				el.setSelectionRange(len, len);
			} catch {}
		}
		return true;
	};
	if (run()) return;
	requestAnimationFrame(() => {
		if (run()) return;
		window.setTimeout(run, 40);
	});
}
function PageView({ originalIndex, displayIndex, width, rotation, scale, tool }) {
	const hostRef = (0, import_react.useRef)(null);
	const canvasRef = (0, import_react.useRef)(null);
	const textRef = (0, import_react.useRef)(null);
	const printMode = useAppStore((s) => s.printMode);
	const [visible, setVisible] = (0, import_react.useState)(displayIndex < 3);
	const [height, setHeight] = (0, import_react.useState)(width * 1.294);
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
	const draft = (0, import_react.useRef)(null);
	const [draftBox, setDraftBox] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const el = hostRef.current;
		if (!el) return;
		const io = new IntersectionObserver((entries) => {
			for (const e of entries) if (e.isIntersecting) {
				setVisible(true);
				setCurrentPage(displayIndex + 1);
			}
		}, {
			rootMargin: "800px 0px",
			threshold: .05
		});
		io.observe(el);
		return () => io.disconnect();
	}, [displayIndex, setCurrentPage]);
	(0, import_react.useEffect)(() => {
		if (!show) return;
		let cancelled = false;
		let textLayer = null;
		const canvas = canvasRef.current;
		const textEl = textRef.current;
		if (!canvas || !textEl) return;
		delete canvas.dataset.rendered;
		(async () => {
			const page = await getPage(originalIndex + 1);
			if (cancelled) return;
			const rot = ((page.rotate + rotation) % 360 + 360) % 360;
			const viewport = page.getViewport({
				scale,
				rotation: rot
			});
			setHeight(viewport.height);
			const outputScale = Math.min(window.devicePixelRatio || 1, 2);
			canvas.width = Math.floor(viewport.width * outputScale);
			canvas.height = Math.floor(viewport.height * outputScale);
			canvas.style.width = `${viewport.width}px`;
			canvas.style.height = `${viewport.height}px`;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			const transform = outputScale !== 1 ? [
				outputScale,
				0,
				0,
				outputScale,
				0,
				0
			] : void 0;
			await page.render({
				canvasContext: ctx,
				viewport,
				canvas,
				transform
			}).promise;
			if (cancelled) return;
			canvas.dataset.rendered = "1";
			textEl.replaceChildren();
			textEl.style.width = `${viewport.width}px`;
			textEl.style.height = `${viewport.height}px`;
			const content = await page.getTextContent();
			const { TextLayer } = await import("../_libs/pdfjs-dist.mjs").then((n) => n.t);
			textLayer = new TextLayer({
				textContentSource: content,
				container: textEl,
				viewport
			});
			await textLayer.render();
		})().catch(() => {});
		return () => {
			cancelled = true;
			textLayer?.cancel();
		};
	}, [
		show,
		originalIndex,
		rotation,
		scale
	]);
	(0, import_react.useEffect)(() => {
		if (tool !== "edit") return;
		seedPageEdits(originalIndex, rotation);
	}, [
		tool,
		originalIndex,
		rotation
	]);
	const local = (e) => {
		const r = hostRef.current.getBoundingClientRect();
		return {
			x: (e.clientX - r.left) / r.width,
			y: (e.clientY - r.top) / r.height
		};
	};
	const drawing = tool === "redact" || tool === "highlight";
	const placing = tool === "comment" || tool === "sign" || tool === "edit";
	const onPointerDown = (e) => {
		if (tool === "select" || tool === "pan") return;
		if (e.target.closest("[data-annot]")) return;
		const p = local(e);
		if (drawing) {
			e.preventDefault();
			e.currentTarget.setPointerCapture(e.pointerId);
			draft.current = {
				x: p.x,
				y: p.y,
				w: 0,
				h: 0
			};
			setDraftBox(draft.current);
		} else if (placing) {
			if (tool === "sign") {
				if (!activeSignature) return;
				addAnnotation({
					type: "signature",
					pageIndex: originalIndex,
					x: p.x,
					y: p.y,
					w: .28,
					h: .08,
					imageDataUrl: activeSignature.dataUrl,
					text: activeSignature.name
				});
			} else if (tool === "edit") focusAnnotField(addAnnotation({
				type: "edit",
				pageIndex: originalIndex,
				x: Math.min(p.x, .7),
				y: Math.min(p.y, .94),
				w: .28,
				h: .04,
				text: "",
				fontFamily: "Times New Roman",
				fontSize: 12,
				color: "#1C1917",
				source: "user"
			}));
			else if (tool === "comment") {
				const id = addAnnotation({
					type: "comment",
					pageIndex: originalIndex,
					x: p.x,
					y: p.y,
					w: .04,
					h: .03,
					text: "",
					confirmed: false
				});
				setRightTab("comments");
				focusAnnotField(id);
			}
		}
	};
	const onPointerMove = (e) => {
		if (!draft.current) return;
		const p = local(e);
		const box = {
			x: Math.min(draft.current.x, p.x),
			y: Math.min(draft.current.y, p.y),
			w: Math.abs(p.x - draft.current.x),
			h: Math.abs(p.y - draft.current.y)
		};
		draft.current = box;
		setDraftBox(box);
	};
	const onPointerUp = () => {
		if (!draft.current) return;
		const box = draft.current;
		draft.current = null;
		setDraftBox(null);
		if (box.w < .008 && box.h < .008) return;
		addAnnotation({
			type: tool === "redact" ? "redact" : "highlight",
			pageIndex: originalIndex,
			...box
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
			h: r.height / host.height
		});
	};
	const pageAnnots = annotations.filter((a) => {
		if (a.pageIndex !== originalIndex) return false;
		if (a.type === "edit" && tool !== "edit") return false;
		return true;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: hostRef,
		className: "page-sheet relative mx-auto bg-white shadow-[var(--shadow-border)]",
		style: {
			width,
			height
		},
		"data-page": displayIndex + 1,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "absolute inset-0 size-full"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: textRef,
				className: "textLayer",
				onMouseUp: onTextSelect,
				style: {
					pointerEvents: tool === "select" ? "auto" : "none",
					opacity: tool === "edit" ? 0 : 1
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("annot-layer absolute inset-0", (tool === "select" || tool === "pan") && "pointer-events-none", tool === "pan" && "cursor-grab", drawing && "cursor-crosshair", placing && "cursor-copy"),
				onPointerDown,
				onPointerMove,
				onPointerUp,
				children: [pageAnnots.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnnotBox, {
					a,
					active: activeAnnotation === a.id,
					pageWidth: width,
					onSelect: () => setActiveAnnotation(a.id),
					onChange: (patch) => {
						updateAnnotation(a.id, patch);
						if (patch.confirmed) setActiveAnnotation(null);
					},
					onRemove: () => removeAnnotation(a.id),
					t
				}, a.id)), draftBox ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("absolute border", tool === "redact" ? "border-fg bg-ink/80" : "border-highlight bg-highlight/40"),
					style: {
						left: `${draftBox.x * 100}%`,
						top: `${draftBox.y * 100}%`,
						width: `${draftBox.w * 100}%`,
						height: `${draftBox.h * 100}%`
					}
				}) : null]
			})
		]
	});
}
function AnnotBox({ a, active, pageWidth, onSelect, onChange, onRemove, t }) {
	const inputRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!active) return;
		if (a.type !== "text" && a.type !== "comment" && a.type !== "edit") return;
		const id = window.setTimeout(() => {
			const el = inputRef.current;
			if (!el) return;
			el.focus();
			const len = el.value.length;
			try {
				el.setSelectionRange(len, len);
			} catch {}
		}, 0);
		return () => window.clearTimeout(id);
	}, [
		active,
		a.type,
		a.id
	]);
	const style = {
		left: `${a.x * 100}%`,
		top: `${a.y * 100}%`,
		width: `${a.w * 100}%`,
		height: `${a.h * 100}%`,
		pointerEvents: "auto"
	};
	if (a.type === "redact") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"data-annot": a.id,
		"aria-label": t("tool.redact"),
		className: cn("absolute bg-ink", active && "ring-2 ring-accent"),
		style,
		onPointerDown: (e) => e.stopPropagation(),
		onClick: (e) => {
			e.stopPropagation();
			onSelect();
		},
		onDoubleClick: onRemove
	});
	if (a.type === "highlight") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"data-annot": a.id,
		"aria-label": t("tool.highlight"),
		className: cn("absolute bg-highlight/45", active && "ring-2 ring-accent"),
		style,
		onPointerDown: (e) => e.stopPropagation(),
		onClick: (e) => {
			e.stopPropagation();
			onSelect();
		},
		onDoubleClick: onRemove
	});
	if (a.type === "signature") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"data-annot": a.id,
		className: cn("absolute", active && "ring-2 ring-accent"),
		style,
		onPointerDown: (e) => e.stopPropagation(),
		onClick: (e) => {
			e.stopPropagation();
			onSelect();
		},
		onDoubleClick: onRemove,
		children: a.imageDataUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: a.imageDataUrl,
			alt: a.text || t("action.sign"),
			className: "size-full object-contain",
			draggable: false
		}) : null
	});
	if (a.type === "text" || a.type === "edit") {
		const fontSize = (a.fontSize ?? 12) * pageWidth / 612;
		const editStyle = {
			...style,
			fontFamily: a.fontFamily || "Times New Roman",
			fontSize: `${fontSize}px`,
			fontWeight: a.bold ? 700 : 400,
			fontStyle: a.italic ? "italic" : "normal",
			textDecoration: [a.underline ? "underline" : "", a.strike ? "line-through" : ""].filter(Boolean).join(" ") || void 0,
			color: a.color || "#1C1917",
			textAlign: a.align || "left",
			paddingLeft: a.indent ? `${a.indent}px` : void 0,
			background: a.type === "edit" ? "color-mix(in oklab, var(--fs-paper) 88%, transparent)" : void 0
		};
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
			ref: inputRef,
			"data-annot": a.id,
			"data-annot-id": a.id,
			className: cn("absolute resize-none overflow-hidden leading-tight outline-none", active ? "ring-2 ring-accent" : a.type === "edit" ? "ring-1 ring-accent/25" : "border border-dashed border-accent/50 bg-surface/70"),
			style: editStyle,
			value: a.text ?? "",
			placeholder: a.type === "edit" ? "" : t("edit.addText"),
			autoFocus: active && a.source === "user",
			onFocus: onSelect,
			onChange: (e) => onChange({ text: e.target.value }),
			onPointerDown: (e) => e.stopPropagation(),
			onClick: (e) => e.stopPropagation(),
			onKeyDown: (e) => e.stopPropagation()
		});
	}
	const open = a.confirmed !== true;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-annot": a.id,
		className: "absolute z-10",
		style: {
			left: `${a.x * 100}%`,
			top: `${a.y * 100}%`,
			pointerEvents: "auto"
		},
		onPointerDown: (e) => e.stopPropagation(),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: cn("flex size-6 items-center justify-center rounded-[2px] bg-sticky text-ink shadow-[var(--shadow-border)]", active && "ring-2 ring-accent"),
			"aria-label": t("tool.comment"),
			onClick: (e) => {
				e.stopPropagation();
				onSelect();
			},
			onDoubleClick: (e) => {
				e.stopPropagation();
				onChange({ confirmed: false });
				onSelect();
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-3.5" })
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute start-7 top-0 z-20 w-56 rounded-md bg-surface p-2 shadow-[var(--shadow-border)]",
			onPointerDown: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				ref: inputRef,
				"data-annot-id": a.id,
				className: "min-h-16 w-full resize-none bg-transparent text-sm text-fg outline-none placeholder:text-subtle",
				placeholder: t("comment.placeholder"),
				value: a.text ?? "",
				autoFocus: true,
				onChange: (e) => onChange({ text: e.target.value }),
				onKeyDown: (e) => {
					e.stopPropagation();
					if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
						e.preventDefault();
						onChange({ confirmed: true });
					}
				},
				onClick: (e) => e.stopPropagation()
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1 flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-xs text-danger",
					onClick: onRemove,
					children: t("action.delete")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "inline-flex items-center gap-1 rounded-sm bg-accent px-2 py-1 text-xs text-accent-fg",
					onClick: () => onChange({ confirmed: true }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }), t("comment.confirm")]
				})]
			})]
		}) : null]
	});
}
function Viewer() {
	const pageOrder = useAppStore((s) => s.pageOrder);
	const rotations = useAppStore((s) => s.rotations);
	const scale = useAppStore((s) => s.scale);
	const fit = useAppStore((s) => s.fit);
	const tool = useAppStore((s) => s.tool);
	const zoomTick = useAppStore((s) => s.zoomTick);
	const setScale = useAppStore((s) => s.setScale);
	const setCurrentPage = useAppStore((s) => s.setCurrentPage);
	const scroller = (0, import_react.useRef)(null);
	const [pageWidth, setPageWidth] = (0, import_react.useState)(700);
	(0, import_react.useEffect)(() => {
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
				const next = Math.max(.35, avail / m.width);
				setPageWidth(m.width * next);
				setScale(next, "width");
			} else if (fit === "page") {
				const s = Math.max(.25, Math.min(avail / m.width, availH / m.height));
				setPageWidth(m.width * s);
				setScale(s, "page");
			}
		};
		apply();
		return () => {
			cancelled = true;
		};
	}, [
		fit,
		pageOrder,
		rotations,
		setScale
	]);
	(0, import_react.useEffect)(() => {
		if (fit !== "custom") return;
		const first = pageOrder[0] ?? 0;
		getPageMetrics(first + 1, rotations[first] ?? 0).then((m) => {
			setPageWidth(m.width * scale);
		});
	}, [
		fit,
		scale,
		pageOrder,
		rotations
	]);
	(0, import_react.useEffect)(() => {
		const el = scroller.current;
		if (!el) return;
		const onScroll = () => {
			const pages = el.querySelectorAll("[data-page]");
			const mid = el.scrollTop + el.clientHeight * .35;
			let best = 1;
			pages.forEach((p) => {
				if (p.offsetTop <= mid) best = Number(p.dataset.page) || best;
			});
			setCurrentPage(best);
		};
		el.addEventListener("scroll", onScroll, { passive: true });
		return () => el.removeEventListener("scroll", onScroll);
	}, [setCurrentPage]);
	(0, import_react.useEffect)(() => {
		const el = scroller.current;
		if (!el) return;
		const onWheel = (e) => {
			if (e.ctrlKey || e.metaKey) {
				e.preventDefault();
				setScale(scale + (e.deltaY < 0 ? .08 : -.08), "custom");
			}
		};
		el.addEventListener("wheel", onWheel, { passive: false });
		return () => el.removeEventListener("wheel", onWheel);
	}, [scale, setScale]);
	(0, import_react.useEffect)(() => {
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
		const onDown = (e) => {
			if (e.button !== 0) return;
			dragging = true;
			lastX = e.clientX;
			lastY = e.clientY;
			el.setPointerCapture(e.pointerId);
			el.style.cursor = "grabbing";
			e.preventDefault();
		};
		const onMove = (e) => {
			if (!dragging) return;
			el.scrollLeft -= e.clientX - lastX;
			el.scrollTop -= e.clientY - lastY;
			lastX = e.clientX;
			lastY = e.clientY;
		};
		const onUp = (e) => {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: scroller,
		className: "print-pages h-full overflow-auto px-3 py-6 md:px-8",
		style: { cursor: tool === "pan" ? "grab" : void 0 },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto flex flex-col gap-6 print:gap-0",
			children: pageOrder.map((original, display) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageView, {
				originalIndex: original,
				displayIndex: display,
				width: pageWidth,
				rotation: rotations[original] ?? 0,
				scale,
				tool
			}, `${original}-${rotations[original] ?? 0}-${zoomTick}`))
		})
	});
}
function scrollToPage(n) {
	document.querySelector(`[data-page="${n}"]`)?.scrollIntoView({
		behavior: "smooth",
		block: "start"
	});
}
function AppShell() {
	const theme = useAppStore((s) => s.theme);
	const lang = useAppStore((s) => s.lang);
	const bytes = useAppStore((s) => s.bytes);
	const loading = useAppStore((s) => s.loading);
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem("foliosyne-settings");
			if (!raw) return;
			const parsed = JSON.parse(raw);
			const s = useAppStore.getState();
			if (parsed.theme === "dark" || parsed.theme === "light") s.setTheme(parsed.theme);
			if (parsed.lang) s.setLang(parsed.lang);
			if (parsed.homePrinter && parsed.workPrinter) s.setPrinters(parsed.homePrinter, parsed.workPrinter);
			if (Array.isArray(parsed.signatures)) {
				for (const sig of parsed.signatures) if (!s.signatures.some((x) => x.id === sig.id)) s.addSignature(sig);
			}
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => {
		document.documentElement.dataset.theme = theme;
		document.documentElement.classList.toggle("dark", theme === "dark");
	}, [theme]);
	(0, import_react.useEffect)(() => {
		const meta = langMeta(lang);
		document.documentElement.lang = lang;
		document.documentElement.dir = meta.dir;
	}, [lang]);
	useHotkeys();
	(0, import_react.useEffect)(() => {
		const open = new URLSearchParams(window.location.search).get("open");
		if (open === "sample") {
			window.history.replaceState({}, "", window.location.pathname);
			openSampleDocument();
		} else if (open === "drive") {
			window.history.replaceState({}, "", window.location.pathname);
			useAppStore.getState().setPanel("share");
		}
	}, []);
	(0, import_react.useEffect)(() => {
		if (!loading) return;
		const id = window.setTimeout(() => {
			const s = useAppStore.getState();
			if (!s.loading) return;
			s.setLoading(false);
			s.setStatus("");
			toast.error("That took too long. Try the sample document or another file.");
		}, 25e3);
		return () => window.clearTimeout(id);
	}, [loading]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "paper-grain flex h-dvh min-h-0 flex-col bg-bg text-fg print-root",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {}),
			bytes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Studio, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppPanels, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				theme,
				position: "bottom-center",
				toastOptions: { className: "font-sans" }
			})
		]
	}) });
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
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			const meta = e.metaKey || e.ctrlKey;
			if (meta && e.key.toLowerCase() === "o") {
				e.preventDefault();
				document.getElementById("file-open")?.click();
			}
			if (meta && e.key.toLowerCase() === "s") {
				e.preventDefault();
				saveCurrent();
			}
			if (meta && e.key.toLowerCase() === "p") {
				e.preventDefault();
				printStudio();
			}
			if (meta && (e.key === "=" || e.key === "+")) {
				e.preventDefault();
				setScale(scale + .1);
			}
			if (meta && e.key === "-") {
				e.preventDefault();
				setScale(scale - .1);
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
			if (e.key === "Escape") setPanel(null);
			if ((e.key === "Delete" || e.key === "Backspace") && activeAnnotation) {
				const tag = e.target?.tagName;
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
		removeAnnotation
	]);
}
async function saveCurrent() {
	const s = useAppStore.getState();
	if (!s.bytes) return;
	s.setStatus("saving");
	try {
		downloadBlob(bytesToBlob(await bakePdf({
			bytes: s.bytes,
			pageOrder: s.pageOrder,
			rotations: s.rotations,
			annotations: s.annotations,
			userPassword: s.userPassword || void 0,
			openPassword: s.password || void 0
		}), "application/pdf"), s.name || "foliosyne.pdf");
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "no-print flex h-14 shrink-0 items-center gap-2 border-b border-border bg-surface/90 px-2 backdrop-blur md:px-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon-sm",
				className: "md:hidden",
				"aria-label": "Menu",
				onClick: () => setLeftOpen(!leftOpen),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolioMark, { className: "size-8 shrink-0" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-display text-base font-medium leading-tight tracking-tight",
					children: t("app.name")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "hidden truncate text-[11px] text-muted sm:block",
					children: name ? `${name}${dirty ? " · " + t("status.unsaved") : ""}` : t("app.tagline")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ms-auto flex items-center gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePicker, {
						id: "file-open",
						accept: ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
						onFile: (f) => void ingestFile(f),
						children: (pick) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
							label: t("action.open"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon-sm",
								type: "button",
								"aria-label": t("action.open"),
								onClick: pick,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, {})
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
						label: t("action.save"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon-sm",
							"aria-label": t("action.save"),
							disabled: !bytes,
							onClick: () => void saveCurrent(),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, {})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
						label: t("action.print"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon-sm",
							"aria-label": t("action.print"),
							disabled: !bytes,
							onClick: () => void printStudio(),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, {})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
						label: t("action.share"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon-sm",
							"aria-label": t("action.share"),
							disabled: !bytes,
							onClick: () => setPanel("share"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, {})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
						label: t("action.convert"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon-sm",
							"aria-label": t("action.convert"),
							onClick: () => setPanel("convert"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileOutput, {})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-1 hidden h-5 w-px bg-border sm:block" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "relative hidden sm:flex",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "pointer-events-none absolute start-2 top-1/2 size-3.5 -translate-y-1/2 text-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							"aria-label": t("lang.label"),
							className: "h-8 max-w-36 appearance-none rounded-sm border border-border bg-surface pe-6 ps-7 text-xs",
							value: lang,
							onChange: (e) => setLang(e.target.value),
							children: LANGS.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: l.code,
								children: l.label
							}, l.code))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
						label: theme === "light" ? t("theme.dark") : t("theme.light"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon-sm",
							"aria-label": theme === "light" ? t("theme.dark") : t("theme.light"),
							onClick: () => setTheme(theme === "light" ? "dark" : "light"),
							children: theme === "light" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, {})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
						label: t("help.title"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon-sm",
							"aria-label": t("help.title"),
							onClick: () => setPanel("help"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleHelp, {})
						})
					})
				]
			})
		]
	});
}
function Studio() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeftRail, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolStrip, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditBar, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "min-h-0 flex-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewer, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBar, {})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RightRail, {})
		]
	});
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
	const rotatePages = useAppStore((s) => s.rotatePages);
	const pageOrder = useAppStore((s) => s.pageOrder);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "no-print flex flex-wrap items-center gap-1 border-b border-border bg-surface px-2 py-1.5",
		children: [
			[
				{
					id: "select",
					icon: MousePointer2,
					key: "tool.select",
					help: "tool.help.select"
				},
				{
					id: "pan",
					icon: Hand,
					key: "tool.pan",
					help: "tool.help.pan"
				},
				{
					id: "edit",
					icon: Pencil,
					key: "tool.edit",
					help: "tool.help.edit"
				},
				{
					id: "highlight",
					icon: Highlighter,
					key: "tool.highlight",
					help: "tool.help.highlight"
				},
				{
					id: "comment",
					icon: MessageSquare,
					key: "tool.comment",
					help: "tool.help.comment"
				},
				{
					id: "redact",
					icon: Scan,
					key: "tool.redact",
					help: "tool.help.redact"
				},
				{
					id: "sign",
					icon: PenLine,
					key: "tool.sign",
					help: "tool.help.sign"
				}
			].map((item) => {
				const Icon = item.icon;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
					label: `${t(item.key)} — ${t(item.help)}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: tool === item.id ? "default" : "ghost",
						size: "icon-sm",
						"aria-label": t(item.key),
						"aria-pressed": tool === item.id,
						onClick: () => {
							if (item.id === "sign") setPanel("sign");
							setTool(item.id);
							if (item.id === "edit") {
								const st = useAppStore.getState();
								const orig = st.pageOrder[st.currentPage - 1] ?? 0;
								seedPageEdits(orig, st.rotations[orig] ?? 0);
							}
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {})
					})
				}, item.id);
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-1 h-5 w-px bg-border" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "px-1 text-xs tabular-nums text-muted",
				children: [Math.round(scale * 100), "%"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
				label: t("view.zoomOut"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon-sm",
					"aria-label": t("view.zoomOut"),
					onClick: () => setScale(scale - .1),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomOut, {})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
				label: t("view.zoomIn"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon-sm",
					"aria-label": t("view.zoomIn"),
					onClick: () => setScale(scale + .1),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomIn, {})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: () => setScale(1, "width"),
				children: t("view.fitWidth")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: () => setScale(1, "page"),
				children: t("view.fitPage")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-1 h-5 w-px bg-border" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
				label: t("view.pageUp"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon-sm",
					"aria-label": t("view.pageUp"),
					onClick: () => {
						const n = Math.max(1, currentPage - 1);
						setCurrentPage(n);
						scrollToPage(n);
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, {})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-24 px-1 text-center text-xs tabular-nums text-muted",
				children: t("view.pageOf", {
					n: currentPage,
					total: pageCount
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
				label: t("view.pageDown"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon-sm",
					"aria-label": t("view.pageDown"),
					onClick: () => {
						const n = Math.min(pageCount, currentPage + 1);
						setCurrentPage(n);
						scrollToPage(n);
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
				label: t("view.rotatePage"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon-sm",
					"aria-label": t("action.rotate"),
					onClick: () => {
						const orig = pageOrder[currentPage - 1];
						if (orig != null) rotatePages([orig], 90);
						else setPanel("rotate");
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCw, {})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ms-auto flex items-center gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
					label: t("action.translate"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon-sm",
						"aria-label": t("action.translate"),
						onClick: () => setPanel("translate"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Languages, {})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
					label: t("action.protect"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon-sm",
						"aria-label": t("action.protect"),
						onClick: () => setPanel("protect"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, {})
					})
				})]
			})
		]
	});
}
function EditBar() {
	const t = useT();
	const tool = useAppStore((s) => s.tool);
	const addAnnotation = useAppStore((s) => s.addAnnotation);
	const updateAnnotation = useAppStore((s) => s.updateAnnotation);
	const activeAnnotation = useAppStore((s) => s.activeAnnotation);
	const annotations = useAppStore((s) => s.annotations);
	const currentPage = useAppStore((s) => s.currentPage);
	const pageOrder = useAppStore((s) => s.pageOrder);
	const movePage = useAppStore((s) => s.movePage);
	const active = annotations.find((a) => a.id === activeAnnotation && a.type === "edit");
	if (tool !== "edit") return null;
	const patch = (p) => {
		if (!active) return;
		updateAnnotation(active.id, p);
	};
	const addText = () => {
		const orig = pageOrder[currentPage - 1] ?? 0;
		addAnnotation({
			type: "edit",
			pageIndex: orig,
			x: .12,
			y: .2,
			w: .4,
			h: .05,
			text: "",
			fontFamily: active?.fontFamily || "Times New Roman",
			fontSize: active?.fontSize || 12,
			color: active?.color || "#1C1917",
			source: "user"
		});
	};
	const btn = (on) => on ? "bg-accent text-accent-fg" : "text-fg hover:bg-paper";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "no-print flex flex-wrap items-center gap-1 border-b border-border bg-paper px-2 py-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "pe-2 text-[11px] font-medium uppercase tracking-wide text-subtle",
				children: t("tool.edit")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
				label: t("edit.addText"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: addText,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Type, {}), t("edit.addText")]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				className: "h-8 max-w-40 rounded-sm border border-border bg-surface px-2 text-xs",
				"aria-label": t("edit.font"),
				value: active?.fontFamily || "Times New Roman",
				onChange: (e) => patch({ fontFamily: e.target.value }),
				children: EDIT_FONTS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: f,
					children: f
				}, f))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "number",
				min: 8,
				max: 72,
				className: "h-8 w-14 rounded-sm border border-border bg-surface px-1 text-xs",
				"aria-label": t("edit.size"),
				value: Math.round(active?.fontSize || 12),
				onChange: (e) => patch({ fontSize: Number(e.target.value) || 12 })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
				label: t("edit.bold"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon-sm",
					className: btn(!!active?.bold),
					"aria-pressed": !!active?.bold,
					onClick: () => patch({ bold: !active?.bold }),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bold, {})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
				label: t("edit.italic"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon-sm",
					className: btn(!!active?.italic),
					"aria-pressed": !!active?.italic,
					onClick: () => patch({ italic: !active?.italic }),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Italic, {})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
				label: t("edit.underline"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon-sm",
					className: btn(!!active?.underline),
					"aria-pressed": !!active?.underline,
					onClick: () => patch({ underline: !active?.underline }),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Underline, {})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
				label: t("edit.strike"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon-sm",
					className: btn(!!active?.strike),
					"aria-pressed": !!active?.strike,
					onClick: () => patch({ strike: !active?.strike }),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Strikethrough, {})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
				label: t("edit.super"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon-sm",
					className: btn(!!active?.superScript),
					onClick: () => patch({
						superScript: !active?.superScript,
						subScript: false
					}),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Superscript, {})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
				label: t("edit.sub"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon-sm",
					className: btn(!!active?.subScript),
					onClick: () => patch({
						subScript: !active?.subScript,
						superScript: false
					}),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Subscript, {})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "color",
				className: "size-8 cursor-pointer rounded-sm border border-border bg-surface p-0.5",
				"aria-label": t("edit.color"),
				value: active?.color || "#1C1917",
				onChange: (e) => patch({ color: e.target.value })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
				label: t("edit.alignLeft"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon-sm",
					className: btn(active?.align === "left" || !active?.align),
					onClick: () => patch({ align: "left" }),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlignLeft, {})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
				label: t("edit.alignCenter"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon-sm",
					className: btn(active?.align === "center"),
					onClick: () => patch({ align: "center" }),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlignCenter, {})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
				label: t("edit.alignRight"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon-sm",
					className: btn(active?.align === "right"),
					onClick: () => patch({ align: "right" }),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlignRight, {})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
				label: t("edit.indent"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: () => patch({ indent: Math.min(48, (active?.indent || 0) + 12) }),
					children: t("edit.indent")
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-center gap-1 text-xs text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "h-8 rounded-sm border border-border bg-surface px-1 text-xs",
					"aria-label": t("edit.bullet"),
					value: active?.list || "none",
					onChange: (e) => patch({ list: e.target.value }),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "none",
							children: "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "disc",
							children: t("edit.bulletDisc")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "circle",
							children: t("edit.bulletCircle")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "square",
							children: t("edit.bulletSquare")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "dash",
							children: t("edit.bulletDash")
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ms-auto flex items-center gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
					label: t("view.moveUp"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => movePage(currentPage - 1, -1),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, {}), t("view.moveUp")]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
					label: t("view.moveDown"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => movePage(currentPage - 1, 1),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {}), t("view.moveDown")]
					})
				})]
			})
		]
	});
}
function LeftRail() {
	const t = useT();
	const pageOrder = useAppStore((s) => s.pageOrder);
	const currentPage = useAppStore((s) => s.currentPage);
	const setCurrentPage = useAppStore((s) => s.setCurrentPage);
	const leftOpen = useAppStore((s) => s.leftOpen);
	const setLeftOpen = useAppStore((s) => s.setLeftOpen);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [leftOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: "fixed inset-0 z-20 bg-ink/20 md:hidden",
		"aria-label": t("action.close"),
		onClick: () => setLeftOpen(false)
	}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: `no-print z-30 w-44 shrink-0 overflow-auto border-e border-border bg-surface p-3 ${leftOpen ? "fixed inset-y-14 start-0 md:static md:inset-auto" : "hidden md:block"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-[11px] font-medium uppercase tracking-wide text-subtle",
			children: t("sidebar.pages")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "mt-2 grid grid-cols-2 gap-2",
			children: pageOrder.map((original, display) => {
				const n = display + 1;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: `flex aspect-[3/4] w-full cursor-pointer items-center justify-center rounded-sm bg-paper text-sm tabular-nums shadow-[var(--shadow-border)] ${currentPage === n ? "ring-2 ring-accent" : "hover:bg-bg"}`,
					onClick: () => {
						setCurrentPage(n);
						scrollToPage(n);
						setLeftOpen(false);
					},
					children: n
				}) }, `${original}-${display}`);
			})
		})]
	})] });
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "no-print hidden w-64 shrink-0 flex-col overflow-auto border-s border-border bg-surface lg:flex",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex border-b border-border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: `flex-1 cursor-pointer px-3 py-2 text-xs font-medium ${rightTab === "bookmarks" ? "border-b-2 border-accent text-fg" : "text-muted"}`,
				onClick: () => setRightTab("bookmarks"),
				children: t("sidebar.bookmarks")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: `flex-1 cursor-pointer px-3 py-2 text-xs font-medium ${rightTab === "comments" ? "border-b-2 border-accent text-fg" : "text-muted"}`,
				onClick: () => setRightTab("comments"),
				children: t("sidebar.comments")
			})]
		}), rightTab === "bookmarks" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-2 p-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "secondary",
					className: "flex-1",
					onClick: async () => {
						try {
							const auto = await detectHeadings(pageCount, pageOrder);
							if (auto.length) setBookmarks(auto);
							else toast.message(t("sidebar.noBookmarks"));
						} catch {
							toast.error(t("sidebar.noBookmarks"));
						}
					},
					children: t("sidebar.autoHeadings")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
					label: t("sidebar.addBookmark"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "icon-sm",
						variant: "outline",
						"aria-label": t("sidebar.addBookmark"),
						onClick: () => {
							const pageIndex = pageOrder[currentPage - 1] ?? 0;
							addBookmark({
								title: `${t("sidebar.bookmarkName")} ${currentPage}`,
								pageIndex
							});
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookmarkPlus, {})
					})
				})]
			}), bookmarks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: t("sidebar.noBookmarks")
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-1",
				children: bookmarks.map((b) => {
					const n = Math.max(1, pageOrder.indexOf(b.pageIndex) + 1);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-w-0 flex-1 cursor-pointer truncate rounded-sm px-2 py-1.5 text-start text-sm hover:bg-paper",
							onClick: () => {
								setCurrentPage(n);
								scrollToPage(n);
							},
							children: b.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "cursor-pointer px-1 text-xs text-subtle hover:text-danger",
							onClick: () => removeBookmark(b.id),
							"aria-label": t("action.delete"),
							children: "×"
						})]
					}, b.id);
				})
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col gap-2 p-3",
			children: comments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: t("sidebar.noComments")
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: comments.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					"data-annot-id": c.id,
					className: "w-full resize-y rounded-sm border border-border bg-paper p-2 text-sm",
					rows: 3,
					placeholder: t("comment.placeholder"),
					value: c.text ?? "",
					onFocus: () => {
						setActiveAnnotation(c.id);
						const n = Math.max(1, pageOrder.indexOf(c.pageIndex) + 1);
						setCurrentPage(n);
						scrollToPage(n);
					},
					onChange: (e) => updateAnnotation(c.id, { text: e.target.value })
				}) }, c.id))
			})
		})]
	});
}
function StatusBar() {
	const t = useT();
	const loading = useAppStore((s) => s.loading);
	const status = useAppStore((s) => s.status);
	const pageCount = useAppStore((s) => s.pageCount);
	const userPassword = useAppStore((s) => s.userPassword);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "no-print flex h-8 items-center gap-3 border-t border-border bg-surface px-3 text-[11px] text-muted",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: loading ? t("status.loading") : status || t("status.ready") }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "tabular-nums",
				children: t("status.pages", { n: pageCount })
			}),
			userPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-warn",
				children: t("protect.locked")
			}) : null
		]
	});
}
function EmptyState() {
	const t = useT();
	const loading = useAppStore((s) => s.loading);
	const status = useAppStore((s) => s.status);
	const [recent, setRecent] = (0, import_react.useState)([]);
	const [over, setOver] = (0, import_react.useState)(false);
	const drag = (0, import_react.useRef)(0);
	const fileRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		listRecentMeta().then(setRecent).catch(() => setRecent([]));
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-0 flex-1 flex-col items-center overflow-auto px-4 py-10",
		onDragEnter: (e) => {
			e.preventDefault();
			drag.current += 1;
			setOver(true);
		},
		onDragOver: (e) => e.preventDefault(),
		onDragLeave: () => {
			drag.current -= 1;
			if (drag.current <= 0) setOver(false);
		},
		onDrop: (e) => {
			e.preventDefault();
			drag.current = 0;
			setOver(false);
			const f = e.dataTransfer.files[0];
			if (f) ingestFile(f);
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			ref: fileRef,
			id: "empty-file-open",
			type: "file",
			accept: ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			className: "file-ghost",
			tabIndex: -1,
			"aria-hidden": "true",
			suppressHydrationWarning: true,
			onChange: (e) => {
				const f = e.target.files?.[0];
				if (f) ingestFile(f);
				e.currentTarget.value = "";
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-3xl font-medium tracking-tight md:text-4xl",
					children: t("empty.title")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-prose text-muted",
					children: t("empty.body")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `mt-8 rounded-xl bg-surface p-6 shadow-[var(--shadow-border)] ${over ? "ring-2 ring-accent" : ""}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: t("file.dropTitle")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: t("file.dropHint")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex flex-wrap gap-2",
							id: "empty-actions",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									"aria-label": t("file.browse"),
									onClick: (e) => {
										e.preventDefault();
										e.stopPropagation();
										pickFile();
									},
									children: t("file.browse")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "secondary",
									"aria-label": t("file.sample"),
									disabled: loading,
									onClick: (e) => {
										e.preventDefault();
										e.stopPropagation();
										openSampleDocument();
									},
									children: loading ? t("status.loading") : t("file.sample")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									"aria-label": t("file.openDrive"),
									onClick: (e) => {
										e.preventDefault();
										e.stopPropagation();
										useAppStore.getState().setPanel("share");
									},
									children: t("file.openDrive")
								})
							]
						}),
						loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm text-muted",
							role: "status",
							children: status || t("status.loading")
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xs font-medium uppercase tracking-wide text-subtle",
						children: t("file.recent")
					}), recent.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: t("file.noRecent")
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 divide-y divide-border rounded-lg bg-surface",
						children: recent.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "flex w-full cursor-pointer items-center justify-between px-4 py-3 text-start text-sm hover:bg-paper",
							onClick: () => {
								(async () => {
									const row = await getFile(r.id);
									if (!row) return;
									await ingestPdf(new Uint8Array(row.bytes), row.name);
								})();
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: r.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-subtle",
								children: formatBytes(r.size)
							})]
						}) }, r.id))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-10 text-xs text-subtle",
					children: t("app.subtitle")
				})
			]
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {});
}
//#endregion
export { Home as component, redirectToLoginIfRequired as n, isLoginRequired as t };

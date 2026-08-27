import { toast } from "sonner";
import { parseDocx, blocksToPdf } from "@/lib/convert";
import { putFile } from "@/lib/idb";
import { detectHeadings, openPdfBytes, outlineBookmarks } from "@/lib/pdf/engine";
import { buildBlankPdf } from "@/lib/pdf/blank";
import { DEFAULT_PAGE_SIZE } from "@/lib/page-format";
import { buildSamplePdf } from "@/lib/pdf/sample";
import { useAppStore } from "@/lib/store";
import { uid } from "@/lib/utils";

export async function ingestPdf(
  bytes: Uint8Array,
  name: string,
  password?: string,
) {
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
      pageCount: result.pageCount,
    });
    store.setOpenPassword(password || "");
    try {
      const outlined = await outlineBookmarks();
      if (outlined.length) store.setBookmarks(outlined);
      else {
        const auto = await detectHeadings(
          result.pageCount,
          Array.from({ length: result.pageCount }, (_, i) => i),
        );
        store.setBookmarks(auto);
      }
    } catch {
      /* bookmarks optional */
    }
    try {
      await putFile({
        id: uid("file"),
        name,
        kind: "pdf",
        bytes: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
        savedAt: Date.now(),
      });
    } catch {
      /* ignore quota */
    }
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "Could not open that file.");
  } finally {
    const s = useAppStore.getState();
    s.setLoading(false);
    s.setStatus("");
  }
}

export async function ingestDocx(buffer: ArrayBuffer, name: string) {
  const store = useAppStore.getState();
  store.setLoading(true);
  try {
    const blocks = await parseDocx(buffer);
    const pdfBytes = await blocksToPdf(blocks, name);
    await ingestPdf(pdfBytes, name.replace(/\.docx?$/i, "") + ".pdf");
  } catch (err) {
    store.setLoading(false);
    store.setStatus("");
    toast.error(err instanceof Error ? err.message : "Not a Word document");
  }
}

export async function ingestFile(file: File) {
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

export async function openBlankDocument() {
  const store = useAppStore.getState();
  store.setLoading(true);
  store.setStatus("Creating page…");
  try {
    const size = DEFAULT_PAGE_SIZE;
    const blank = await buildBlankPdf("#FFFFFF", 1, size.width, size.height);
    await ingestPdf(blank, "Untitled.pdf");
    const s = useAppStore.getState();
    s.setBlank(true);
    s.setPageBackground(0, "#FFFFFF");
    s.setPageSize({ ...size });
    s.setTool("edit");
  } catch (err) {
    store.setLoading(false);
    store.setStatus("");
    toast.error(err instanceof Error ? err.message : "Could not create a blank PDF.");
  }
}

export async function rebuildBlankAtSize(width: number, height: number) {
  const s = useAppStore.getState();
  if (!s.isBlank) return;
  const color = s.pageBackgrounds[s.pageOrder[0] ?? 0] || "#FFFFFF";
  const blank = await buildBlankPdf(color, s.pageCount, width, height);
  const result = await openPdfBytes(blank);
  if (!result.ok) return;
  s.replaceBytes(blank);
}

export async function openSampleDocument() {
  const store = useAppStore.getState();
  store.setLoading(true);
  store.setStatus("Opening sample…");
  try {
    const sample = await buildSamplePdf();
    await ingestPdf(sample, "Foliosyne studio guide.pdf");
  } catch (err) {
    store.setLoading(false);
    store.setStatus("");
    toast.error(err instanceof Error ? err.message : "Could not open the sample document.");
  }
}

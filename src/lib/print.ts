import { bakePdf } from "@/lib/pdf/mutate";
import { useAppStore } from "./store";

function bytesToBlobUrl(bytes: Uint8Array): string {
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
export async function printStudio() {
  const s = useAppStore.getState();
  s.setPanel(null);
  if (!s.bytes || s.pageOrder.length < 1) {
    window.print();
    return;
  }

  s.setStatus("Preparing print…");
  removeFrame();

  try {
    const baked = await bakePdf({
      bytes: s.bytes,
      pageOrder: s.pageOrder,
      rotations: s.rotations,
      annotations: s.annotations,
      openPassword: s.password || undefined,
    });
    const url = bytesToBlobUrl(baked);

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
      "background:#fff",
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
      } catch {
        /* PDF plugin may block */
      }
      window.setTimeout(trigger, 350);
    });
    window.setTimeout(trigger, 1600);
    window.addEventListener("afterprint", cleanup, { once: true });
    window.setTimeout(cleanup, 180000);
  } catch (err) {
    useAppStore.getState().setStatus("");
    throw err;
  }
}

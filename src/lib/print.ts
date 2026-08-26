import { rasterizePage } from "@/lib/pdf/engine";
import { useAppStore } from "./store";

function ensurePrintHost(): HTMLDivElement {
  let host = document.getElementById("folio-print") as HTMLDivElement | null;
  if (host) host.replaceChildren();
  else {
    host = document.createElement("div");
    host.id = "folio-print";
    host.setAttribute("aria-hidden", "true");
    document.body.appendChild(host);
  }
  return host;
}

function waitForImages(root: HTMLElement): Promise<void> {
  const imgs = [...root.querySelectorAll("img")];
  return Promise.all(
    imgs.map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }),
    ),
  ).then(() => undefined);
}

export async function printStudio() {
  const s = useAppStore.getState();
  s.setPanel(null);
  if (!s.bytes || s.pageOrder.length < 1) {
    window.print();
    return;
  }

  s.setStatus("Preparing print…");
  const host = ensurePrintHost();
  document.body.classList.add("folio-printing");

  try {
    for (const original of s.pageOrder) {
      const redactions = s.annotations
        .filter((a) => a.type === "redact" && a.pageIndex === original)
        .map((a) => ({ x: a.x, y: a.y, w: a.w, h: a.h }));
      const raster = await rasterizePage({
        pageNumber: original + 1,
        extraRotation: s.rotations[original] ?? 0,
        redactions,
        scale: 2,
        mime: "image/jpeg",
        quality: 0.92,
      });
      const img = document.createElement("img");
      img.className = "folio-print-page";
      img.alt = `Page ${host.childElementCount + 1}`;
      img.width = raster.widthPx;
      img.height = raster.heightPx;
      img.style.width = `${raster.widthPt / 72}in`;
      img.style.height = `${raster.heightPt / 72}in`;
      const copy = new Uint8Array(raster.bytes);
      const blob = new Blob([copy], { type: "image/jpeg" });
      img.src = URL.createObjectURL(blob);
      host.appendChild(img);
    }

    await waitForImages(host);
    await new Promise<void>((r) => requestAnimationFrame(() => r()));

    const cleanup = () => {
      document.body.classList.remove("folio-printing");
      for (const img of host.querySelectorAll("img")) {
        if (img.src.startsWith("blob:")) URL.revokeObjectURL(img.src);
      }
      host.replaceChildren();
      s.setStatus("");
    };

    window.addEventListener("afterprint", cleanup, { once: true });
    window.setTimeout(cleanup, 120000);
    window.print();
  } catch (err) {
    document.body.classList.remove("folio-printing");
    s.setStatus("");
    throw err;
  }
}

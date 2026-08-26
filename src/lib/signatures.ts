export async function renderTypedSignature(
  text: string,
  kind: "full" | "initials",
): Promise<string> {
  const family = "Great Vibes";
  const size = kind === "initials" ? 128 : 96;
  try {
    await document.fonts.load(`${size}px "${family}"`);
  } catch {
    /* continue with fallback */
  }
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

export function knockOutWhite(source: HTMLImageElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = source.naturalWidth || source.width;
  canvas.height = source.naturalHeight || source.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return source.src;
  ctx.drawImage(source, 0, 0);
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i]!;
    const g = d[i + 1]!;
    const b = d[i + 2]!;
    if (r > 232 && g > 232 && b > 232) d[i + 3] = 0;
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL("image/png");
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image"));
    img.src = src;
  });
}

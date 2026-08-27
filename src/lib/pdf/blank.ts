import { PDFDocument, rgb } from "@cantoo/pdf-lib";
import { hexToRgb } from "@/lib/color";

export async function buildBlankPdf(
  color = "#FFFFFF",
  pages = 1,
  width = 612,
  height = 792,
) {
  const doc = await PDFDocument.create();
  const { r, g, b } = hexToRgb(color);
  const fill = rgb(r / 255, g / 255, b / 255);
  const w = Math.max(72, width);
  const h = Math.max(72, height);
  const count = Math.max(1, Math.min(20, pages));
  for (let i = 0; i < count; i++) {
    const page = doc.addPage([w, h]);
    page.drawRectangle({
      x: 0,
      y: 0,
      width: w,
      height: h,
      color: fill,
    });
  }
  return doc.save();
}

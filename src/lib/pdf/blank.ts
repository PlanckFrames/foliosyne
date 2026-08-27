import { PDFDocument, rgb } from "@cantoo/pdf-lib";
import { hexToRgb } from "@/lib/color";

export async function buildBlankPdf(color = "#F4EEE6", pages = 1) {
  const doc = await PDFDocument.create();
  const { r, g, b } = hexToRgb(color);
  const fill = rgb(r / 255, g / 255, b / 255);
  const count = Math.max(1, Math.min(20, pages));
  for (let i = 0; i < count; i++) {
    const page = doc.addPage([612, 792]);
    page.drawRectangle({
      x: 0,
      y: 0,
      width: 612,
      height: 792,
      color: fill,
    });
  }
  return doc.save();
}

import { PDFDocument, StandardFonts, rgb, degrees } from "@cantoo/pdf-lib";

const ink = rgb(0.11, 0.1, 0.09);
const muted = rgb(0.42, 0.39, 0.36);
const teal = rgb(0.184, 0.365, 0.337);
const paper = rgb(0.957, 0.937, 0.902);
const rule = rgb(0.82, 0.78, 0.72);

function wrap(
  font: { widthOfTextAtSize: (t: string, s: number) => number },
  text: string,
  size: number,
  max: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(next, size) > max && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

export async function buildSamplePdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const serif = await doc.embedFont(StandardFonts.TimesRoman);
  const serifBold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const sans = await doc.embedFont(StandardFonts.Helvetica);
  const sansBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const W = 612;
  const H = 792;

  const footer = (page: ReturnType<PDFDocument["addPage"]>, n: number, total: number) => {
    page.drawLine({
      start: { x: 64, y: 48 },
      end: { x: W - 64, y: 48 },
      thickness: 0.4,
      color: rule,
    });
    page.drawText("Foliosyne  ·  Studio guide", {
      x: 64,
      y: 32,
      size: 9,
      font: sans,
      color: muted,
    });
    page.drawText(`${n} / ${total}`, {
      x: W - 64 - sans.widthOfTextAtSize(`${n} / ${total}`, 9),
      y: 32,
      size: 9,
      font: sans,
      color: muted,
    });
  };

  const heading = (
    page: ReturnType<PDFDocument["addPage"]>,
    title: string,
    y: number,
  ) => {
    page.drawText(title, {
      x: 64,
      y,
      size: 22,
      font: serifBold,
      color: ink,
    });
    page.drawRectangle({
      x: 64,
      y: y - 10,
      width: 36,
      height: 2,
      color: teal,
    });
  };

  const body = (
    page: ReturnType<PDFDocument["addPage"]>,
    text: string,
    yStart: number,
    size = 11.5,
  ) => {
    let y = yStart;
    for (const para of text.split("\n\n")) {
      for (const line of wrap(serif, para, size, W - 128)) {
        page.drawText(line, { x: 64, y, size, font: serif, color: ink });
        y -= size + 5;
      }
      y -= 8;
    }
    return y;
  };

  // Cover
  {
    const p = doc.addPage([W, H]);
    p.drawRectangle({ x: 0, y: 0, width: W, height: H, color: paper });
    p.drawRectangle({ x: 0, y: H - 18, width: W, height: 18, color: teal });
    p.drawRectangle({ x: 0, y: 0, width: W, height: 18, color: teal });
    p.drawText("FOLIOSYNE", {
      x: 64,
      y: 520,
      size: 42,
      font: serifBold,
      color: ink,
    });
    p.drawText("Documents, composed.", {
      x: 64,
      y: 478,
      size: 18,
      font: serif,
      color: teal,
    });
    p.drawText("A sample eight-page document for the in-browser studio.", {
      x: 64,
      y: 430,
      size: 12,
      font: sans,
      color: muted,
    });
    const notes = [
      "Read and search long PDFs without leaving the page.",
      "Edit, comment, redact, and sign — then save a real PDF.",
      "Convert to Word or Google Docs, and back again.",
      "Protect with a password. Translate a selection, a page, or the file.",
    ];
    let y = 360;
    for (const n of notes) {
      p.drawRectangle({ x: 64, y: y + 2, width: 7, height: 7, color: teal });
      p.drawText(n, { x: 82, y, size: 11, font: serif, color: ink });
      y -= 28;
    }
    p.drawText("Open  ·  Annotate  ·  Convert  ·  Share", {
      x: 64,
      y: 96,
      size: 10,
      font: sans,
      color: muted,
    });
  }

  const pages: { title: string; text: string }[] = [
    {
      title: "Reading & navigation",
      text: "Foliosyne renders pages on demand, so a long report does not stall the studio. Use the zoom controls, fit-width, and fit-page. Page Up and Page Down walk the document; the page stack in the rail jumps to a leaf immediately.\n\nMove a page up or down in the stack when the order is wrong. Rotate a single page, a typed range such as 2-5, 9, or the whole file — ninety degrees at a time, or one hundred eighty.\n\nWhen the pointer rests on words, it becomes a text-selection cursor. Drag to copy. Nothing extra to switch on.",
    },
    {
      title: "Editing, comments, signatures",
      text: "Add text boxes where the original layout needs a correction. Highlight a passage. Drop a comment pin and write the note — every comment also lives in the side rail.\n\nSignatures come three ways: typed full name, typed initials, or a photograph of a real signature in JPG, PNG, or WebP. White paper behind a photo is knocked out so the ink sits on the page. Save a signature once, stamp it on any page.\n\nMarks stay on the document until you save. Saving bakes them into a new PDF you can download, print, or share.",
    },
    {
      title: "Protect, redact, convert",
      text: "Set an open password. Foliosyne encrypts the file with AES-256 when you save, so the next reader must know the phrase.\n\nRedaction is a drag rectangle. On export the cover is opaque, and redacted runs are omitted from Word, Google Docs, and translation so the hidden words do not leak through a conversion.\n\nConvert a PDF to Word for further drafting, or to Google Docs via a .docx plus formatted HTML you can paste. Word files and Google Docs exports (.docx) convert the other way — into a clean PDF you can sign and protect.",
    },
    {
      title: "Translate & cloud",
      text: "Choose a target language, then convert the current selection, this page, or the whole document. Place the translation as a text box, or copy it.\n\nThe interface itself has a language menu in the top bar: every label, tooltip, and help dialogue follows that choice, including right-to-left Arabic.\n\nShare downloads the file, uses the system share sheet when the browser allows it, or sends you toward Drive, Dropbox, Box, OneDrive, and iCloud. Printers discovered on this Wi-Fi appear in the system print dialog — save Home and Work labels so the destination is obvious.",
    },
    {
      title: "Bookmarks & large files",
      text: "Detect section headings automatically, or pin a custom placeholder on the page you are looking at. Click a bookmark to travel. Outlines already inside a PDF are imported when the file opens.\n\nThumbnails on the left keep place in a long deck. Only pages near the viewport are painted, so a hundred-leaf contract stays responsive.\n\nLight is the default paper. Dark mode inverts the chrome, not the page ink, so proofs stay readable at night.",
    },
    {
      title: "Keyboard shortcuts",
      text: "Ctrl or Cmd with O opens a file. S saves a PDF. P prints. Plus and minus zoom; 0 fits the width. Page Up and Page Down turn leaves. Escape closes a panel or cancels a drawing tool. Delete removes the selected mark.\n\nHover any tool for a short explanation. The Help panel repeats this map in the language you chose.\n\nThis sample is itself a PDF generated in the studio — save it, sign it, redact a line, translate a paragraph, and convert it to Word to confirm the round trip.",
    },
    {
      title: "Colophon",
      text: "Foliosyne is an editorial name: folio, a leaf of paper; syne, together. It is not Adobe, not Acrobat, and not a cloud locker pretending to be a reader.\n\nWork stays in this browser until you export. There is no account wall on the studio floor. Drive import uses the Drive already connected to the Grok session when that grant exists.\n\nPrint through the operating system so home and office printers on Wi-Fi — AirPrint, IPP, shared queues — are the ones you already trust.\n\nSet a language. Set a mode. Open something that matters.",
    },
  ];

  pages.forEach((block, i) => {
    const p = doc.addPage([W, H]);
    p.drawRectangle({ x: 0, y: 0, width: W, height: H, color: paper });
    p.drawRectangle({ x: 0, y: H - 8, width: W, height: 8, color: teal });
    heading(p, block.title, H - 88);
    body(p, block.text, H - 130);
    footer(p, i + 2, 8);
  });

  // A little flourish on the last page
  const last = doc.getPage(doc.getPageCount() - 1);
  last.drawText("Foliosyne", {
    x: 64,
    y: 120,
    size: 14,
    font: serifBold,
    color: teal,
  });
  last.setRotation(degrees(0));

  const bytes = await doc.save();
  return bytes;
}

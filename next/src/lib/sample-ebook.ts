import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "node:fs/promises";
import path from "node:path";

export async function ensureSampleEbook(filePath: string, title: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  try {
    await fs.access(filePath);
    return;
  } catch {
    /* create */
  }

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  page.drawText("SPEAKO EBOOK", {
    x: 50,
    y: 760,
    size: 22,
    font,
    color: rgb(0.02, 0.59, 0.41),
  });
  page.drawText(title, {
    x: 50,
    y: 720,
    size: 16,
    font,
    color: rgb(0.1, 0.1, 0.12),
  });
  page.drawText("This sample PDF is only available after purchase.", {
    x: 50,
    y: 690,
    size: 11,
    font,
    color: rgb(0.3, 0.3, 0.32),
  });
  const bytes = await pdf.save();
  await fs.writeFile(filePath, bytes);
}

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Purchase, Course, User, ProductOption } from "@prisma/client";

type Row = Purchase & { course: Course; user: User };

function asciiKrw(amount: number) {
  return `KRW ${amount.toLocaleString("en-US")}`;
}

function asciiDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date(date));
}

function optionEn(option: ProductOption) {
  if (option === "VOD") return "VOD";
  if (option === "EBOOK") return "Ebook";
  return "Package";
}

export async function buildPaymentStatement(input: {
  tutorName: string;
  tutorEmail: string;
  rows: Row[];
}) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const entity = process.env.PLATFORM_ENTITY_NAME ?? "Speako Learning Pte. Ltd.";
  const address = process.env.PLATFORM_ENTITY_ADDRESS ?? "Singapore";

  let y = 800;
  const draw = (text: string, x: number, size = 11, isBold = false) => {
    page.drawText(text, {
      x,
      y,
      size,
      font: isBold ? bold : font,
      color: rgb(0.07, 0.09, 0.15),
    });
  };

  draw("PAYMENT STATEMENT / INVOICE", 50, 18, true);
  y -= 22;
  draw("For tax documentation (overseas entity)", 50, 10);
  y -= 28;
  draw(entity, 50, 12, true);
  y -= 16;
  draw(address, 50, 10);
  y -= 16;
  draw(`Issued: ${asciiDate(new Date())}`, 50, 10);
  y -= 28;
  draw(`Payee (Tutor): ${input.tutorName}`, 50, 11, true);
  y -= 16;
  draw(`Email: ${input.tutorEmail}`, 50, 10);
  y -= 28;

  const gross = input.rows.reduce((s, r) => s + r.amountGross, 0);
  const fees = input.rows.reduce((s, r) => s + r.stripeFee + r.platformFee, 0);
  const net = input.rows.reduce((s, r) => s + r.netPayout, 0);

  draw(`Gross sales: ${asciiKrw(gross)}`, 50, 11);
  y -= 14;
  draw(`Platform + PG fees (3.3%): ${asciiKrw(fees)}`, 50, 11);
  y -= 14;
  draw(`Net payout: ${asciiKrw(net)}`, 50, 12, true);
  y -= 28;
  draw("Order details", 50, 12, true);
  y -= 18;

  for (const row of input.rows.slice(0, 18)) {
    const line = `${asciiDate(row.createdAt)}  ${row.course.slug} [${optionEn(row.option)}]  ${asciiKrw(row.amountGross)}  net ${asciiKrw(row.netPayout)}  ${row.status}`;
    page.drawText(line.slice(0, 110), {
      x: 50,
      y,
      size: 8,
      font,
      color: rgb(0.2, 0.22, 0.28),
    });
    y -= 12;
    if (y < 60) break;
  }

  y = 40;
  page.drawText("This statement is issued for the tutor's tax records. It is not a VAT invoice.", {
    x: 50,
    y,
    size: 8,
    font,
    color: rgb(0.4, 0.42, 0.48),
  });

  return pdf.save();
}

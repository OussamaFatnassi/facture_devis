import { NextRequest } from "next/server";
import { PrismaQuotationRepository } from "@/src/app/quotation/infrastructure/repositories/quotation-repository";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  const repo = new PrismaQuotationRepository();
  const quotation = await repo.findById(id);

  if (!quotation) {
    return new Response("Quotation not found", { status: 404 });
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 portrait
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  let y = 780;

  const drawText = (
    text: string,
    size = 12,
    x = margin,
    color = rgb(0, 0, 0),
    fontType = font
  ) => {
    page.drawText(text, { x, y, size, font: fontType, color });
    y -= size + 6;
  };

  // Logo
  const logoPath = path.resolve("public", "company.png");
  if (fs.existsSync(logoPath)) {
    const logoBytes = fs.readFileSync(logoPath);
    const logoImage = await pdfDoc.embedPng(logoBytes);
    page.drawImage(logoImage, { x: 500, y: 770, width: 50, height: 50 });
  }

  // Header
  drawText("DEVIS", 26, margin, rgb(0.2, 0.2, 0.6), boldFont);
  y -= 10;
  drawText(`ID: ${quotation.id}`, 10);
  drawText(`Date: ${quotation.date.toLocaleDateString()}`, 10);
  y -= 10;

  drawText("Informations du client:", 14, margin, rgb(0.1, 0.1, 0.4), boldFont);
  drawText(`${quotation.client.firstname} ${quotation.client.lastname}`);
  drawText(quotation.client.activityName);
  drawText(quotation.client.email);
  drawText(quotation.client.phone);
  drawText(quotation.client.address);
  drawText(quotation.client.legalStatus);

  y -= 20;

  // Table Header
  const tableStartY = y;
  const colX = {
    desc: margin + 2,
    qty: margin + 280,
    pu: margin + 340,
    total: margin + 420,
  };

  page.drawRectangle({
    x: margin,
    y: y - 4,
    width: 495,
    height: 22,
    color: rgb(0.85, 0.9, 1),
  });
  page.drawText("Description", { x: colX.desc, y, size: 12, font: boldFont });
  page.drawText("Quantité", { x: colX.qty, y, size: 12, font: boldFont });
  page.drawText("PU", { x: colX.pu, y, size: 12, font: boldFont });
  page.drawText("Total", { x: colX.total, y, size: 12, font: boldFont });

  y -= 24;

  // Table Rows
  quotation.lines.forEach((line, index) => {
    const rowBg = index % 2 === 0 ? rgb(1, 1, 1) : rgb(0.97, 0.97, 0.97);
    page.drawRectangle({
      x: margin,
      y: y - 2,
      width: 495,
      height: 16,
      color: rowBg,
    });

    page.drawText(line.description, { x: colX.desc, y, size: 10, font });
    page.drawText(String(line.quantity), { x: colX.qty, y, size: 10, font });
    page.drawText(`${line.unitPrice.toFixed(2)} €`, {
      x: colX.pu,
      y,
      size: 10,
      font,
    });
    page.drawText(`${line.totalPrice.toFixed(2)} €`, {
      x: colX.total,
      y,
      size: 10,
      font,
    });
    y -= 18;
  });

  y -= 20;
  drawText(
    `Total HT: ${quotation.totalWithoutTaxes.toFixed(2)} €`,
    12,
    colX.total,
    rgb(0, 0, 0),
    boldFont
  );
  drawText(
    `TVA (${quotation.taxRate}%): ${(
      (quotation.totalWithoutTaxes * quotation.taxRate) /
      100
    ).toFixed(2)} €`,
    12,
    colX.total,
    rgb(0, 0, 0),
    boldFont
  );
  drawText(
    `Total TTC: ${quotation.totalWithTaxes.toFixed(2)} €`,
    12,
    colX.total,
    rgb(0.2, 0.2, 0.6),
    boldFont
  );

  // Footer
  page.drawLine({
    start: { x: margin, y: 60 },
    end: { x: 545, y: 60 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  page.drawText("Company ltd.", {
    x: margin,
    y: 40,
    size: 10,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  const pdfBytes = await pdfDoc.save();

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=quotation-${quotation.id}.pdf`,
    },
  });
}

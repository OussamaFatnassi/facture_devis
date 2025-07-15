import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Invoice } from '../../domain/Invoice';
import fs from "fs";
import path from "path";

export class InvoicePdfService {
  async generateInvoicePdf(invoice: Invoice): Promise<Buffer> {
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

    // Header - INVOICE instead of QUOTE
    drawText("INVOICE", 26, margin, rgb(0.2, 0.2, 0.6), boldFont);
    y -= 10;
    drawText(`N° ${invoice.invoiceNumber}`, 12, margin, rgb(0, 0, 0), boldFont);
    drawText(`Date: ${invoice.date.toLocaleDateString()}`, 10);
    drawText(`Due Date: ${invoice.dueDate.toLocaleDateString()}`, 10);
    drawText(`Status: ${invoice.status.toUpperCase()}`, 10, margin, this.getStatusColor(invoice.status));
    if (invoice.paidDate) {
      drawText(`Paid on: ${invoice.paidDate.toLocaleDateString()}`, 10, margin, rgb(0, 0.7, 0));
    }
    y -= 10;

    // Client information
    drawText("Client Information:", 14, margin, rgb(0.1, 0.1, 0.4), boldFont);
    drawText(`${invoice.client.firstname} ${invoice.client.lastname}`);
    drawText(invoice.client.activityName);
    drawText(invoice.client.email);
    drawText(invoice.client.phone);
    drawText(invoice.client.address);
    drawText(invoice.client.legalStatus);

    y -= 20;

    // Quote reference
    drawText("Reference:", 14, margin, rgb(0.1, 0.1, 0.4), boldFont);
    drawText(`Quote N°: ${invoice.quotationId}`);
    drawText(`Quote Date: ${invoice.quotation.date.toLocaleDateString()}`);

    y -= 20;

    // Table Header
    const colX = {
      desc: margin + 2,
      qty: margin + 280,
      pu: margin + 340,
      total: margin + 420,
    };

    // Table header
    page.drawRectangle({
      x: margin,
      y: y - 4,
      width: 495,
      height: 22,
      color: rgb(0.85, 0.9, 1),
    });
    page.drawText("Description", { x: colX.desc, y, size: 12, font: boldFont });
    page.drawText("Quantity", { x: colX.qty, y, size: 12, font: boldFont });
    page.drawText("Unit Price", { x: colX.pu, y, size: 12, font: boldFont });
    page.drawText("Total", { x: colX.total, y, size: 12, font: boldFont });

    y -= 24;

    // Table rows
    invoice.lines.forEach((line, index) => {
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

    // Totals
    drawText(
      `Total excl. VAT: ${invoice.totalExcludingTax.toFixed(2)} €`,
      12,
      colX.total,
      rgb(0, 0, 0),
      boldFont
    );
    drawText(
      `VAT (${invoice.taxRate}%): ${invoice.taxAmount.toFixed(2)} €`,
      12,
      colX.total,
      rgb(0, 0, 0),
      boldFont
    );
    drawText(
      `Total incl. VAT: ${invoice.totalIncludingTax.toFixed(2)} €`,
      12,
      colX.total,
      rgb(0.2, 0.2, 0.6),
      boldFont
    );

    // Payment terms
    y -= 30;
    drawText("Payment Terms:", 12, margin, rgb(0.1, 0.1, 0.4), boldFont);
    drawText(`Due Date: ${invoice.dueDate.toLocaleDateString()}`);
    
    if (invoice.isOverdue && !invoice.isPaid) {
      drawText("⚠️ OVERDUE INVOICE", 12, margin, rgb(1, 0, 0), boldFont);
    }

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
    return Buffer.from(pdfBytes);
  }

  private getStatusColor(status: string) {
    switch (status) {
      case 'draft':
        return rgb(0.6, 0.6, 0.6);
      case 'sent':
        return rgb(0, 0.4, 0.8);
      case 'paid':
        return rgb(0, 0.7, 0);
      case 'overdue':
        return rgb(1, 0, 0);
      case 'cancelled':
        return rgb(0.5, 0.5, 0.5);
      default:
        return rgb(0, 0, 0);
    }
  }
}

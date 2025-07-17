import { NextRequest } from "next/server";
import { PrismaInvoiceRepository } from "@/src/app/invoice/infrastructure/repositories/invoice-repository";
import { InvoicePdfService } from "@/src/app/invoice/infrastructure/services/pdf-service";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    // Initialize services
    const invoiceRepository = new PrismaInvoiceRepository();
    const pdfService = new InvoicePdfService();

    // Get invoice
    const invoice = await invoiceRepository.findById(id);
    if (!invoice) {
      return new Response("Invoice not found", { status: 404 });
    }

    // Generate PDF
    const pdfBuffer = await pdfService.generateInvoicePdf(invoice);

    // Return PDF response
    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`,
      },
    });
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
} 
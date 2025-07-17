import { SearchResult } from "../domain/SearchResult";
import { QuotationRepository } from "@/src/app/quotation/domain/QuotationRepository";
import { InvoiceRepository } from "@/src/app/invoice/domain/InvoiceRepository";

export async function searchByProduct(
  productName: string,
  quotationRepo: QuotationRepository,
  invoiceRepo: InvoiceRepository
): Promise<SearchResult> {
  const query = productName.toLowerCase();
  const [quotations, invoices] = await Promise.all([
    quotationRepo.findAll(),
    invoiceRepo.findAll(),
  ]);

  return {
    quotations: quotations.filter((q) =>
      q.lines.some((line) => line.productName.toLowerCase().includes(query))
    ),
    invoices: invoices.filter((inv) =>
      inv.lines.some((line) => line.productName.toLowerCase().includes(query))
    ),
  };
}

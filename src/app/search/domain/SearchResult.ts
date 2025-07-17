import { Quotation } from "@/src/app/quotation/domain/Quotation";
import { Invoice } from "@/src/app/invoice/domain/Invoice";

export interface SearchResult {
  quotations: Quotation[];
  invoices: Invoice[];
}

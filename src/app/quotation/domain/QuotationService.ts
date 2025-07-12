import { Quotation } from "./Quotation";

export class QuotationService {
  validateQuotation(quotation: Quotation): boolean {
    return quotation.isValid();
  }

  calculateTotals(quotation: Quotation): {
    totalWithoutTaxes: number;
    totalWithTaxes: number;
  } {
    return {
      totalWithoutTaxes: quotation.totalWithoutTaxes,
      totalWithTaxes: quotation.totalWithTaxes,
    };
  }
}

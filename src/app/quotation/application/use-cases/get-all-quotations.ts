import { QuotationRepository } from "../../domain/QuotationRepository";
import { Quotation } from "../../domain/Quotation";

export class GetAllQuotations {
  constructor(private quotationRepo: QuotationRepository) {}

  async execute(): Promise<Quotation[]> {
    return this.quotationRepo.findAll();
  }
}

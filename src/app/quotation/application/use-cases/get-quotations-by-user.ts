import { Quotation } from "../../domain/Quotation";
import { QuotationRepository } from "../../domain/QuotationRepository";

export class GetQuotationByUser {
  constructor(private quotationRepo: QuotationRepository) {}

  async execute(userId: string | undefined): Promise<Quotation[] | null> {
    const quotations = await this.quotationRepo.findByUser(userId);
    if (!quotations) return null;

    return quotations;
  }
}

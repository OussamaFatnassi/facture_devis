import { Quotation } from "../../domain/Quotation";
import { QuotationRepository } from "../../domain/QuotationRepository";
import { ClientRepository } from "../../domain/ClientRepository";

export class GetQuotationById {
  constructor(
    private quotationRepo: QuotationRepository,
    private clientRepo: ClientRepository
  ) {}

  async execute(id: string): Promise<Quotation | null> {
    const quotation = await this.quotationRepo.findById(id);
    if (!quotation) return null;

    const client = await this.clientRepo.findById(quotation.client.id);
    if (!client) return null;

    return new Quotation(
      quotation.id,
      quotation.version,
      quotation.lines,
      quotation.status,
      client,
      quotation.date,
      quotation.taxRate,
      quotation.userId
    );
  }
}

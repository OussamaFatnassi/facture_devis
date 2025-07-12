import { createQuotationUseCase } from "../use-cases/create-quotation";
import { QuotationRepository } from "../../domain/QuotationRepository";
import { CreateQuotationInput } from "../use-cases/create-quotation";
import { ClientRepository } from "../../domain/ClientRepository";

export class QuotationAppService {
  constructor(
    private repo: QuotationRepository,
    private clientRepo: ClientRepository
  ) {}

  async createQuotation(
    input: Omit<CreateQuotationInput, "client"> & { clientId: string }
  ) {
    const client = await this.clientRepo.findById(input.clientId);
    if (!client) {
      throw new Error("Client not found");
    }

    const quotation = await createQuotationUseCase(this.repo, {
      ...input,
      client,
    });

    return quotation;
  }
}

import { createQuotationUseCase } from "../use-cases/create-quotation";
import { QuotationRepository } from "../../domain/QuotationRepository";
import { CreateQuotationInput } from "../use-cases/create-quotation";
import { ClientRepository } from "../../domain/ClientRepository";
import { MailService } from "@/src/app/mail/application/services/MailService";
import { CurrentUserService } from "../../domain/services/CurrentUserService";

export class QuotationAppService {
  constructor(
    private repo: QuotationRepository,
    private clientRepo: ClientRepository,
    private mailService: MailService,
    private currentUserService?: CurrentUserService
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

    const currentUser = await this.currentUserService?.getCurrentUser();

    await this.mailService.sendQuotationConfirmation(
      quotation.client.email,
      quotation.id,
      `${
        currentUser?.user?.firstName
      } ${currentUser?.user?.lastName.toUpperCase()}`
    );

    return quotation;
  }
}

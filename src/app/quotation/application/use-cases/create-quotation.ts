import { Quotation } from "../../../quotation/domain/Quotation";
import { QuotationRepository } from "../../../quotation/domain/QuotationRepository";

export type CreateQuotationInput = {
  id: string;
  version: number;
  lines: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
  client: {
    id: string;
    firstname: string;
    lastname: string;
    activityName: string;
    address: string;
    phone: string;
    email: string;
    legalStatus: string;
  };
  taxRate: number;
};

export async function createQuotationUseCase(
  repo: QuotationRepository,
  input: CreateQuotationInput
): Promise<Quotation> {
  const lines = input.lines.map((line) => ({
    ...line,
    totalPrice: line.quantity * line.unitPrice,
  }));

  const quotation = new Quotation(
    input.id,
    input.version,
    lines,
    "draft",
    input.client,
    new Date(),
    input.taxRate
  );

  if (!quotation.isValid()) {
    throw new Error("Quotation must have at least one line.");
  }

  return repo.save(quotation);
}

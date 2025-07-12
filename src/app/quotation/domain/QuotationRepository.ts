import { Quotation } from "./Quotation";

export interface QuotationRepository {
  save(quotation: Quotation): Promise<Quotation>;
  findById(id: string): Promise<Quotation | null>;
  findAll(): Promise<Quotation[]>;
}

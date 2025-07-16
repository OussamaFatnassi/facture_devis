export type QuotationStatus = "draft" | "sent" | "accepted" | "rejected";

export interface QuotationLine {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ClientInfo {
  id: string;
  firstname: string;
  lastname: string;
  activityName: string;
  address: string;
  phone: string;
  email: string;
  legalStatus: string;
}

export class Quotation {
  constructor(
    public id: string,
    public version: number,
    public lines: QuotationLine[],
    public status: QuotationStatus,
    public client: ClientInfo,
    public date: Date,
    public taxRate: number,
    public userId: string
  ) {}

  get totalWithoutTaxes(): number {
    return this.lines.reduce((sum, line) => sum + line.totalPrice, 0);
  }

  get totalWithTaxes(): number {
    return this.totalWithoutTaxes * (1 + this.taxRate / 100);
  }

  isValid(): boolean {
    return this.lines.length > 0;
  }
}

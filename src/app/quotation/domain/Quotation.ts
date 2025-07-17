import { ProductLine } from '../../product/domain/ProductLine';

export type QuotationStatus = "draft" | "sent" | "accepted" | "rejected";

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
    public lines: ProductLine[],
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

  addProductLine(productLine: ProductLine): void {
    this.lines.push(productLine);
  }

  removeProductLine(index: number): void {
    if (index >= 0 && index < this.lines.length) {
      this.lines.splice(index, 1);
    }
  }

  updateProductLineQuantity(index: number, quantity: number): void {
    if (index >= 0 && index < this.lines.length && quantity > 0) {
      this.lines[index].quantity = quantity;
      this.lines[index].totalPrice = this.lines[index].unitPrice * quantity;
    }
  }
}

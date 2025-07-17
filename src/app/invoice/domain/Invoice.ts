import { ProductLine } from '../../product/domain/ProductLine';

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

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

export interface QuotationInfo {
  id: string;
  lines: ProductLine[];
  taxRate: number;
  date: Date;
}

export class Invoice {
  constructor(
    public id: string,
    public invoiceNumber: string,
    public status: InvoiceStatus,
    public date: Date,
    public dueDate: Date,
    public quotationId: string,
    public quotation: QuotationInfo,
    public client: ClientInfo,
    public totalExcludingTax: number,
    public totalIncludingTax: number,
    public taxRate: number,
    public paidDate?: Date,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}

  get lines(): ProductLine[] {
    return this.quotation.lines;
  }

  get taxAmount(): number {
    return this.totalExcludingTax * (this.taxRate / 100);
  }

  get isOverdue(): boolean {
    return this.status !== "paid" && this.dueDate < new Date();
  }

  get isPaid(): boolean {
    return this.status === "paid";
  }

  get canBePaid(): boolean {
    return this.status === "sent" || this.status === "overdue";
  }

  public markAsPaid(): void {
    if (!this.canBePaid) {
      throw new Error("Invoice cannot be marked as paid");
    }
    this.status = "paid";
    // Payment date is set to due date
    this.paidDate = this.dueDate;
    this.updatedAt = new Date();
  }

  public markAsSent(): void {
    if (this.status !== "draft") {
      throw new Error("Only draft invoices can be sent");
    }
    this.status = "sent";
    this.updatedAt = new Date();
  }

  public cancel(): void {
    if (this.status === "paid") {
      throw new Error("Paid invoices cannot be cancelled");
    }
    this.status = "cancelled";
    this.updatedAt = new Date();
  }

  public updateStatus(newStatus: InvoiceStatus): void {
    // Status transition validation
    const validTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
      draft: ["sent", "cancelled"],
      sent: ["paid", "overdue", "cancelled"],
      paid: [], // Paid invoices cannot change status
      overdue: ["paid", "cancelled"],
      cancelled: []
    };

    if (!validTransitions[this.status].includes(newStatus)) {
      throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
    }

    this.status = newStatus;
    if (newStatus === "paid") {
      // Payment date is set to due date
      this.paidDate = this.dueDate;
    }
    this.updatedAt = new Date();
  }

  public generateInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6);
    return `FAC-${year}${month}-${timestamp}`;
  }

  public toJSON() {
    return {
      id: this.id,
      invoiceNumber: this.invoiceNumber,
      status: this.status,
      date: this.date,
      dueDate: this.dueDate,
      quotationId: this.quotationId,
      client: this.client,
      totalExcludingTax: this.totalExcludingTax,
      totalIncludingTax: this.totalIncludingTax,
      taxRate: this.taxRate,
      lines: this.lines,
      taxAmount: this.taxAmount,
      paidDate: this.paidDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

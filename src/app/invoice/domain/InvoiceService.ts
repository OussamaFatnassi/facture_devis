import { Invoice, InvoiceStatus } from './Invoice';
import { Quotation } from '../../quotation/domain/Quotation';

export interface GenerateInvoiceFromQuotationData {
  quotation: Quotation;
  dueDate: Date;
  invoiceNumber?: string;
}

export class InvoiceService {
  
  /**
   * Generate an invoice from a quotation
   */
  public generateInvoiceFromQuotation(data: GenerateInvoiceFromQuotationData): Invoice {
    // Business rule validation: only accepted quotations can generate invoices
    if (data.quotation.status !== 'accepted') {
      throw new Error('Only accepted quotations can generate invoices');
    }

    // Business rule validation: quotation must be valid
    if (!data.quotation.client || !data.quotation.lines || data.quotation.lines.length === 0) {
      throw new Error('Quotation is invalid');
    }

    // Business rule validation: due date must be in the future
    if (data.dueDate <= new Date()) {
      throw new Error('Due date must be in the future');
    }

    const invoice = new Invoice(
      this.generateId(),
      data.invoiceNumber || this.generateInvoiceNumber(),
      'draft',
      new Date(),
      data.dueDate,
      data.quotation.id,
      {
        id: data.quotation.id,
        lines: data.quotation.lines,
        taxRate: data.quotation.taxRate,
        date: data.quotation.date
      },
      data.quotation.client,
      data.quotation.totalWithoutTaxes,
      data.quotation.totalWithTaxes,
      data.quotation.taxRate,
      undefined,
      new Date(),
      new Date()
    );

    return invoice;
  }

  /**
   * Calculate payment deadline based on invoice date
   */
  public calculateDueDate(invoiceDate: Date, paymentTermDays: number = 30): Date {
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + paymentTermDays);
    return dueDate;
  }

  /**
   * Check if invoice is overdue
   */
  public isInvoiceOverdue(invoice: Invoice): boolean {
    return invoice.status !== 'paid' && invoice.dueDate < new Date();
  }

  /**
   * Calculate days until due date
   */
  public getDaysUntilDueDate(invoice: Invoice): number {
    const today = new Date();
    const timeDiff = invoice.dueDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  /**
   * Validate status transition
   */
  public validateStatusTransition(currentStatus: InvoiceStatus, newStatus: InvoiceStatus): boolean {
    const validTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
      draft: ['sent', 'cancelled'],
      sent: ['paid', 'overdue', 'cancelled'],
      paid: [], // Paid invoices cannot change status
      overdue: ['paid', 'cancelled'],
      cancelled: []
    };

    return validTransitions[currentStatus].includes(newStatus);
  }

  /**
   * Calculate total with taxes
   */
  public calculateTotalWithTaxes(totalExcludingTax: number, taxRate: number): number {
    return totalExcludingTax * (1 + taxRate / 100);
  }

  /**
   * Calculate tax amount
   */
  public calculateTaxAmount(totalExcludingTax: number, taxRate: number): number {
    return totalExcludingTax * (taxRate / 100);
  }

  /**
   * Generate invoice number
   */
  private generateInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6);
    return `FAC-${year}${month}-${timestamp}`;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

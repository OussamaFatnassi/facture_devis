import { Invoice } from './Invoice';

export interface InvoiceRepository {
  /**
   * Save invoice (create or update)
   */
  save(invoice: Invoice): Promise<Invoice>;

  /**
   * Find invoice by ID
   */
  findById(id: string): Promise<Invoice | null>;

  /**
   * Find invoice by quotation ID
   */
  findByQuotationId(quotationId: string): Promise<Invoice | null>;

  /**
   * Find invoice by invoice number
   */
  findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null>;

  /**
   * Find all invoices
   */
  findAll(): Promise<Invoice[]>;

  /**
   * Find invoices by user ID
   */
  findByUser(userId: string): Promise<Invoice[]>;

  /**
   * Find invoices by client ID
   */
  findByClientId(clientId: string): Promise<Invoice[]>;

  /**
   * Find overdue invoices
   */
  findOverdueInvoices(): Promise<Invoice[]>;

  /**
   * Check if invoice exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Delete invoice by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Generate unique invoice number
   */
  generateUniqueInvoiceNumber(): Promise<string>;
}

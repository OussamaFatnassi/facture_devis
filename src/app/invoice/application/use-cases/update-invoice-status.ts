import { Invoice, InvoiceStatus } from '../../domain/Invoice';
import { InvoiceRepository } from '../../domain/InvoiceRepository';
import { InvoiceService } from '../../domain/InvoiceService';

export interface UpdateInvoiceStatusRequest {
  invoiceId: string;
  newStatus: InvoiceStatus;
}

export interface UpdateInvoiceStatusResponse {
  success: boolean;
  invoice?: Invoice;
  message: string;
  errors?: string[];
}

export class UpdateInvoiceStatusUseCase {
  constructor(
    private invoiceRepository: InvoiceRepository,
    private invoiceService: InvoiceService
  ) {}

  async execute(request: UpdateInvoiceStatusRequest): Promise<UpdateInvoiceStatusResponse> {
    try {
      // Input data validation
      const validationErrors = this.validateRequest(request);
      if (validationErrors.length > 0) {
        return {
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        };
      }

      // Retrieve the invoice
      const invoice = await this.invoiceRepository.findById(request.invoiceId);
      if (!invoice) {
        return {
          success: false,
          message: 'Invoice not found',
          errors: ['Invoice not found']
        };
      }

      // Validate status transition
      const isValidTransition = this.invoiceService.validateStatusTransition(
        invoice.status,
        request.newStatus
      );

      if (!isValidTransition) {
        return {
          success: false,
          message: `Invalid status transition from ${invoice.status} to ${request.newStatus}`,
          errors: [`Cannot change status from ${invoice.status} to ${request.newStatus}`]
        };
      }

      // Update the status
      invoice.updateStatus(request.newStatus);

      // Save the invoice
      const updatedInvoice = await this.invoiceRepository.save(invoice);

      return {
        success: true,
        invoice: updatedInvoice,
        message: `Invoice status updated to ${request.newStatus}`
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Status update failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private validateRequest(request: UpdateInvoiceStatusRequest): string[] {
    const errors: string[] = [];

    // Invoice ID validation
    if (!request.invoiceId || !request.invoiceId.trim()) {
      errors.push('Invoice ID is required');
    }

    // New status validation
    if (!request.newStatus) {
      errors.push('New status is required');
    }

    const validStatuses: InvoiceStatus[] = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
    if (!validStatuses.includes(request.newStatus)) {
      errors.push('Invalid status value');
    }

    return errors;
  }
} 
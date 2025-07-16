import { Invoice } from '../../domain/Invoice';
import { InvoiceRepository } from '../../domain/InvoiceRepository';

export interface GetInvoiceByIdRequest {
  invoiceId: string;
}

export interface GetInvoiceByIdResponse {
  success: boolean;
  invoice?: Invoice;
  message: string;
  errors?: string[];
}

export class GetInvoiceByIdUseCase {
  constructor(
    private invoiceRepository: InvoiceRepository
  ) {}

  async execute(request: GetInvoiceByIdRequest): Promise<GetInvoiceByIdResponse> {
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

      return {
        success: true,
        invoice,
        message: 'Invoice retrieved successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve invoice',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private validateRequest(request: GetInvoiceByIdRequest): string[] {
    const errors: string[] = [];

    // Invoice ID validation
    if (!request.invoiceId || !request.invoiceId.trim()) {
      errors.push('Invoice ID is required');
    }

    return errors;
  }
} 
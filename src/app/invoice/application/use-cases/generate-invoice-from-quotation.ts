import { Invoice } from '../../domain/Invoice';
import { InvoiceRepository } from '../../domain/InvoiceRepository';
import { InvoiceService } from '../../domain/InvoiceService';
import { QuotationRepository } from '../../../quotation/domain/QuotationRepository';

export interface GenerateInvoiceFromQuotationRequest {
  quotationId: string;
  dueDate: Date;
  invoiceNumber?: string;
}

export interface GenerateInvoiceFromQuotationResponse {
  success: boolean;
  invoice?: Invoice;
  message: string;
  errors?: string[];
}

export class GenerateInvoiceFromQuotationUseCase {
  constructor(
    private invoiceRepository: InvoiceRepository,
    private quotationRepository: QuotationRepository,
    private invoiceService: InvoiceService
  ) {}

  async execute(request: GenerateInvoiceFromQuotationRequest): Promise<GenerateInvoiceFromQuotationResponse> {
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

      // Retrieve the quotation
      const quotation = await this.quotationRepository.findById(request.quotationId);
      if (!quotation) {
        return {
          success: false,
          message: 'Quotation not found',
          errors: ['Quotation not found']
        };
      }

      // Check if an invoice already exists for this quotation
      const existingInvoice = await this.invoiceRepository.findByQuotationId(request.quotationId);
      if (existingInvoice) {
        return {
          success: false,
          message: 'Invoice already exists for this quotation',
          errors: ['Invoice already exists for this quotation']
        };
      }

      // Check invoice number uniqueness if provided
      if (request.invoiceNumber) {
        const existingInvoiceByNumber = await this.invoiceRepository.findByInvoiceNumber(request.invoiceNumber);
        if (existingInvoiceByNumber) {
          return {
            success: false,
            message: 'Invoice number already exists',
            errors: ['Invoice number already exists']
          };
        }
      }

      // Generate the invoice with domain service
      const invoice = this.invoiceService.generateInvoiceFromQuotation({
        quotation,
        dueDate: request.dueDate,
        invoiceNumber: request.invoiceNumber
      });

      // Save the invoice
      const savedInvoice = await this.invoiceRepository.save(invoice);

      return {
        success: true,
        invoice: savedInvoice,
        message: 'Invoice generated successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Invoice generation failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private validateRequest(request: GenerateInvoiceFromQuotationRequest): string[] {
    const errors: string[] = [];

    // Quotation ID validation
    if (!request.quotationId || !request.quotationId.trim()) {
      errors.push('Quotation ID is required');
    }

    // Due date validation
    if (!request.dueDate) {
      errors.push('Due date is required');
    } else if (request.dueDate <= new Date()) {
      errors.push('Due date must be in the future');
    }

    // Invoice number validation if provided
    if (request.invoiceNumber && !request.invoiceNumber.trim()) {
      errors.push('Invoice number cannot be empty');
    }

    return errors;
  }
} 
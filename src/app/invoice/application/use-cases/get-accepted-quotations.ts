import { QuotationRepository } from '../../../quotation/domain/QuotationRepository';
import { InvoiceRepository } from '../../domain/InvoiceRepository';

export interface AcceptedQuotationWithInvoice {
  quotation: any;
  hasInvoice: boolean;
  invoiceId?: string;
  invoice?: any;
}

export interface GetAcceptedQuotationsResponse {
  success: boolean;
  quotations: AcceptedQuotationWithInvoice[];
  message: string;
  errors?: string[];
}

export class GetAcceptedQuotationsUseCase {
  constructor(
    private quotationRepository: QuotationRepository,
    private invoiceRepository: InvoiceRepository
  ) {}

  async execute(): Promise<GetAcceptedQuotationsResponse> {
    try {
      // Retrieve all quotations
      const allQuotations = await this.quotationRepository.findAll();

      // Filter accepted quotations
      const acceptedQuotations = allQuotations.filter(q => q.status === 'accepted');

      // Check for each quotation if it already has an invoice
      const quotationsWithInvoiceInfo = await Promise.all(
        acceptedQuotations.map(async (quotation) => {
          const existingInvoice = await this.invoiceRepository.findByQuotationId(quotation.id);
          return {
            quotation,
            hasInvoice: !!existingInvoice,
            invoiceId: existingInvoice?.id,
            invoice: existingInvoice
          };
        })
      );

      return {
        success: true,
        quotations: quotationsWithInvoiceInfo,
        message: 'Accepted quotations retrieved successfully'
      };

    } catch (error) {
      return {
        success: false,
        quotations: [],
        message: error instanceof Error ? error.message : 'Failed to retrieve quotations',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
} 
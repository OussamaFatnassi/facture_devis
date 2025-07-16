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

  async execute(userId: string): Promise<GetAcceptedQuotationsResponse> {
    try {
      // Retrieve quotations for the specific user
      const userQuotations = await this.quotationRepository.findByUser(userId);
      
      if (!userQuotations) {
        return {
          success: true,
          quotations: [],
          message: 'No quotations found for user'
        };
      }

      // Filter accepted quotations
      const acceptedQuotations = userQuotations.filter(q => q.status === 'accepted');

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
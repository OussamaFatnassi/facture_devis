import { InvoiceRepository } from '../../domain/InvoiceRepository';
import { InvoiceService } from '../../domain/InvoiceService';
import { QuotationRepository } from '../../../quotation/domain/QuotationRepository';

import { 
  GenerateInvoiceFromQuotationUseCase, 
  GenerateInvoiceFromQuotationRequest, 
  GenerateInvoiceFromQuotationResponse 
} from '../use-cases/generate-invoice-from-quotation';

import { 
  GetAcceptedQuotationsUseCase, 
  GetAcceptedQuotationsResponse 
} from '../use-cases/get-accepted-quotations';

import { 
  UpdateInvoiceStatusUseCase, 
  UpdateInvoiceStatusRequest, 
  UpdateInvoiceStatusResponse 
} from '../use-cases/update-invoice-status';

import { 
  GetInvoiceByIdUseCase, 
  GetInvoiceByIdRequest, 
  GetInvoiceByIdResponse 
} from '../use-cases/get-invoice-by-id';

export class InvoiceAppService {
  private generateInvoiceUseCase: GenerateInvoiceFromQuotationUseCase;
  private getAcceptedQuotationsUseCase: GetAcceptedQuotationsUseCase;
  private updateInvoiceStatusUseCase: UpdateInvoiceStatusUseCase;
  private getInvoiceByIdUseCase: GetInvoiceByIdUseCase;

  constructor(
    private invoiceRepository: InvoiceRepository,
    private quotationRepository: QuotationRepository,
    private invoiceService: InvoiceService
  ) {
    this.generateInvoiceUseCase = new GenerateInvoiceFromQuotationUseCase(
      invoiceRepository, 
      quotationRepository, 
      invoiceService
    );
    
    this.getAcceptedQuotationsUseCase = new GetAcceptedQuotationsUseCase(
      quotationRepository, 
      invoiceRepository
    );
    
    this.updateInvoiceStatusUseCase = new UpdateInvoiceStatusUseCase(
      invoiceRepository, 
      invoiceService
    );
    
    this.getInvoiceByIdUseCase = new GetInvoiceByIdUseCase(invoiceRepository);
  }

  async generateInvoiceFromQuotation(
    request: GenerateInvoiceFromQuotationRequest
  ): Promise<GenerateInvoiceFromQuotationResponse> {
    return await this.generateInvoiceUseCase.execute(request);
  }

  async getAcceptedQuotations(): Promise<GetAcceptedQuotationsResponse> {
    return await this.getAcceptedQuotationsUseCase.execute();
  }

  async updateInvoiceStatus(
    request: UpdateInvoiceStatusRequest
  ): Promise<UpdateInvoiceStatusResponse> {
    return await this.updateInvoiceStatusUseCase.execute(request);
  }

  async getInvoiceById(
    request: GetInvoiceByIdRequest
  ): Promise<GetInvoiceByIdResponse> {
    return await this.getInvoiceByIdUseCase.execute(request);
  }
}

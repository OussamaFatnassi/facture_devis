import { GenerateInvoiceFromQuotationUseCase } from "../application/use-cases/generate-invoice-from-quotation";
import { Invoice } from "../domain/Invoice";
import { Quotation } from "../../quotation/domain/Quotation";
import { ClientInfo, QuotationLine } from "../../quotation/domain/Quotation";


const mockInvoiceRepo = {
  findByQuotationId: jest.fn(),
  findByInvoiceNumber: jest.fn(),
  save: jest.fn(),
};

const mockQuotationRepo = {
  findById: jest.fn(),
};

const mockInvoiceService = {
  generateInvoiceFromQuotation: jest.fn(),
};

describe("GenerateInvoiceFromQuotationUseCase", () => {
  let useCase: GenerateInvoiceFromQuotationUseCase;

  const client: ClientInfo = {
    id: "client1",
    firstname: "Alice",
    lastname: "Martin",
    activityName: "Entreprise X",
    address: "1 rue de Paris",
    phone: "0123456789",
    email: "alice@entreprise.com",
    legalStatus: "SARL",
  };

  const quotation = new Quotation(
    "q1",
    1,
    [{ description: "Produit", quantity: 1, unitPrice: 100, totalPrice: 100 }],
    "sent",
    client,
    new Date("2024-07-01"),
    20,
    "user1"
  );

  const invoice = new Invoice(
    "inv1",
    quotation,
    new Date("2024-08-01"),
    "INV-001"
  );

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GenerateInvoiceFromQuotationUseCase(
      mockInvoiceRepo as any,
      mockQuotationRepo as any,
      mockInvoiceService as any
    );
  });

  it("should generate and save invoice successfully", async () => {
    const request = {
      quotationId: "q1",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // tomorrow
      invoiceNumber: "INV-001",
    };

    mockQuotationRepo.findById.mockResolvedValue(quotation);
    mockInvoiceRepo.findByQuotationId.mockResolvedValue(null);
    mockInvoiceRepo.findByInvoiceNumber.mockResolvedValue(null);
    mockInvoiceService.generateInvoiceFromQuotation.mockReturnValue(invoice);
    mockInvoiceRepo.save.mockResolvedValue(invoice);

    const result = await useCase.execute(request);

    expect(mockQuotationRepo.findById).toHaveBeenCalledWith("q1");
    expect(mockInvoiceRepo.findByQuotationId).toHaveBeenCalledWith("q1");
    expect(mockInvoiceRepo.findByInvoiceNumber).toHaveBeenCalledWith("INV-001");
    expect(mockInvoiceService.generateInvoiceFromQuotation).toHaveBeenCalled();
    expect(mockInvoiceRepo.save).toHaveBeenCalledWith(invoice);

    expect(result.success).toBe(true);
    expect(result.invoice).toBe(invoice);
    expect(result.message).toBe("Invoice generated successfully");
  });

  it("should fail if quotation is not found", async () => {
    mockQuotationRepo.findById.mockResolvedValue(null);

    const result = await useCase.execute({
      quotationId: "invalid-id",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Quotation not found");
    expect(result.errors).toContain("Quotation not found");
  });

  it("should fail if invoice already exists for quotation", async () => {
    mockQuotationRepo.findById.mockResolvedValue(quotation);
    mockInvoiceRepo.findByQuotationId.mockResolvedValue(invoice);

    const result = await useCase.execute({
      quotationId: "q1",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain("Invoice already exists for this quotation");
  });

  it("should fail if invoice number already exists", async () => {
    mockQuotationRepo.findById.mockResolvedValue(quotation);
    mockInvoiceRepo.findByQuotationId.mockResolvedValue(null);
    mockInvoiceRepo.findByInvoiceNumber.mockResolvedValue(invoice);

    const result = await useCase.execute({
      quotationId: "q1",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
      invoiceNumber: "INV-001",
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain("Invoice number already exists");
  });

  it("should fail if due date is in the past", async () => {
    const result = await useCase.execute({
      quotationId: "q1",
      dueDate: new Date("2000-01-01"),
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain("Due date must be in the future");
  });

  it("should fail if quotation ID is missing", async () => {
    const result = await useCase.execute({
      quotationId: "   ",
      dueDate: new Date(Date.now() + 86400000),
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain("Quotation ID is required");
  });

  it("should fail if invoice number is empty string", async () => {
    const result = await useCase.execute({
      quotationId: "q1",
      dueDate: new Date(Date.now() + 86400000),
      invoiceNumber: "   ",
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain("Invoice number cannot be empty");
  });
});

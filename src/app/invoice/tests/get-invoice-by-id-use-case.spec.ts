import { GetInvoiceByIdUseCase } from "../application/use-cases/get-invoice-by-id";
import { Invoice } from "../domain/Invoice";
import { Quotation } from "../../quotation/domain/Quotation";
import { ClientInfo, QuotationLine } from "../../quotation/domain/Quotation";

// Mock du repository
const mockInvoiceRepository = {
  findById: jest.fn(),
};

describe("GetInvoiceByIdUseCase", () => {
  let useCase: GetInvoiceByIdUseCase;

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

  const lines: QuotationLine[] = [
    { description: "Produit A", quantity: 2, unitPrice: 100, totalPrice: 200 },
  ];

  const quotation = new Quotation(
    "q1",
    1,
    lines,
    "accepted",
    client,
    new Date("2024-07-01"),
    20,
    "user1"
  );

  const invoice = new Invoice("inv1", quotation, new Date("2024-08-01"), "INV-001");

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetInvoiceByIdUseCase(mockInvoiceRepository as any);
  });

  it("should return the invoice if it exists", async () => {
    mockInvoiceRepository.findById.mockResolvedValue(invoice);

    const result = await useCase.execute({ invoiceId: "inv1" });

    expect(mockInvoiceRepository.findById).toHaveBeenCalledWith("inv1");
    expect(result.success).toBe(true);
    expect(result.invoice).toBe(invoice);
    expect(result.message).toBe("Invoice retrieved successfully");
  });

  it("should return an error if invoice does not exist", async () => {
    mockInvoiceRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute({ invoiceId: "inv999" });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invoice not found");
    expect(result.errors).toContain("Invoice not found");
  });

  it("should validate input and return error if invoiceId is missing", async () => {
    const result = await useCase.execute({ invoiceId: "  " });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Validation failed");
    expect(result.errors).toContain("Invoice ID is required");
    expect(mockInvoiceRepository.findById).not.toHaveBeenCalled();
  });

  it("should handle unexpected errors gracefully", async () => {
    mockInvoiceRepository.findById.mockRejectedValue(new Error("Database down"));

    const result = await useCase.execute({ invoiceId: "inv1" });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Database down");
    expect(result.errors).toContain("Database down");
  });
});

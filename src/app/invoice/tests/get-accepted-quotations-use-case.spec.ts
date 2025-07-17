import { GetAcceptedQuotationsUseCase } from "../application/use-cases/get-accepted-quotations";
import { Quotation } from "../../quotation/domain/Quotation";
import { Invoice } from "../domain/Invoice";
import { ClientInfo, QuotationLine } from "../../quotation/domain/Quotation";

const mockQuotationRepository = {
  findByUser: jest.fn(),
};

const mockInvoiceRepository = {
  findByQuotationId: jest.fn(),
};

describe("GetAcceptedQuotationsUseCase", () => {
  let useCase: GetAcceptedQuotationsUseCase;

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
    { description: "Produit", quantity: 1, unitPrice: 100, totalPrice: 100 },
  ];

  const acceptedQuotation = new Quotation(
    "q1",
    1,
    lines,
    "accepted",
    client,
    new Date("2024-07-01"),
    20,
    "user1"
  );

  const draftQuotation = new Quotation(
    "q2",
    1,
    lines,
    "draft",
    client,
    new Date("2024-07-01"),
    20,
    "user1"
  );

  const invoice = new Invoice("inv1", acceptedQuotation, new Date("2024-08-01"), "INV-001");

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetAcceptedQuotationsUseCase(
      mockQuotationRepository as any,
      mockInvoiceRepository as any
    );
  });

  it("should return accepted quotations with invoice info", async () => {
    mockQuotationRepository.findByUser.mockResolvedValue([acceptedQuotation, draftQuotation]);
    mockInvoiceRepository.findByQuotationId.mockResolvedValue(invoice);

    const result = await useCase.execute("user1");

    expect(result.success).toBe(true);
    expect(result.quotations.length).toBe(1);
    expect(result.quotations[0].quotation).toEqual(acceptedQuotation);
    expect(result.quotations[0].hasInvoice).toBe(true);
    expect(result.quotations[0].invoiceId).toBe("inv1");
    expect(result.quotations[0].invoice).toBe(invoice);
    expect(result.message).toBe("Accepted quotations retrieved successfully");
  });

  it("should return accepted quotations without invoice", async () => {
    mockQuotationRepository.findByUser.mockResolvedValue([acceptedQuotation]);
    mockInvoiceRepository.findByQuotationId.mockResolvedValue(null);

    const result = await useCase.execute("user1");

    expect(result.success).toBe(true);
    expect(result.quotations.length).toBe(1);
    expect(result.quotations[0].hasInvoice).toBe(false);
   
  });

  it("should return empty list if user has no quotations", async () => {
    mockQuotationRepository.findByUser.mockResolvedValue(null);

    const result = await useCase.execute("user1");

    expect(result.success).toBe(true);
    expect(result.quotations).toEqual([]);
    expect(result.message).toBe("No quotations found for user");
  });

  it("should handle errors and return failure response", async () => {
    mockQuotationRepository.findByUser.mockRejectedValue(new Error("DB error"));

    const result = await useCase.execute("user1");

    expect(result.success).toBe(false);
    expect(result.message).toBe("DB error");
    expect(result.errors).toContain("DB error");
    expect(result.quotations).toEqual([]);
  });
});

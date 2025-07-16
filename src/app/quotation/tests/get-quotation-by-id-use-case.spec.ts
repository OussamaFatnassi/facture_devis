import { GetQuotationById } from "../application/use-cases/get-quotation-by-id";
import { Quotation } from "../domain/Quotation";
import { QuotationRepository } from "../domain/QuotationRepository";
import { ClientRepository } from "../domain/ClientRepository";
import { ClientInfo, QuotationLine } from "../domain/Quotation";

// Mock des repositories
const mockQuotationRepo: jest.Mocked<QuotationRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
};

const mockClientRepo: jest.Mocked<ClientRepository> = {
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
};

describe("GetQuotationById", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return the quotation with full client info", async () => {
    const quotationId = "q123";

    const client: ClientInfo = {
      id: "c1",
      firstname: "Alice",
      lastname: "Martin",
      activityName: "Entreprise X",
      address: "1 rue de Paris",
      phone: "0123456789",
      email: "alice@entreprise.com",
      legalStatus: "SARL",
    };

    const lines: QuotationLine[] = [
      { description: "Produit 1", quantity: 2, unitPrice: 50, totalPrice: 100 },
    ];

    const quotation = new Quotation(
      quotationId,
      1,
      lines,
      "draft",
      client, // Placeholder, client will be reloaded from repo
      new Date("2024-07-10"),
      20,
      "user1"
    );

    // Simule un client partiel dans quotation (ex: ID uniquement)
    const quotationFromRepo = new Quotation(
      quotationId,
      1,
      lines,
      "draft",
      { id: "c1" } as ClientInfo, // client incomplet
      new Date("2024-07-10"),
      20,
      "user1"
    );

    mockQuotationRepo.findById.mockResolvedValue(quotationFromRepo);
    mockClientRepo.findById.mockResolvedValue(client);

    const useCase = new GetQuotationById(mockQuotationRepo, mockClientRepo);

    const result = await useCase.execute(quotationId);

    expect(mockQuotationRepo.findById).toHaveBeenCalledWith(quotationId);
    expect(mockClientRepo.findById).toHaveBeenCalledWith("c1");
    expect(result).toBeInstanceOf(Quotation);
    expect(result?.client.firstname).toBe("Alice");
    expect(result?.isValid()).toBe(true);
  });

  it("should return null if quotation is not found", async () => {
    mockQuotationRepo.findById.mockResolvedValue(null);

    const useCase = new GetQuotationById(mockQuotationRepo, mockClientRepo);
    const result = await useCase.execute("invalid-id");

    expect(result).toBeNull();
    expect(mockQuotationRepo.findById).toHaveBeenCalledWith("invalid-id");
    expect(mockClientRepo.findById).not.toHaveBeenCalled();
  });

  it("should return null if client is not found", async () => {
    const quotationId = "q456";
    const quotationWithClientIdOnly = new Quotation(
      quotationId,
      1,
      [],
      "draft",
      { id: "c2" } as ClientInfo,
      new Date(),
      20,
      "user2"
    );

    mockQuotationRepo.findById.mockResolvedValue(quotationWithClientIdOnly);
    mockClientRepo.findById.mockResolvedValue(null);

    const useCase = new GetQuotationById(mockQuotationRepo, mockClientRepo);
    const result = await useCase.execute(quotationId);

    expect(result).toBeNull();
    expect(mockQuotationRepo.findById).toHaveBeenCalledWith(quotationId);
    expect(mockClientRepo.findById).toHaveBeenCalledWith("c2");
  });
});

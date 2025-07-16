import { GetQuotationByUser } from "../application/use-cases/get-quotations-by-user";
import { Quotation } from "../domain/Quotation";
import { QuotationRepository } from "../domain/QuotationRepository";
import { QuotationLine, ClientInfo } from "../domain/Quotation";

// Mock du repository
const mockQuotationRepo: jest.Mocked<QuotationRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByUser: jest.fn(),
  save: jest.fn(),
};

describe("GetQuotationByUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return quotations for the given user", async () => {
    const userId = "user1";

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

    const quotation1 = new Quotation(
      "q1",
      1,
      lines,
      "draft",
      client,
      new Date("2024-07-01"),
      20,
      userId
    );

    const quotation2 = new Quotation(
      "q2",
      2,
      lines,
      "sent",
      client,
      new Date("2024-07-02"),
      20,
      userId
    );

    mockQuotationRepo.findByUser.mockResolvedValue([quotation1, quotation2]);

    const useCase = new GetQuotationByUser(mockQuotationRepo);
    const result = await useCase.execute(userId);

    expect(mockQuotationRepo.findByUser).toHaveBeenCalledWith(userId);
    expect(result).toEqual([quotation1, quotation2]);
    expect(result?.[0].isValid()).toBe(true);
  });

  it("should return null if no quotations found", async () => {
    mockQuotationRepo.findByUser.mockResolvedValue(null);

    const useCase = new GetQuotationByUser(mockQuotationRepo);
    const result = await useCase.execute("user-not-found");

    expect(mockQuotationRepo.findByUser).toHaveBeenCalledWith("user-not-found");
    expect(result).toBeNull();
  });
});

import { createQuotationUseCase, CreateQuotationInput } from "../application/use-cases/create-quotation";
import { Quotation } from "../domain/Quotation";
import { QuotationRepository } from "../domain/QuotationRepository";


const mockRepo: jest.Mocked<QuotationRepository> = {
  findAll: jest.fn(),
  save: jest.fn(),
};

jest.mock("../domain/Quotation");

describe("createQuotationUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create and save a valid quotation", async () => {
    const input: CreateQuotationInput = {
      id: "q1",
      version: 1,
      lines: [
        { description: "Produit A", quantity: 2, unitPrice: 50 },
        { description: "Produit B", quantity: 1, unitPrice: 100 },
      ],
      client: {
        id: "c1",
        firstname: "Alice",
        lastname: "Martin",
        activityName: "Entreprise X",
        address: "1 rue de Paris",
        phone: "0123456789",
        email: "alice@entreprise.com",
        legalStatus: "SARL",
      },
      taxRate: 20,
      userId: "user1",
    };

    const expectedQuotation = new Quotation(
      input.id,
      input.version,
      input.lines.map((line) => ({
        ...line,
        totalPrice: line.quantity * line.unitPrice,
      })),
      "draft",
      input.client,
      expect.any(Date),
      input.taxRate,
      input.userId
    );

   
    jest.spyOn(expectedQuotation, "isValid").mockReturnValue(true);

    
    (Quotation as jest.Mock).mockImplementation(() => expectedQuotation);

    mockRepo.save.mockResolvedValue(expectedQuotation);

    const result = await createQuotationUseCase(mockRepo, input);

    expect(result).toBe(expectedQuotation);
    expect(mockRepo.save).toHaveBeenCalledWith(expectedQuotation);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it("should throw an error if quotation is invalid", async () => {
    const input: CreateQuotationInput = {
      id: "q2",
      version: 1,
      lines: [],
      client: {
        id: "c2",
        firstname: "Bob",
        lastname: "Durand",
        activityName: "SARL Beta",
        address: "2 avenue République",
        phone: "0600000000",
        email: "bob@beta.com",
        legalStatus: "SAS",
      },
      taxRate: 20,
      userId: "user2",
    };

    const invalidQuotation = new Quotation(
      input.id,
      input.version,
      [],
      "draft",
      input.client,
      new Date(),
      input.taxRate,
      input.userId
    );

    jest.spyOn(invalidQuotation, "isValid").mockReturnValue(false);
    (Quotation as jest.Mock).mockImplementation(() => invalidQuotation);

    await expect(createQuotationUseCase(mockRepo, input)).rejects.toThrow("Quotation must have at least one line.");
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});

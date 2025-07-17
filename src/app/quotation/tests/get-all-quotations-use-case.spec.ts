import { GetAllQuotations } from "../application/use-cases/get-all-quotations";
import { ClientInfo, Quotation, QuotationLine } from "../domain/Quotation";
import { QuotationRepository } from "../domain/QuotationRepository";


const mockQuotationRepo: jest.Mocked<QuotationRepository> = {
  findAll: jest.fn(),
};

describe("GetAllQuotations", () => {
  beforeEach(() => {
    jest.clearAllMocks(); 
  });

  it("should return all quotations from the repository", async () => {

    const lines: QuotationLine[] = [
      { description: "Produit 1", quantity: 2, unitPrice: 50, totalPrice: 100 },
      { description: "Produit 2", quantity: 1, unitPrice: 150, totalPrice: 150 },
    ];

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

    const quotation1 = new Quotation(
      "q1",
      1,
      lines,
      "draft",
      client,
      new Date("2024-07-01"),
      20,
      "user1"
    );

    const quotation2 = new Quotation(
      "q2",
      2,
      lines,
      "sent",
      client,
      new Date("2024-07-02"),
      20,
      "user1"
    );

    mockQuotationRepo.findAll.mockResolvedValue([quotation1, quotation2]);

    const useCase = new GetAllQuotations(mockQuotationRepo);

    const result = await useCase.execute();

    expect(mockQuotationRepo.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([quotation1, quotation2]);
    expect(result[0].isValid()).toBe(true);
    expect(result[1].isValid()).toBe(true);
  });

  it("should return an empty array if there are no quotations", async () => {
    mockQuotationRepo.findAll.mockResolvedValue([]);

    const useCase = new GetAllQuotations(mockQuotationRepo);

    const result = await useCase.execute();

    expect(mockQuotationRepo.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });
});

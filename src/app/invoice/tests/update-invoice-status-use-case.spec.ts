import { UpdateInvoiceStatusUseCase } from "../application/use-cases/update-invoice-status";
import { Invoice, InvoiceStatus } from "../domain/Invoice";

const mockInvoiceRepository = {
  findById: jest.fn(),
  save: jest.fn(),
};

const mockInvoiceService = {
  validateStatusTransition: jest.fn(),
};

describe("UpdateInvoiceStatusUseCase", () => {
  let useCase: UpdateInvoiceStatusUseCase;
  let invoice: Invoice;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateInvoiceStatusUseCase(
      mockInvoiceRepository as any,
      mockInvoiceService as any
    );

    invoice = {
      id: "inv1",
      status: "draft",
      updateStatus(newStatus: InvoiceStatus) {
        this.status = newStatus;
      },
    } as Invoice;
  });

  it("should update invoice status successfully", async () => {
    mockInvoiceRepository.findById.mockResolvedValue(invoice);
    mockInvoiceService.validateStatusTransition.mockReturnValue(true);
    mockInvoiceRepository.save.mockResolvedValue({
      ...invoice,
      status: "sent",
    });

    const result = await useCase.execute({ invoiceId: "inv1", newStatus: "sent" });

    expect(mockInvoiceRepository.findById).toHaveBeenCalledWith("inv1");
    expect(mockInvoiceService.validateStatusTransition).toHaveBeenCalledWith("draft", "sent");
    expect(mockInvoiceRepository.save).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.invoice?.status).toBe("sent");
    expect(result.message).toBe("Invoice status updated to sent");
  });

  it("should fail if invoice not found", async () => {
    mockInvoiceRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute({ invoiceId: "inv999", newStatus: "sent" });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invoice not found");
    expect(result.errors).toContain("Invoice not found");
  });

  it("should fail if status transition is invalid", async () => {
    mockInvoiceRepository.findById.mockResolvedValue(invoice);
    mockInvoiceService.validateStatusTransition.mockReturnValue(false);

    const result = await useCase.execute({ invoiceId: "inv1", newStatus: "paid" });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid status transition from draft to paid");
    expect(result.errors).toContain("Cannot change status from draft to paid");
  });

  it("should validate input and return errors", async () => {
    const result = await useCase.execute({ invoiceId: "  ", newStatus: "invalid-status" as InvoiceStatus });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Validation failed");
    expect(result.errors).toContain("Invoice ID is required");
    expect(result.errors).toContain("Invalid status value");
  });

  it("should handle exceptions gracefully", async () => {
    mockInvoiceRepository.findById.mockRejectedValue(new Error("DB error"));

    const result = await useCase.execute({ invoiceId: "inv1", newStatus: "sent" });

    expect(result.success).toBe(false);
    expect(result.message).toBe("DB error");
    expect(result.errors).toContain("DB error");
  });
});

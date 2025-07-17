import { searchByProduct } from "../../application/SearchByProduct";
import { PrismaQuotationRepository } from "@/src/app/quotation/infrastructure/repositories/quotation-repository";
import { PrismaInvoiceRepository } from "@/src/app/invoice/infrastructure/repositories/invoice-repository";

export async function byProductController(productName: string, userId: string) {
  return searchByProduct(
    productName,
    userId,
    new PrismaQuotationRepository(),
    new PrismaInvoiceRepository()
  );
}

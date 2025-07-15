"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { QuotationAppService } from "../application/services/quotation-service";
import { PrismaQuotationRepository } from "../infrastructure/repositories/quotation-repository";
import { PrismaClientRepository } from "../infrastructure/repositories/client-repository";
import { getCurrentUser } from "../../user-auth/actions/login-actions";
import { NodemailerMailer } from "@/src/app/mail/infrastructure/nodemailer-mailer";
import { MailService } from "@/src/app/mail/application/services/MailService";
import { CurrentUserServiceImpl } from "../../user-auth/infrastructure/services/current-user-service";

const quotationService = new QuotationAppService(
  new PrismaQuotationRepository(),
  new PrismaClientRepository(),
  new MailService(new NodemailerMailer()),
  new CurrentUserServiceImpl()
);

export async function createQuotation(formData: FormData) {
  const clientId = formData.get("clientId")?.toString();
  const taxRate = parseFloat(formData.get("taxRate")?.toString() || "0");

  const descriptions = formData.getAll("description") as string[];
  const unitPrices = formData.getAll("unitPrice").map(Number);
  const quantities = formData.getAll("quantity").map(Number);

  const lines = descriptions.map((description, index) => {
    const quantity = quantities[index];
    const unitPrice = unitPrices[index];
    return {
      description,
      quantity,
      unitPrice,
    };
  });

  const userResponse = await getCurrentUser();
  const user = userResponse.user;
  const userId = user?.id;

  await quotationService.createQuotation({
    id: crypto.randomUUID(),
    version: 1,
    clientId: clientId!,
    lines,
    taxRate,
    userId,
  });

  revalidatePath("/quotation");
  redirect("/quotation/list");
}

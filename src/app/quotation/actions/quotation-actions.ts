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
import { GetQuotationByUser } from "../application/use-cases/get-quotations-by-user";
import { QuotationStatus, Quotation } from "../domain/Quotation";

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

export async function getAllQuotations() {
  try {
    const repo = new PrismaQuotationRepository();
    const userService = new CurrentUserServiceImpl();
    const useCase = new GetQuotationByUser(repo);
    const userResponse = await userService.getCurrentUser();
    
    // Check if user is authenticated
    if (!userResponse.success || !userResponse.user?.id) {
      console.error("User not authenticated:", userResponse.message);
      return [];
    }

    const quotations = await useCase.execute(userResponse.user.id);

    if (!quotations) {
      return [];
    }

    return quotations.map(quotation => ({
      id: quotation.id,
      version: quotation.version,
      status: quotation.status,
      date: quotation.date.toISOString(),
      taxRate: quotation.taxRate,
      totalWithoutTaxes: quotation.totalWithoutTaxes,
      totalWithTaxes: quotation.totalWithTaxes,
      client: quotation.client,
      lines: quotation.lines,
      userId: quotation.userId
    }));
  } catch (error) {
    console.error("Error fetching quotations:", error);
    throw new Error("Failed to fetch quotations");
  }
}

export async function updateQuotationStatus(formData: FormData) {
  try {
    const quotationId = formData.get('quotationId')?.toString();
    const newStatus = formData.get('status')?.toString() as QuotationStatus;

    if (!quotationId || !newStatus) {
      throw new Error('Missing quotation ID or status');
    }

    const repo = new PrismaQuotationRepository();
    const quotation = await repo.findById(quotationId);

    if (!quotation) {
      throw new Error('Quotation not found');
    }

    // Update the quotation status
    const updatedQuotation = new Quotation(
      quotation.id,
      quotation.version,
      quotation.lines,
      newStatus,
      quotation.client,
      quotation.date,
      quotation.taxRate,
      quotation.userId
    );

    await repo.update(updatedQuotation);
    
    revalidatePath('/quotation/list');
    return { success: true };
  } catch (error) {
    throw new Error('Failed to update quotation status');
  }
}

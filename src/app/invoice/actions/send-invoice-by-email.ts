"use server";

import { MailService } from "@/src/app/mail/application/services/MailService";
import { NodemailerMailer } from "@/src/app/mail/infrastructure/nodemailer-mailer";
import { PrismaInvoiceRepository } from "../infrastructure/repositories/invoice-repository";

import { getCurrentUser } from "../../user-auth/actions/login-actions";
import { InvoiceStatus } from "../domain/Invoice";
import { revalidatePath } from "next/cache";
import { PrismaQuotationRepository } from "../../quotation/infrastructure/repositories/quotation-repository";
import { InvoiceService } from "../domain/InvoiceService";
import { InvoiceAppService } from "../application/services/invoice-service";

const invoiceRepository = new PrismaInvoiceRepository();
const quotationRepository = new PrismaQuotationRepository();
const invoiceService = new InvoiceService();
const invoiceAppService = new InvoiceAppService(
  invoiceRepository,
  quotationRepository,
  invoiceService
);

export async function sendInvoiceMail(invoiceId: string) {
  const invoiceClient = await invoiceRepository.findById(invoiceId);
  const currentUser = await getCurrentUser();
  const mailer = new NodemailerMailer();
  const mailService = new MailService(mailer);

  try {
    await mailService.sendQuotationConfirmation(
      invoiceClient?.client.email as string,
      invoiceId,
      invoiceClient?.client.firstname as string,
      `${
        currentUser?.user?.firstName
      } ${currentUser?.user?.lastName.toUpperCase()}`,
      true
    );

    await updateInvoiceStatus(invoiceId, "sent");

    return { message: "Email sent." };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to send Invoice"
    );
  }
}

async function updateInvoiceStatus(
  invoiceId: string,
  newStatus: InvoiceStatus
) {
  if (!invoiceId || !newStatus) {
    throw new Error("Invoice ID and status are required");
  }
  try {
    const userResponse = await getCurrentUser();
    if (!userResponse.success || !userResponse.user) {
      throw new Error("User not authenticated");
    }

    // Verify invoice belongs to current user (via quotation)
    const invoice = await invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    const quotation = await quotationRepository.findById(invoice.quotationId);
    if (!quotation || quotation.userId !== userResponse.user.id) {
      throw new Error("Access denied: Invoice does not belong to current user");
    }
    let response;
    if (invoice.status === "draft") {
      response = await invoiceAppService.updateInvoiceStatus({
        invoiceId,
        newStatus,
      });
      if (!response.success) {
        throw new Error(response.message);
      }
      return { success: true, message: response.message };
    }

    revalidatePath("/invoice");
    return { success: true };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to update invoice status"
    );
  }
}

"use server";

import { revalidatePath } from "next/cache";

import { InvoiceAppService } from "../application/services/invoice-service";
import { PrismaInvoiceRepository } from "../infrastructure/repositories/invoice-repository";
import { PrismaQuotationRepository } from "../../quotation/infrastructure/repositories/quotation-repository";
import { InvoiceService } from "../domain/InvoiceService";
import { InvoiceStatus } from "../domain/Invoice";

// Initialize services
const invoiceRepository = new PrismaInvoiceRepository();
const quotationRepository = new PrismaQuotationRepository();
const invoiceService = new InvoiceService();
const invoiceAppService = new InvoiceAppService(
  invoiceRepository,
  quotationRepository,
  invoiceService
);

export async function createInvoiceAsDraft(quotationId: string) {
  try {
    // Get current user to verify quotation ownership
    const { getCurrentUser } = await import(
      "../../user-auth/actions/login-actions"
    );
    const userResponse = await getCurrentUser();
    if (!userResponse.success || !userResponse.user) {
      throw new Error("User not authenticated");
    }

    // Verify quotation belongs to current user
    const quotation = await quotationRepository.findById(quotationId);
    if (!quotation) {
      throw new Error("Quotation not found");
    }
    if (quotation.userId !== userResponse.user.id) {
      throw new Error(
        "Access denied: Quotation does not belong to current user"
      );
    }

    const response = await invoiceAppService.generateInvoiceFromQuotation({
      quotationId,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      invoiceNumber: undefined, // Will be auto-generated
    });

    if (!response.success) {
      throw new Error(response.message);
    }

    revalidatePath("/invoice");
    return { success: true, invoiceId: response.invoice?.id };
  } catch (error) {
    console.error("Error creating invoice as draft:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create invoice",
    };
  }
}

export async function generateInvoiceFromQuotation(formData: FormData) {
  try {
    const quotationId = formData.get("quotationId") as string;
    const dueDateStr = formData.get("dueDate") as string;
    const invoiceNumber = formData.get("invoiceNumber") as string;

    if (!quotationId || !dueDateStr) {
      throw new Error("Quotation ID and due date are required");
    }

    // Get current user to verify quotation ownership
    const { getCurrentUser } = await import(
      "../../user-auth/actions/login-actions"
    );
    const userResponse = await getCurrentUser();
    if (!userResponse.success || !userResponse.user) {
      throw new Error("User not authenticated");
    }

    // Verify quotation belongs to current user
    const quotation = await quotationRepository.findById(quotationId);
    if (!quotation) {
      throw new Error("Quotation not found");
    }
    if (quotation.userId !== userResponse.user.id) {
      throw new Error(
        "Access denied: Quotation does not belong to current user"
      );
    }

    const dueDate = new Date(dueDateStr);
    if (dueDate <= new Date()) {
      throw new Error("Due date must be in the future");
    }

    const response = await invoiceAppService.generateInvoiceFromQuotation({
      quotationId,
      dueDate,
      invoiceNumber: invoiceNumber || undefined,
    });

    if (!response.success) {
      throw new Error(response.message);
    }

    revalidatePath("/invoice");
    return { success: true, invoiceId: response.invoice?.id };
  } catch (error) {
    console.error("Error generating invoice:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate invoice"
    );
  }
}

export async function updateInvoiceStatus(formData: FormData) {
  try {
    const invoiceId = formData.get("invoiceId") as string;
    const newStatus = formData.get("status") as InvoiceStatus;

    if (!invoiceId || !newStatus) {
      throw new Error("Invoice ID and status are required");
    }

    // Get current user to verify invoice ownership
    const { getCurrentUser } = await import(
      "../../user-auth/actions/login-actions"
    );
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

    const response = await invoiceAppService.updateInvoiceStatus({
      invoiceId,
      newStatus,
    });

    if (!response.success) {
      throw new Error(response.message);
    }

    revalidatePath("/invoice");
    return { success: true, message: response.message };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to update invoice status"
    );
  }
}

export async function getAcceptedQuotations() {
  try {
    // Get current user to filter quotations
    const { getCurrentUser } = await import(
      "../../user-auth/actions/login-actions"
    );
    const userResponse = await getCurrentUser();
    if (!userResponse.success || !userResponse.user) {
      throw new Error("User not authenticated");
    }

    const response = await invoiceAppService.getAcceptedQuotations(
      userResponse.user.id
    );

    if (!response.success) {
      throw new Error(response.message);
    }

    // Convert to plain objects to avoid serialization issues
    return response.quotations.map((item) => ({
      quotation: {
        id: item.quotation.id,
        version: item.quotation.version,
        lines: item.quotation.lines,
        status: item.quotation.status,
        client: {
          id: item.quotation.client.id,
          firstname: item.quotation.client.firstname,
          lastname: item.quotation.client.lastname,
          activityName: item.quotation.client.activityName,
          address: item.quotation.client.address,
          phone: item.quotation.client.phone,
          email: item.quotation.client.email,
          legalStatus: item.quotation.client.legalStatus,
        },
        date: item.quotation.date.toISOString(),
        taxRate: item.quotation.taxRate,
        totalWithoutTaxes: item.quotation.totalWithoutTaxes,
        totalWithTaxes: item.quotation.totalWithTaxes,
      },
      hasInvoice: item.hasInvoice,
      invoiceId: item.invoiceId,
      invoice: item.invoice
        ? {
            id: item.invoice.id,
            status: item.invoice.status,
            invoiceNumber: item.invoice.invoiceNumber,
            date: item.invoice.date.toISOString(),
            dueDate: item.invoice.dueDate.toISOString(),
            paidDate: item.invoice.paidDate?.toISOString(),
          }
        : undefined,
    }));
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to fetch accepted quotations"
    );
  }
}

export async function getInvoiceById(invoiceId: string) {
  try {
    // Get current user to verify invoice ownership
    const { getCurrentUser } = await import(
      "../../user-auth/actions/login-actions"
    );
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

    const response = await invoiceAppService.getInvoiceById({ invoiceId });

    if (!response.success) {
      throw new Error(response.message);
    }

    return response.invoice;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch invoice"
    );
  }
}

"use server";

import { PrismaQuotationRepository } from "../infrastructure/repositories/quotation-repository";
import { PrismaClientRepository } from "../infrastructure/repositories/client-repository";
import { QuotationAppService } from "../application/services/quotation-service";
import { NodemailerMailer } from "../../mail/infrastructure/nodemailer-mailer";
import { MailService } from "../../mail/application/services/MailService";
import { CurrentUserServiceImpl } from "@/src/app/quotation/infrastructure/services/current-user-service-implem";
import { getCurrentUser } from "../../user-auth/actions/login-actions";
import { CreateClientRequest } from "../domain/ClientRepository";
import { Quotation } from "../domain/Quotation";
import { QuotationStatus } from "@/generated/prisma";

export async function createQuotation(formData: FormData) {
  try {
    const quotationRepository = new PrismaQuotationRepository();
    const clientRepository = new PrismaClientRepository();
    const mailer = new NodemailerMailer();
    const currentUserService = new CurrentUserServiceImpl();
    const quotationService = new QuotationAppService(
      quotationRepository,
      clientRepository,
      new MailService(mailer),
      currentUserService
    );

    // Get current user
    const userResponse = await getCurrentUser();
    if (!userResponse.success || !userResponse.user) {
      throw new Error("User not authenticated");
    }

    // Handle new client creation
    const newClient = formData.get("newClient") === "true";
    let clientId = formData.get("clientId") as string;

    if (newClient) {
      // Create new client
      const clientData = {
        firstname: formData.get("firstname") as string,
        lastname: formData.get("lastname") as string,
        activityName: formData.get("activityName") as string,
        address: formData.get("address") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
        legalStatus: formData.get("legalStatus") as string,
      };

      const newClientResult = await clientRepository.create(
        clientData,
        userResponse.user.id
      );
      clientId = newClientResult.id;
    }

    // Extract lines data
    const quotationLines = formData.get("quotationLines") as string;
    const lines = JSON.parse(quotationLines);

    // Create quotation data
    const quotationData = {
      id: crypto.randomUUID(),
      version: 1,
      clientId,
      lines,
      taxRate: parseFloat(formData.get("taxRate") as string),
      userId: userResponse.user.id,
    };

    await quotationService.createQuotation(quotationData);

    return { success: true, message: "Devis créé avec succès" };
  } catch (error) {
    console.error("Error creating quotation:", error);
    return { success: false, message: "Erreur lors de la création du devis" };
  }
}

export async function getAllQuotations() {
  try {
    // Get current user to filter quotations
    const userResponse = await getCurrentUser();
    if (!userResponse.success || !userResponse.user) {
      return { success: false, message: "Utilisateur non authentifié" };
    }

    const quotationRepository = new PrismaQuotationRepository();
    const quotations = await quotationRepository.findByUser(
      userResponse.user.id
    );

    return { success: true, data: quotations || [] };
  } catch (error) {
    console.error("Error fetching quotations:", error);
    return {
      success: false,
      message: "Erreur lors de la récupération des devis",
    };
  }
}

export async function updateQuotationStatus(formData: FormData) {
  try {
    // Verify user authentication
    const userResponse = await getCurrentUser();
    if (!userResponse.success || !userResponse.user) {
      return { success: false, message: "Utilisateur non authentifié" };
    }

    const quotationRepository = new PrismaQuotationRepository();
    const quotationId = formData.get("quotationId") as string;
    const status = formData.get("status") as string;

    const quotation = await quotationRepository.findById(quotationId);
    if (!quotation) {
      throw new Error("Quotation not found");
    }

    // Verify that the quotation belongs to the current user
    if (quotation.userId !== userResponse.user.id) {
      return { success: false, message: "Accès non autorisé" };
    }

    const updatedQuotation = new Quotation(
      quotation.id,
      quotation.version,
      quotation.lines,
      status as QuotationStatus,
      quotation.client,
      quotation.date,
      quotation.taxRate,
      quotation.userId
    );

    await quotationRepository.update(updatedQuotation);
    return { success: true, message: "Statut du devis mis à jour" };
  } catch (error) {
    console.error("Error updating quotation status:", error);
    return {
      success: false,
      message: "Erreur lors de la mise à jour du statut",
    };
  }
}

export async function getAllClients() {
  try {
    // Get current user to filter clients
    const userResponse = await getCurrentUser();
    if (!userResponse.success || !userResponse.user) {
      return { success: false, message: "Utilisateur non authentifié" };
    }

    const clientRepository = new PrismaClientRepository();
    const clients = await clientRepository.findByUser(userResponse.user.id);
    return { success: true, data: clients };
  } catch (error) {
    console.error("Error fetching clients:", error);
    return {
      success: false,
      message: "Erreur lors de la récupération des clients",
    };
  }
}

export async function createClient(formData: FormData) {
  try {
    // Get current user to associate client with user
    const userResponse = await getCurrentUser();
    if (!userResponse.success || !userResponse.user) {
      return { success: false, message: "Utilisateur non authentifié" };
    }

    const clientRepository = new PrismaClientRepository();

    const clientData: CreateClientRequest = {
      firstname: formData.get("firstname") as string,
      lastname: formData.get("lastname") as string,
      activityName: formData.get("activityName") as string,
      address: formData.get("address") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      legalStatus: formData.get("legalStatus") as string,
    };

    const newClient = await clientRepository.create(
      clientData,
      userResponse.user.id
    );
    return { success: true, data: newClient };
  } catch (error) {
    console.error("Error creating client:", error);
    return { success: false, message: "Erreur lors de la création du client" };
  }
}

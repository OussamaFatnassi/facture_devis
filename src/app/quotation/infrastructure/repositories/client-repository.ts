import { ClientRepository } from "../../domain/ClientRepository";
import { prisma } from "@/lib/prisma";
import { ClientInfo } from "../../domain/Quotation";

export class PrismaClientRepository implements ClientRepository {
  async findById(id: string): Promise<ClientInfo | null> {
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) return null;

    return {
      id: client.id,
      firstname: client.firstname,
      lastname: client.lastname,
      activityName: client.activityName,
      address: client.address,
      phone: client.phone,
      email: client.email,
      legalStatus: client.legalStatus,
    };
  }
}

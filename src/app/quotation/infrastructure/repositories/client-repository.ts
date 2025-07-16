import { ClientRepository, CreateClientRequest } from "../../domain/ClientRepository";
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

  async findAll(): Promise<ClientInfo[]> {
    const clients = await prisma.client.findMany({
      orderBy: { lastname: 'asc' }
    });

    return clients.map(client => ({
      id: client.id,
      firstname: client.firstname,
      lastname: client.lastname,
      activityName: client.activityName,
      address: client.address,
      phone: client.phone,
      email: client.email,
      legalStatus: client.legalStatus,
    }));
  }

  async findByUser(userId: string): Promise<ClientInfo[]> {
    const clients = await prisma.client.findMany({
      where: { userId },
      orderBy: { lastname: 'asc' }
    });

    return clients.map(client => ({
      id: client.id,
      firstname: client.firstname,
      lastname: client.lastname,
      activityName: client.activityName,
      address: client.address,
      phone: client.phone,
      email: client.email,
      legalStatus: client.legalStatus,
    }));
  }

  async create(clientData: CreateClientRequest, userId: string): Promise<ClientInfo> {
    const client = await prisma.client.create({
      data: {
        firstname: clientData.firstname,
        lastname: clientData.lastname,
        activityName: clientData.activityName,
        address: clientData.address,
        phone: clientData.phone,
        email: clientData.email,
        legalStatus: clientData.legalStatus,
        userId: userId,
      }
    });

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

import { PrismaClient } from "../../../../../generated/prisma";
import { QuotationRepository } from "../../../quotation/domain/QuotationRepository";
import { Quotation } from "../../../quotation/domain/Quotation";
// import { toDomain, toPersistence } from "../mappers/quotation-mapper";

const prisma = new PrismaClient();

export class PrismaQuotationRepository implements QuotationRepository {
  async save(quotation: Quotation): Promise<Quotation> {
    await prisma.quotation.create({
      data: {
        id: quotation.id,
        version: quotation.version,
        status: quotation.status,
        date: quotation.date,
        taxRate: quotation.taxRate,
        userId: quotation.userId,
        client: {
          connect: { id: quotation.client.id },
        },
        quotationLines: JSON.stringify(quotation.lines),
      },
    });

    return quotation;
  }

  async findById(id: string): Promise<Quotation | null> {
    const record = await prisma.quotation.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!record) return null;

    const lines =
      typeof record.quotationLines === "string"
        ? JSON.parse(record.quotationLines)
        : record.quotationLines;

    return new Quotation(
      record.id,
      record.version,
      lines,
      record.status,
      {
        id: record.client.id,
        firstname: record.client.firstname,
        lastname: record.client.lastname,
        activityName: record.client.activityName,
        address: record.client.address,
        phone: record.client.phone,
        email: record.client.email,
        legalStatus: record.client.legalStatus,
      },
      record.date,
      record.taxRate,
      record.userId
    );
  }

  async findAll(): Promise<Quotation[]> {
    const records = await prisma.quotation.findMany({
      include: { client: true },
      orderBy: { date: "desc" },
    });

    return records.map((record) => {
      const lines =
        typeof record.quotationLines === "string"
          ? JSON.parse(record.quotationLines)
          : record.quotationLines;

      return new Quotation(
        record.id,
        record.version,
        lines,
        record.status,
        {
          id: record.client.id,
          firstname: record.client.firstname,
          lastname: record.client.lastname,
          activityName: record.client.activityName,
          address: record.client.address,
          phone: record.client.phone,
          email: record.client.email,
          legalStatus: record.client.legalStatus,
        },
        record.date,
        record.taxRate,
        record.userId
      );
    });
  }

  async findByUser(userId: string): Promise<Quotation[] | null> {
    const records = await prisma.quotation.findMany({
      where: { userId },
      include: { client: true },
      orderBy: { date: "desc" },
    });

    return records.map((record) => {
      const lines =
        typeof record.quotationLines === "string"
          ? JSON.parse(record.quotationLines)
          : record.quotationLines;

      return new Quotation(
        record.id,
        record.version,
        lines,
        record.status,
        {
          id: record.client.id,
          firstname: record.client.firstname,
          lastname: record.client.lastname,
          activityName: record.client.activityName,
          address: record.client.address,
          phone: record.client.phone,
          email: record.client.email,
          legalStatus: record.client.legalStatus,
        },
        record.date,
        record.taxRate,
        record.userId
      );
    });
  }

  async update(quotation: Quotation): Promise<Quotation> {
    const updatedRecord = await prisma.quotation.update({
      where: { id: quotation.id },
      data: {
        status: quotation.status,
        version: quotation.version,
        quotationLines: JSON.stringify(quotation.lines),
        taxRate: quotation.taxRate,
      },
      include: { client: true },
    });

    const lines = JSON.parse(updatedRecord.quotationLines as string);

    return new Quotation(
      updatedRecord.id,
      updatedRecord.version,
      lines,
      updatedRecord.status,
      {
        id: updatedRecord.client.id,
        firstname: updatedRecord.client.firstname,
        lastname: updatedRecord.client.lastname,
        activityName: updatedRecord.client.activityName,
        address: updatedRecord.client.address,
        phone: updatedRecord.client.phone,
        email: updatedRecord.client.email,
        legalStatus: updatedRecord.client.legalStatus,
      },
      updatedRecord.date,
      updatedRecord.taxRate,
      updatedRecord.userId
    );
  }
}

import { PrismaClient } from "../../../../../generated/prisma";
import { QuotationRepository } from "../../../quotation/domain/QuotationRepository";
import { Quotation, QuotationLine } from "../../../quotation/domain/Quotation";

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
        client: {
          connect: { id: quotation.client.id },
        },
        quotationLines: quotation.lines,
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

    const lines = record.quotationLines as unknown as QuotationLine[];

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
      record.taxRate
    );
  }

  async findAll(): Promise<Quotation[]> {
    const records = await prisma.quotation.findMany({
      include: { client: true },
      orderBy: { date: "desc" },
    });

    return records.map((record) => {
      const lines = record.quotationLines as unknown as QuotationLine[];

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
        record.taxRate
      );
    });
  }
}

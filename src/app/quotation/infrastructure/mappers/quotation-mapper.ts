import { Quotation as PrismaQuotation } from "@/generated/prisma";
import { Quotation } from "../../domain/Quotation";

export function toDomain(prismaQ: PrismaQuotation): Quotation {
  // ici, tu adaptes les champs selon ton domaine
  return new Quotation(
    prismaQ.id,
    prismaQ.version,
    prismaQ.quotationLines,
    prismaQ.status,
    prismaQ.date,
    prismaQ.taxRate,
    prismaQ.clientId,
    prismaQ.userId
  );
}

export function toPersistence(q: Quotation): PrismaQuotation {
  // Attention : il faut renvoyer le format attendu par Prisma
  return {
    id: q.id,
    version: q.version,
    status: q.status,
    date: q.date,
    taxRate: q.taxRate,
    client: q.client,
    userId: q.userId,
    quotationLines: q.lines,
  };
}

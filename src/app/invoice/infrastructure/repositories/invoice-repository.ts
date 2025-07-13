import { PrismaClient } from '../../../../../generated/prisma/index';
import { Invoice } from '../../domain/Invoice';
import { InvoiceRepository } from '../../domain/InvoiceRepository';

export class PrismaInvoiceRepository implements InvoiceRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async save(invoice: Invoice): Promise<Invoice> {
    const invoiceData = {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      date: invoice.date,
      dueDate: invoice.dueDate,
      paidDate: invoice.paidDate,
      quotationId: invoice.quotationId,
      clientId: invoice.client.id,
      totalExcludingTax: invoice.totalExcludingTax,
      totalIncludingTax: invoice.totalIncludingTax,
      taxRate: invoice.taxRate,
      updatedAt: new Date()
    };

    const result = await this.prisma.invoice.upsert({
      where: { id: invoice.id },
      create: invoiceData,
      update: invoiceData,
      include: {
        quotation: true,
        client: true
      }
    });

    return this.mapToDomain(result);
  }

  async findById(id: string): Promise<Invoice | null> {
    const result = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        quotation: true,
        client: true
      }
    });

    return result ? this.mapToDomain(result) : null;
  }

  async findByQuotationId(quotationId: string): Promise<Invoice | null> {
    const result = await this.prisma.invoice.findUnique({
      where: { quotationId },
      include: {
        quotation: true,
        client: true
      }
    });

    return result ? this.mapToDomain(result) : null;
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null> {
    const result = await this.prisma.invoice.findUnique({
      where: { invoiceNumber },
      include: {
        quotation: true,
        client: true
      }
    });

    return result ? this.mapToDomain(result) : null;
  }

  async findAll(): Promise<Invoice[]> {
    const results = await this.prisma.invoice.findMany({
      include: {
        quotation: true,
        client: true
      }
    });

    return results.map(result => this.mapToDomain(result));
  }

  async findByClientId(clientId: string): Promise<Invoice[]> {
    const results = await this.prisma.invoice.findMany({
      where: { clientId },
      include: {
        quotation: true,
        client: true
      }
    });

    return results.map(result => this.mapToDomain(result));
  }

  async findOverdueInvoices(): Promise<Invoice[]> {
    const results = await this.prisma.invoice.findMany({
      where: {
        status: { not: 'paid' },
        dueDate: { lt: new Date() }
      },
      include: {
        quotation: true,
        client: true
      },
      orderBy: { dueDate: 'asc' }
    });

    return results.map(result => this.mapToDomain(result));
  }

  async exists(id: string): Promise<boolean> {
    const result = await this.prisma.invoice.findUnique({
      where: { id }
    });
    return result !== null;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.invoice.delete({
      where: { id }
    });
  }

  async generateUniqueInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Find the last invoice number for the current month
    const lastInvoice = await this.prisma.invoice.findFirst({
      where: {
        invoiceNumber: {
          startsWith: `FAC-${year}${month}-`
        }
      },
      orderBy: {
        invoiceNumber: 'desc'
      }
    });

    let sequence = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `FAC-${year}${month}-${sequence.toString().padStart(6, '0')}`;
  }

  private mapToDomain(prismaInvoice: any): Invoice {
    return new Invoice(
      prismaInvoice.id,
      prismaInvoice.invoiceNumber,
      prismaInvoice.status,
      prismaInvoice.date,
      prismaInvoice.dueDate,
      prismaInvoice.quotationId,
      {
        id: prismaInvoice.quotation.id,
        lines: Array.isArray(prismaInvoice.quotation.quotationLines) ? prismaInvoice.quotation.quotationLines : JSON.parse(prismaInvoice.quotation.quotationLines || '[]'),
        taxRate: prismaInvoice.quotation.taxRate,
        date: prismaInvoice.quotation.date
      },
      {
        id: prismaInvoice.client.id,
        firstname: prismaInvoice.client.firstname,
        lastname: prismaInvoice.client.lastname,
        activityName: prismaInvoice.client.activityName,
        address: prismaInvoice.client.address,
        phone: prismaInvoice.client.phone,
        email: prismaInvoice.client.email,
        legalStatus: prismaInvoice.client.legalStatus
      },
      prismaInvoice.totalExcludingTax,
      prismaInvoice.totalIncludingTax,
      prismaInvoice.taxRate,
      prismaInvoice.paidDate,
      prismaInvoice.createdAt,
      prismaInvoice.updatedAt
    );
  }
}

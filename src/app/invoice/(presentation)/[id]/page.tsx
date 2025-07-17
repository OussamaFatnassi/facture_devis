import { GetInvoiceByIdUseCase } from '../../application/use-cases/get-invoice-by-id';
import { InvoiceRepository } from '../../domain/InvoiceRepository';
import { PrismaInvoiceRepository } from '../../infrastructure/repositories/invoice-repository';
import { notFound } from 'next/navigation';
import { InvoiceDetails } from '../../components/InvoiceDetails';

interface InvoiceDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function InvoiceDetailsPage({ params }: InvoiceDetailsPageProps) {
  const invoiceRepository: InvoiceRepository = new PrismaInvoiceRepository();
  const getInvoiceByIdUseCase = new GetInvoiceByIdUseCase(invoiceRepository);

  const result = await getInvoiceByIdUseCase.execute({
    invoiceId: params.id,
  });

  if (!result.success || !result.invoice) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <InvoiceDetails invoice={result.invoice} />
      </div>
    </div>
  );
} 
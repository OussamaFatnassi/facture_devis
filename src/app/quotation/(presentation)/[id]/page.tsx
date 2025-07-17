import { PrismaQuotationRepository } from "@/src/app/quotation/infrastructure/repositories/quotation-repository";
import { PrismaClientRepository } from "../../infrastructure/repositories/client-repository";
import { GetQuotationById } from "@/src/app/quotation/application/use-cases/get-quotation-by-id";
import { getCurrentUser } from "../../../user-auth/actions/login-actions";

import { notFound } from "next/navigation";
import Link from "next/link";

type Props = {
  params: {
    id: string;
  };
};

export default async function QuotationDetailPage({ params }: Props) {
  // Verify user authentication
  const userResponse = await getCurrentUser();
  if (!userResponse.success || !userResponse.user) {
    notFound();
  }

  const repo = new PrismaQuotationRepository();
  const clientRepo = new PrismaClientRepository();
  const useCase = new GetQuotationById(repo, clientRepo);

  const quotation = await useCase.execute(params.id);

  if (!quotation) {
    notFound();
  }

  // Verify that the quotation belongs to the current user
  if (quotation.userId !== userResponse.user.id) {
    notFound();
  }

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Détail du devis #{quotation.id}</h1>

      <div className="bg-white shadow p-6 rounded space-y-4">
        <div>
          <strong>Client :</strong> {quotation.client.firstname}{" "}
          {quotation.client.lastname} ({quotation.client.activityName})
        </div>
        <div>
          <strong>Date :</strong>{" "}
          {new Date(quotation.date).toLocaleDateString()}
        </div>
        <div>
          <strong>Statut :</strong> {quotation.status}
        </div>
        <div>
          <strong>TVA :</strong> {quotation.taxRate} %
        </div>
        <div>
          <strong>Lignes du devis :</strong>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            {quotation.lines.map((line, idx) => (
              <li key={idx}>
                {line.productName} — {line.quantity} x {line.unitPrice} € ={" "}
                {line.totalPrice.toFixed(2)} €
              </li>
            ))}
          </ul>
        </div>
        <div>
          <strong>Total HT :</strong> {quotation.totalWithoutTaxes.toFixed(2)} €
        </div>
        <div>
          <strong>Total TTC :</strong> {quotation.totalWithTaxes.toFixed(2)} €
        </div>
      </div>
      <div className="mt-8 flex gap-4">
        <a
          href={`/quotation/api/${quotation.id}/download`}
          target="_blank"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm"
        >
          Télécharger le PDF
        </a>

        <Link
          href="/quotation/list"
          className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition text-sm"
        >
          Retour à la liste des devis
        </Link>
      </div>
    </div>
  );
}

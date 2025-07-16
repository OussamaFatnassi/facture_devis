import { getAllQuotations } from "../../actions/quotation-actions";
import Link from "next/link";
import { QuotationTable } from "../../components/QuotationTable";
import { Quotation } from "../../domain/Quotation";

// Fonction utilitaire pour convertir les instances de classe en objets simples
function serializeQuotation(quotation: Quotation) {
  return {
    id: quotation.id,
    version: quotation.version,
    status: quotation.status,
    date: quotation.date.toISOString(),
    taxRate: quotation.taxRate,
    totalWithoutTaxes: quotation.totalWithoutTaxes,
    totalWithTaxes: quotation.totalWithTaxes,
    client: {
      id: quotation.client.id,
      firstname: quotation.client.firstname,
      lastname: quotation.client.lastname,
      activityName: quotation.client.activityName,
      address: quotation.client.address,
      phone: quotation.client.phone,
      email: quotation.client.email,
      legalStatus: quotation.client.legalStatus,
    },
    lines: quotation.lines.map(line => ({
      description: line.description,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      totalPrice: line.totalPrice,
    })),
    userId: quotation.userId,
  };
}

export default async function QuotationListPage() {
  let quotations: any[] = [];
  let error: string | null = null;

  try {
    const response = await getAllQuotations();
    if (response.success && response.data) {
      quotations = response.data.map((quotation: Quotation) => serializeQuotation(quotation));
    } else {
      error = response.message || "Erreur lors de la récupération des devis";
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Échec du chargement des devis";
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Liste des devis</h1>
          <Link
            href="/quotation"
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Créer un devis
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {quotations.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-lg mb-4">Aucun devis trouvé</p>
            <Link
              href="/quotation"
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Créer votre premier devis
            </Link>
          </div>
        ) : (
          <QuotationTable initialQuotations={quotations} />
        )}
      </main>
    </div>
  );
}

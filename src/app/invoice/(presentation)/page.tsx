import { getAcceptedQuotations } from "../actions/invoice-actions";
import Link from "next/link";
import { InvoiceTable } from "../components/InvoiceTable";

export default async function InvoicePage() {
  let quotations: any[] = [];
  let error: string | null = null;

  try {
    quotations = await getAcceptedQuotations();
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load quotations";
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6">Gestion des Factures</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {quotations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Aucune devis accepté pour le moment.
            </p>
            <Link
              href="/quotation"
              className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Créer un devis
            </Link>
          </div>
        ) : (
          <InvoiceTable initialQuotations={quotations} />
        )}
      </main>
    </div>
  );
}

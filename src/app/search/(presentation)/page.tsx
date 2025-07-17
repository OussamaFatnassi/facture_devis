"use client";

import { useState, useEffect } from "react";
import { searchByProduct } from "../actions/search-by-product";
import Link from "next/link";
import { Invoice, Quotation } from "@/generated/prisma";
import { ProductLine } from "../../product/domain/ProductLine";

// Traduction des statuts
function translateQuotationStatus(status: string) {
  switch (status) {
    case "draft":
      return "Brouillon";
    case "sent":
      return "Envoyé";
    case "accepted":
      return "Accepté";
    case "rejected":
      return "Refusé";
    default:
      return status;
  }
}
function translateInvoiceStatus(status: string) {
  switch (status) {
    case "draft":
      return "Brouillon";
    case "sent":
      return "Envoyée";
    case "paid":
      return "Payée";
    case "overdue":
      return "En retard";
    case "cancelled":
      return "Annulée";
    default:
      return status;
  }
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    quotations: Quotation[];
    invoices: Invoice[];
  }>({ quotations: [], invoices: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ quotations: [], invoices: [] });
      setIsLoading(false);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);

    const timeout = setTimeout(async () => {
      try {
        const res = await searchByProduct(query);
        setResults({
          quotations: res.quotations ?? [],
          invoices: res.invoices ?? [],
        });
      } catch (e: any) {
        setError(e.message || "Erreur");
        setResults({ quotations: [], invoices: [] });
      } finally {
        setIsLoading(false);
      }
    }, 1000); // <-- 1 seconde

    // Cleanup
    return () => clearTimeout(timeout);
  }, [query]);

  const handleSearch = async (value: string) => {
    setQuery(value);
    setError(null);
    setIsLoading(true);
    try {
      if (!value.trim()) {
        setResults({ quotations: [], invoices: [] });
        setIsLoading(false);
        return;
      }
      const res = await searchByProduct(value);
      setResults({
        quotations: res.quotations ?? [],
        invoices: res.invoices ?? [],
      });
    } catch (e: any) {
      setError(e.message || "Erreur");
      setResults({ quotations: [], invoices: [] });
    } finally {
      setIsLoading(false);
    }
  };

  // Fusion des résultats pour affichage en grille
  const mergedResults = [
    ...results.quotations.map((q) => ({ type: "quotation", ...q })),
    ...results.invoices.map((inv) => ({ type: "invoice", ...inv })),
  ];

  // Option : trier par date descendante (plus récent en premier)
  mergedResults.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">
        Recherche devis & factures par produit
      </h1>
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Rechercher par nom de produit…"
        className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-6 focus:ring-2 focus:ring-blue-500 outline-none"
      />

      {isLoading && (
        <div className="mb-8 text-center text-blue-600">Recherche…</div>
      )}
      {error && <div className="mb-8 text-center text-red-500">{error}</div>}

      <div className="mb-6 flex gap-6">
        <div>
          <span className="font-semibold text-blue-700">
            {results.quotations.length}
          </span>{" "}
          devis
        </div>
        <div>
          <span className="font-semibold text-green-700">
            {results.invoices.length}
          </span>{" "}
          facture{results.invoices.length > 1 ? "s" : ""}
        </div>
      </div>

      {mergedResults.length === 0 && !isLoading && (
        <div className="text-gray-400 text-center py-8">
          Aucun devis ou facture trouvé.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {mergedResults.map((item) =>
          item.type === "quotation" ? (
            <div
              key={"q_" + item.id}
              className="h-full flex flex-col bg-white rounded-2xl shadow-lg border hover:shadow-xl transition-shadow overflow-hidden"
            >
              <div className="bg-blue-50 px-4 py-2 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
                  />
                </svg>
                <span className="font-bold text-blue-700">Devis</span>
                <span className="ml-auto text-xs text-gray-400">
                  {translateQuotationStatus(item.status)}
                </span>
              </div>
              <div className="px-5 py-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2 text-gray-700">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.121 17.804A13.937 13.937 0 0112 15c2.485 0 4.847.605 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>
                    {item.client.firstname} {item.client.lastname}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2 text-gray-700">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10m-10 4h6"
                    />
                  </svg>
                  <span>
                    {item.date ? new Date(item.date).toLocaleDateString() : "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2 text-gray-700">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7h18M3 12h18M3 17h18"
                    />
                  </svg>
                  <span className="font-mono">{item.id}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 mb-4">
                  {item.lines
                    .filter((line: ProductLine) =>
                      line.productName
                        .toLowerCase()
                        .includes(query.toLowerCase())
                    )
                    .map((line: ProductLine) => (
                      <span
                        key={line.productId}
                        className="bg-blue-100 text-blue-700 text-xs rounded-full px-3 py-1 font-medium"
                      >
                        {line.productName}
                      </span>
                    ))}
                </div>
                <div className="text-xl font-semibold text-blue-700 mb-3">
                  {Array.isArray(item.lines) && typeof item.taxRate === "number"
                    ? (
                        item.lines.reduce(
                          (sum: number, line: ProductLine) =>
                            sum + (line.totalPrice ?? 0),
                          0
                        ) *
                        (1 + item.taxRate / 100)
                      ).toFixed(2) + " €"
                    : "–"}
                </div>
                <Link
                  href={`/quotation/${item.id}`}
                  className="inline-block mt-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                >
                  Voir le devis
                </Link>
              </div>
            </div>
          ) : (
            <div
              key={"i_" + item.id}
              className="h-full flex flex-col bg-white rounded-2xl shadow-lg border hover:shadow-xl transition-shadow overflow-hidden"
            >
              <div className="bg-green-50 px-4 py-2 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 14l2-2 4 4M7 10V6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2h-6a2 2 0 01-2-2v-4z"
                  />
                </svg>
                <span className="font-bold text-green-700">Facture</span>
                <span className="ml-auto text-xs text-gray-400">
                  {translateInvoiceStatus(item.status)}
                </span>
              </div>
              <div className="px-5 py-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2 text-gray-700">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.121 17.804A13.937 13.937 0 0112 15c2.485 0 4.847.605 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>
                    {item.client.firstname} {item.client.lastname}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2 text-gray-700">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10m-10 4h6"
                    />
                  </svg>
                  <span>
                    {item.date ? new Date(item.date).toLocaleDateString() : "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2 text-gray-700">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7h18M3 12h18M3 17h18"
                    />
                  </svg>
                  <span className="font-mono">
                    {item.invoiceNumber || item.id}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 mb-4">
                  {item.lines
                    .filter((line: any) =>
                      line.productName
                        .toLowerCase()
                        .includes(query.toLowerCase())
                    )
                    .map((line: any) => (
                      <span
                        key={line.productId}
                        className="bg-green-100 text-green-700 text-xs rounded-full px-3 py-1 font-medium"
                      >
                        {line.productName}
                      </span>
                    ))}
                </div>
                <div className="text-xl font-semibold text-green-700 mb-3">
                  {typeof item.totalIncludingTax === "number"
                    ? item.totalIncludingTax.toFixed(2) + " €"
                    : "–"}
                </div>
                <Link
                  href={`/invoice/${item.id}`}
                  className="inline-block mt-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
                >
                  Voir la facture
                </Link>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

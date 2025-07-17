"use client";

import { useState, useEffect } from "react";
import { updateQuotationStatus } from "../actions/quotation-actions";
import { QuotationStatus } from "../domain/Quotation";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface QuotationData {
  id: string;
  version: number;
  status: QuotationStatus;
  date: string;
  taxRate: number;
  totalWithoutTaxes: number;
  totalWithTaxes: number;
  client: {
    id: string;
    firstname: string;
    lastname: string;
    activityName: string;
    address: string;
    phone: string;
    email: string;
    legalStatus: string;
  };
  lines: Array<{
    productId: string;
    productName: string;
    productDescription: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  userId: string;
}

interface QuotationTableProps {
  initialQuotations: QuotationData[];
}

export function QuotationTable({ initialQuotations }: QuotationTableProps) {
  const [quotations, setQuotations] =
    useState<QuotationData[]>(initialQuotations);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const router = useRouter();

  const handleStatusChange = async (
    quotationId: string,
    newStatus: QuotationStatus
  ) => {
    try {
      setLoading((prev) => new Set(prev).add(quotationId));
      const formData = new FormData();
      formData.append("quotationId", quotationId);
      formData.append("status", newStatus);

      await updateQuotationStatus(formData);

      // Update local state
      setQuotations((prev) =>
        prev.map((q) =>
          q.id === quotationId ? { ...q, status: newStatus } : q
        )
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Échec de la mise à jour du statut"
      );
    } finally {
      setLoading((prev) => {
        const newSet = new Set(prev);
        newSet.delete(quotationId);
        return newSet;
      });
    }
  };

  return (
    <>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Devis
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total TTC
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quotations.map((quotation) => (
              <tr key={quotation.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    #{quotation.id.slice(-8)}
                  </div>
                  <div className="text-sm text-gray-500">
                    v{quotation.version}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {quotation.client.firstname} {quotation.client.lastname}
                  </div>
                  <div className="text-sm text-gray-500">
                    {quotation.client.activityName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(quotation.date).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {quotation.totalWithTaxes.toFixed(2)} €
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <QuotationStatusSelector
                    quotationId={quotation.id}
                    currentStatus={quotation.status}
                    onStatusChange={handleStatusChange}
                    disabled={loading.has(quotation.id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <a
                      href={`/quotation/api/${quotation.id}/download`}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition text-sm"
                    >
                      Télécharger PDF
                    </a>
                    <Link
                      href={`/quotation/${quotation.id}`}
                      className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition text-sm"
                    >
                      Voir
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function QuotationStatusSelector({
  quotationId,
  currentStatus,
  onStatusChange,
  disabled = false,
}: {
  quotationId: string;
  currentStatus: QuotationStatus;
  onStatusChange: (quotationId: string, status: QuotationStatus) => void;
  disabled?: boolean;
}) {
  const [status, setStatus] = useState<QuotationStatus>(currentStatus);

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as QuotationStatus;
    setStatus(newStatus);
    onStatusChange(quotationId, newStatus);
  };

  const getStatusColor = (status: QuotationStatus) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <select
      value={status}
      onChange={handleStatusChange}
      disabled={disabled}
      className={`text-xs font-medium px-2.5 py-0.5 rounded-full border-0 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${getStatusColor(
        status
      )}`}
    >
      <option value="draft">Brouillon</option>
      <option value="sent">Envoyé</option>
      <option value="accepted">Accepté</option>
      <option value="rejected">Rejeté</option>
    </select>
  );
}

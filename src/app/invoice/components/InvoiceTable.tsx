"use client";

import { useState, useEffect } from "react";
import {
  updateInvoiceStatus,
  createInvoiceAsDraft,
} from "../actions/invoice-actions";
import { InvoiceStatus } from "../domain/Invoice";
import { useRouter } from "next/navigation";

import { useTransition } from "react";
import { sendInvoiceMail } from "@/src/app/invoice/actions/send-invoice-by-email";

interface QuotationData {
  quotation: {
    id: string;
    version: number;
    lines: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
    status: string;
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
    date: string;
    taxRate: number;
    totalWithoutTaxes: number;
    totalWithTaxes: number;
  };
  hasInvoice: boolean;
  invoice?: {
    id: string;
    status: InvoiceStatus;
    invoiceNumber: string;
    date: string;
    dueDate: string;
    paidDate?: string;
  };
  invoiceId?: string;
}

interface InvoiceTableProps {
  initialQuotations: QuotationData[];
}

export function InvoiceTable({ initialQuotations }: InvoiceTableProps) {
  const [quotations, setQuotations] =
    useState<QuotationData[]>(initialQuotations);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const router = useRouter();

  // Automatically create invoices in draft status for quotations without invoices
  useEffect(() => {
    const createMissingInvoices = async () => {
      for (const item of quotations) {
        if (!item.hasInvoice && !loading.has(item.quotation.id)) {
          setLoading((prev) => new Set(prev).add(item.quotation.id));

          try {
            const result = await createInvoiceAsDraft(item.quotation.id);
            if (result.success && result.invoiceId) {
              setQuotations((prev) =>
                prev.map((q) =>
                  q.quotation.id === item.quotation.id
                    ? { ...q, hasInvoice: true, invoiceId: result.invoiceId }
                    : q
                )
              );
            }
          } catch (err) {
            console.error("Error creating invoice:", err);
          } finally {
            setLoading((prev) => {
              const newSet = new Set(prev);
              newSet.delete(item.quotation.id);
              return newSet;
            });
          }
        }
      }
    };

    createMissingInvoices();
  }, [quotations, loading]);

  const handleStatusChange = async (
    invoiceId: string,
    newStatus: InvoiceStatus
  ) => {
    try {
      setLoading((prev) => new Set(prev).add(invoiceId));
      const formData = new FormData();
      formData.append("invoiceId", invoiceId);
      formData.append("status", newStatus);

      await updateInvoiceStatus(formData);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update invoice status"
      );
    } finally {
      setLoading((prev) => {
        const newSet = new Set(prev);
        newSet.delete(invoiceId);
        return newSet;
      });
    }
  };

  const [isPending, startTransition] = useTransition();

  const handleSendMail = (invoiceId: string) => {
    startTransition(async () => {
      const response = await sendInvoiceMail(invoiceId);
      if (response.message === "Email sent.") {
        updateInvoiceStatusInState(invoiceId, "sent");
      }
    });
  };

  const updateInvoiceStatusInState = (
    invoiceId: string,
    newStatus: InvoiceStatus
  ) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.invoiceId === invoiceId) {
          return {
            ...q,
            invoice: q.invoice ? {
              ...q.invoice,
              status: newStatus,
            } : {
              id: invoiceId,
              status: newStatus,
              invoiceNumber: "",
              date: new Date().toISOString(),
              dueDate: new Date().toISOString(),
            },
          };
        }
        return q;
      })
    );
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
            {quotations.map((item) => (
              <tr key={item.quotation.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    #{item.quotation.id.slice(-8)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {item.quotation.client.firstname}{" "}
                    {item.quotation.client.lastname}
                  </div>
                  <div className="text-sm text-gray-500">
                    {item.quotation.client.activityName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(item.quotation.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.quotation.totalWithTaxes.toFixed(2)} €
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.hasInvoice && item.invoiceId ? (
                    <InvoiceStatusSelector
                      invoiceId={item.invoiceId}
                      currentStatus={item.invoice?.status || "draft"}
                      onStatusChange={handleStatusChange}
                      disabled={
                        loading.has(item.invoiceId) ||
                        loading.has(item.quotation.id)
                      }
                    />
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {loading.has(item.quotation.id) ? "Création..." : "Brouillon"}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    {item.hasInvoice && item.invoiceId && (
                      <button
                        onClick={() => router.push(`/invoice/${item.invoiceId}`)}
                        className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition text-sm"
                      >
                        Détails
                      </button>
                    )}
                    {item.hasInvoice && item.invoiceId ? (
                      <a
                        href={`/invoice/api/${item.invoiceId}/download`}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition text-sm"
                      >
                        Télécharger PDF
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">
                        {loading.has(item.quotation.id)
                          ? "Préparation..."
                          : "En attente"}
                      </span>
                    )}
                    {(item.invoiceId || item.invoice?.id) && (
                      <button
                        onClick={() => handleSendMail(item.invoiceId || item.invoice?.id as string)}
                        disabled={isPending}
                        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition text-sm"
                      >
                        {isPending ? "Envoi en cours..." : "Envoyer"}
                      </button>
                    )}
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

function InvoiceStatusSelector({
  invoiceId,
  currentStatus: initialStatus = "draft",
  onStatusChange,
  disabled = false,
}: {
  invoiceId: string;
  currentStatus?: InvoiceStatus;
  onStatusChange: (invoiceId: string, status: InvoiceStatus) => void;
  disabled?: boolean;
}) {
  const [currentStatus, setCurrentStatus] =
    useState<InvoiceStatus>(initialStatus);

  // Synchronize with initial status when it changes
  useEffect(() => {
    setCurrentStatus(initialStatus);
  }, [initialStatus]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as InvoiceStatus;
    setCurrentStatus(newStatus);
    onStatusChange(invoiceId, newStatus);
  };

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };



  const getStatusLabel = (status: InvoiceStatus) => {
    switch (status) {
      case "draft":
        return "Brouillon";
      case "sent":
        return "Envoyé";
      case "paid":
        return "Payé";
      case "overdue":
        return "En retard";
      case "cancelled":
        return "Annulé";
      default:
        return status;
    }
  };

  return (
    <select
      value={currentStatus}
      onChange={handleStatusChange}
      disabled={disabled}
      className={`text-xs font-medium px-2.5 py-0.5 rounded-full border-0 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${getStatusColor(
        currentStatus
      )}`}
    >
      <option value="draft">Brouillon</option>
      <option value="sent">Envoyé</option>
      <option value="paid">Payé</option>
      <option value="overdue">En retard</option>
      <option value="cancelled">Annulé</option>
    </select>
  );
}

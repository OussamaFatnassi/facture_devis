"use client";

import { Invoice } from '../domain/Invoice';
import { useRouter } from 'next/navigation';

interface InvoiceDetailsProps {
  invoice: Invoice;
}

export function InvoiceDetails({ invoice }: InvoiceDetailsProps) {
  const router = useRouter();

  const getStatusLabel = (status: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "sent":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header avec bouton retour */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-900">
                Facture #{invoice.invoiceNumber}
              </h1>
              <p className="text-gray-600 mt-1">
                Créée le {new Date(invoice.date).toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(invoice.status)}`}>
              {getStatusLabel(invoice.status)}
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="space-y-8">
          {/* Informations principales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Client Information */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                             <div className="bg-blue-50 border-b border-blue-100 px-6 py-4">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                     <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                     </svg>
                   </div>
                   <h2 className="text-xl font-semibold text-blue-900">
                     Informations Client
                   </h2>
                 </div>
               </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Nom complet</p>
                    <p className="font-semibold text-gray-900 text-lg">
                      {invoice.client.firstname} {invoice.client.lastname}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Entreprise</p>
                    <p className="font-semibold text-gray-900">
                      {invoice.client.activityName}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <p className="font-semibold text-gray-900 break-all">
                        {invoice.client.email}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Téléphone</p>
                      <p className="font-semibold text-gray-900">
                        {invoice.client.phone}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Adresse</p>
                    <p className="font-semibold text-gray-900">
                      {invoice.client.address}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Statut juridique</p>
                    <p className="font-semibold text-gray-900">
                      {invoice.client.legalStatus}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                             <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-4">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                     <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                   </div>
                   <h2 className="text-xl font-semibold text-indigo-900">
                     Détails de la facture
                   </h2>
                 </div>
               </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Numéro de facture</p>
                    <p className="font-semibold text-gray-900 text-lg">
                      {invoice.invoiceNumber}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Date d'émission</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(invoice.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Date d'échéance</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  {invoice.paidDate && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-600 mb-1">Date de paiement</p>
                      <p className="font-semibold text-green-900">
                        {new Date(invoice.paidDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Devis associé</p>
                      <p className="font-semibold text-gray-900">
                        #{invoice.quotationId.slice(-8)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Taux de TVA</p>
                      <p className="font-semibold text-gray-900">
                        {invoice.taxRate}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products/Services */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                         <div className="bg-purple-50 border-b border-purple-100 px-6 py-4">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                   <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                   </svg>
                 </div>
                 <h2 className="text-xl font-semibold text-purple-900">
                   Produits et Services
                 </h2>
               </div>
             </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                        Description
                      </th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                        Quantité
                      </th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                        Prix unitaire
                      </th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lines.map((line, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 text-gray-900">
                          <div className="font-medium">{line.productDescription}</div>
                        </td>
                        <td className="py-4 px-4 text-right text-gray-900 font-medium">
                          {line.quantity}
                        </td>
                        <td className="py-4 px-4 text-right text-gray-900 font-medium">
                          {line.unitPrice.toFixed(2)} €
                        </td>
                        <td className="py-4 px-4 text-right text-gray-900 font-semibold">
                          {line.totalPrice.toFixed(2)} €
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                         <div className="bg-green-50 border-b border-green-100 px-6 py-4">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                   <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                   </svg>
                 </div>
                 <h2 className="text-xl font-semibold text-green-900">
                   Récapitulatif
                 </h2>
               </div>
             </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-700 font-medium">Total HT</span>
                  <span className="text-xl font-semibold text-gray-900">
                    {invoice.totalExcludingTax.toFixed(2)} €
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-700 font-medium">TVA ({invoice.taxRate}%)</span>
                  <span className="text-xl font-semibold text-gray-900">
                    {invoice.taxAmount.toFixed(2)} €
                  </span>
                </div>
                <div className="flex justify-between items-center py-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg px-4 border-2 border-green-200">
                  <span className="text-xl font-bold text-green-800">Total TTC</span>
                  <span className="text-3xl font-bold text-green-800">
                    {invoice.totalIncludingTax.toFixed(2)} €
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
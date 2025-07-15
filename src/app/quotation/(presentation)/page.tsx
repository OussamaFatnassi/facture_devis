// src/app/quotation/page.tsx
"use client";

import { useState } from "react";
import { createQuotation } from "../actions/quotation-actions";
import { TextField } from "@radix-ui/themes";
import Link from "next/link";

export default function QuotationPage() {
  const [lines, setLines] = useState([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);

  const addLine = () =>
    setLines([...lines, { description: "", quantity: 1, unitPrice: 0 }]);

  const removeLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: string, value: unknown) => {
    const newLines = [...lines];
    
    // Handle numeric fields to prevent NaN
    if (field === 'quantity') {
      const numValue = typeof value === 'string' ? parseInt(value) : value as number;
      newLines[index] = { ...newLines[index], [field]: isNaN(numValue) ? 1 : numValue };
    } else if (field === 'unitPrice') {
      const numValue = typeof value === 'string' ? parseFloat(value) : value as number;
      newLines[index] = { ...newLines[index], [field]: isNaN(numValue) ? 0 : numValue };
    } else {
      newLines[index] = { ...newLines[index], [field]: value };
    }
    
    setLines(newLines);
  };

  const calculateLineTotal = (quantity: number, unitPrice: number) => {
    const qty = isNaN(quantity) ? 0 : quantity;
    const price = isNaN(unitPrice) ? 0 : unitPrice;
    return qty * price;
  };

  const calculateTotalHT = () => {
    return lines.reduce((sum, line) => sum + calculateLineTotal(line.quantity, line.unitPrice), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Créer un nouveau devis</h1>
                <p className="text-gray-600 mt-1">Remplissez les informations ci-dessous pour générer votre devis</p>
              </div>
            </div>
            <Link
              href="/quotation/list"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour à la liste
            </Link>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <form action={createQuotation} className="p-8 space-y-8">
            {/* Client & Tax Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Client ID
                </label>
                <div className="relative">
                  <TextField.Root 
                    name="clientId" 
                    required 
                    className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Identifiant du client"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Taux de TVA (%)
                </label>
                <div className="relative">
                  <TextField.Root
                    name="taxRate"
                    type="number"
                    defaultValue={20}
                    step="0.01"
                    className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="20.00"
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Lignes du devis</h3>
                  <p className="text-sm text-gray-600">Ajoutez les produits ou services de votre devis</p>
                </div>
              </div>

              {/* Lines */}
              <div className="space-y-4">
                {lines.map((line, idx) => (
                  <div
                    key={idx}
                    className="group relative bg-gray-50 hover:bg-gray-100 transition-all duration-200 rounded-xl p-6 border border-gray-200 hover:border-gray-300"
                  >
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-full">
                        #{idx + 1}
                      </span>
                      {lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all"
                          title="Supprimer cette ligne"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <TextField.Root
                          name="description"
                          placeholder="Description du service/produit"
                          value={line.description}
                          onChange={(e) =>
                            updateLine(idx, "description", e.target.value)
                          }
                          className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantité
                        </label>
                        <TextField.Root
                          name="quantity"
                          type="number"
                          placeholder="Qté"
                          value={line.quantity.toString()}
                          onChange={(e) =>
                            updateLine(idx, "quantity", e.target.value)
                          }
                          className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prix unitaire
                        </label>
                        <TextField.Root
                          name="unitPrice"
                          type="number"
                          placeholder="Prix HT"
                          value={line.unitPrice.toString()}
                          onChange={(e) =>
                            updateLine(idx, "unitPrice", e.target.value)
                          }
                          className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          step="0.01"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total
                        </label>
                        <div className="flex items-center justify-center h-12 bg-white border border-gray-300 rounded-lg">
                          <span className="text-lg font-semibold text-gray-900">
                            {calculateLineTotal(line.quantity, line.unitPrice).toFixed(2)} €
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addLine}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 group"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Ajouter une ligne
                </button>
              </div>
            </div>

            {/* Total Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Récapitulatif</h4>
                    <p className="text-sm text-gray-600">Total de votre devis</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    Total HT: <span className="font-semibold">{calculateTotalHT().toFixed(2)} €</span>
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    Total TTC: <span className="text-blue-600">{(calculateTotalHT() * 1.2).toFixed(2)} €</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Créer le devis
              </button>
              <Link
                href="/quotation/list"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Annuler
              </Link>
              
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

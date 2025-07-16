"use client";

import { useState, useEffect } from "react";
import {
  createQuotation,
  getAllClients,
  createClient,
} from "../actions/quotation-actions";
import { TextField } from "@radix-ui/themes";
import Link from "next/link";
import { ClientInfo } from "../domain/Quotation";

export default function QuotationPage() {
  const [lines, setLines] = useState([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [isCreatingClient, setIsCreatingClient] = useState(false);

  // Load clients on component mount
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await getAllClients();
      if (response.success && response.data) {
        setClients(response.data);
      }
    } catch (error) {
      console.error("Error loading clients:", error);
    }
  };

  const handleCreateClient = async (formData: FormData) => {
    setIsCreatingClient(true);
    try {
      const response = await createClient(formData);
      if (response.success && response.data) {
        await loadClients(); // Reload clients
        setSelectedClientId(response.data.id); // Select the new client
        setShowNewClientForm(false); // Hide form
      }
    } catch (error) {
      console.error("Error creating client:", error);
    } finally {
      setIsCreatingClient(false);
    }
  };

  const addLine = () =>
    setLines([...lines, { description: "", quantity: 1, unitPrice: 0 }]);

  const removeLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: string, value: unknown) => {
    const newLines = [...lines];

    // Handle numeric fields to prevent NaN
    if (field === "quantity") {
      const numValue =
        typeof value === "string" ? parseInt(value) : (value as number);
      newLines[index] = {
        ...newLines[index],
        [field]: isNaN(numValue) ? 1 : numValue,
      };
    } else if (field === "unitPrice") {
      const numValue =
        typeof value === "string" ? parseFloat(value) : (value as number);
      newLines[index] = {
        ...newLines[index],
        [field]: isNaN(numValue) ? 0 : numValue,
      };
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
    return lines.reduce(
      (sum, line) => sum + calculateLineTotal(line.quantity, line.unitPrice),
      0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClientId && !showNewClientForm) {
      alert("Veuillez sélectionner un client ou créer un nouveau client");
      return;
    }

    const formData = new FormData(e.target as HTMLFormElement);

    // Add client selection info
    if (selectedClientId) {
      formData.append("clientId", selectedClientId);
      formData.append("newClient", "false");
    } else {
      formData.append("newClient", "true");
    }

    // Add lines data
    formData.append("quotationLines", JSON.stringify(lines));

    try {
      const response = await createQuotation(formData);
      if (response.success) {
        alert("Devis créé avec succès !");
        window.location.href = "/quotation/list";
      } else {
        alert("Erreur lors de la création du devis");
      }
    } catch (error) {
      console.error("Error creating quotation:", error);
      alert("Erreur lors de la création du devis");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Créer un nouveau devis
                </h1>
                <p className="text-gray-600 mt-1">
                  Remplissez les informations ci-dessous pour générer votre
                  devis
                </p>
              </div>
            </div>
            <Link
              href="/quotation/list"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Retour à la liste
            </Link>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Client Selection Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div className="p-2 bg-green-100 rounded-lg">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Informations client
                  </h3>
                  <p className="text-sm text-gray-600">
                    Sélectionnez un client existant ou créez un nouveau client
                  </p>
                </div>
              </div>

              {/* Client Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Client existant
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => {
                      setSelectedClientId(e.target.value);
                      if (e.target.value) {
                        setShowNewClientForm(false);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.firstname} {client.lastname} -{" "}
                        {client.activityName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewClientForm(!showNewClientForm);
                      if (!showNewClientForm) {
                        setSelectedClientId("");
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    {showNewClientForm ? "Annuler" : "Nouveau client"}
                  </button>
                </div>
              </div>

              {/* New Client Form */}
              {showNewClientForm && (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Créer un nouveau client
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom *
                      </label>
                      <TextField.Root
                        name="firstname"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Prénom du client"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom *
                      </label>
                      <TextField.Root
                        name="lastname"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nom du client"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom d'activité *
                      </label>
                      <TextField.Root
                        name="activityName"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nom de l'entreprise"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Statut légal *
                      </label>
                      <select
                        name="legalStatus"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Sélectionner un statut</option>
                        <option value="SARL">SARL</option>
                        <option value="SAS">SAS</option>
                        <option value="SA">SA</option>
                        <option value="EURL">EURL</option>
                        <option value="SNC">SNC</option>
                        <option value="Auto-entrepreneur">
                          Auto-entrepreneur
                        </option>
                        <option value="Particulier">Particulier</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse *
                      </label>
                      <TextField.Root
                        name="address"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Adresse complète"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone *
                      </label>
                      <TextField.Root
                        name="phone"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Numéro de téléphone"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <TextField.Root
                        name="email"
                        type="email"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Email du client"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tax Rate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Taux de TVA (%)
                </label>
                <TextField.Root
                  name="taxRate"
                  type="number"
                  defaultValue={20}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="20.00"
                />
              </div>
            </div>

            {/* Quotation Lines */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Lignes du devis
                  </h3>
                  <p className="text-sm text-gray-600">
                    Ajoutez les produits ou services de votre devis
                  </p>
                </div>
              </div>

              {/* Lines */}
              <div className="space-y-4">
                {lines.map((line, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-700">
                        Ligne #{idx + 1}
                      </span>
                      {lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <TextField.Root
                          name="description"
                          placeholder="Description du service/produit"
                          value={line.description}
                          onChange={(e) =>
                            updateLine(idx, "description", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          step="0.01"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total
                        </label>
                        <div className="flex items-center justify-center h-10 bg-white border border-gray-300 rounded-lg">
                          <span className="text-sm font-semibold text-gray-900">
                            {calculateLineTotal(
                              line.quantity,
                              line.unitPrice
                            ).toFixed(2)}{" "}
                            €
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addLine}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Ajouter une ligne
                </button>
              </div>
            </div>

            {/* Total Summary */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Récapitulatif
                  </h4>
                  <p className="text-sm text-gray-600">Total de votre devis</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    Total HT:{" "}
                    <span className="font-semibold">
                      {calculateTotalHT().toFixed(2)} €
                    </span>
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    Total TTC:{" "}
                    <span className="text-blue-600">
                      {(calculateTotalHT() * 1.2).toFixed(2)} €
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <Link
                href="/quotation/list"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Annuler
              </Link>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Créer le devis
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

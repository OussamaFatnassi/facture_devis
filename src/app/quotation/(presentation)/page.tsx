"use client";

import { useState, useEffect } from "react";
import { createQuotation, getAllClients } from "../actions/quotation-actions";
import { TextField } from "@radix-ui/themes";
import Link from "next/link";
import { ClientInfo } from "../domain/Quotation";
import { getAllProducts } from "../../product/actions/product-actions";
import {
  NotificationPopup,
  NotificationType,
} from "../components/NotificationPopup";
import { Product } from "@/generated/prisma";

export default function QuotationPage() {
  const [lines, setLines] = useState([
    {
      productId: "",
      productName: "",
      productDescription: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    },
  ]);
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [showNewClientForm, setShowNewClientForm] = useState(false);

  // États pour la notification
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
    isVisible: boolean;
  }>({
    message: "",
    type: "info",
    isVisible: false,
  });

  // Fonction pour afficher les notifications
  const showNotification = (message: string, type: NotificationType) => {
    setNotification({
      message,
      type,
      isVisible: true,
    });
  };

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  // Load clients on component mount
  useEffect(() => {
    loadClients();
    loadProducts();
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

  const loadProducts = async () => {
    try {
      const response = await getAllProducts();
      if (response.success) {
        setProducts(response.products);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const addLine = () =>
    setLines([
      ...lines,
      {
        productId: "",
        productName: "",
        productDescription: "",
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
      },
    ]);

  const removeLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: string, value: unknown) => {
    const newLines = [...lines];
    if (field === "productId") {
      const product = products.find((p) => p.id === value);
      if (product) {
        newLines[index] = {
          productId: product.id,
          productName: product.name,
          productDescription: product.description,
          quantity: 1,
          unitPrice: product.price,
          totalPrice: product.price * 1,
        };
      }
    } else if (field === "quantity") {
      const qty =
        typeof value === "string" ? parseInt(value) : (value as number);
      const quantity = isNaN(qty) ? 1 : qty;
      newLines[index].quantity = quantity;
      newLines[index].totalPrice = newLines[index].unitPrice * quantity;
    }
    setLines(newLines);
  };

  const calculateTotalHT = () => {
    return lines.reduce((sum, line) => sum + line.totalPrice, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClientId && !showNewClientForm) {
      showNotification(
        "Veuillez sélectionner un client ou créer un nouveau client",
        "warning"
      );
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
        showNotification("Devis créé avec succès !", "success");
        // Ne pas rediriger immédiatement pour laisser le temps de voir le popup
        // La redirection se fera via les boutons du popup
      } else {
        showNotification("Erreur lors de la création du devis", "error");
      }
    } catch (error) {
      console.error("Error creating quotation:", error);
      showNotification("Erreur lors de la création du devis", "error");
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
                        Nom d&apos;activité *
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
                    Ajoutez les produits à votre devis
                  </p>
                </div>
              </div>
              {lines.map((line, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 hover:shadow-md transition-shadow duration-200"
                >
                  {/* Header avec numéro de ligne et bouton suppression */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {idx + 1}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          Ligne produit #{idx + 1}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Configurez les détails de votre produit
                        </p>
                      </div>
                    </div>
                    {lines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLine(idx)}
                        className="group p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
                      >
                        <svg
                          className="w-5 h-5 text-red-500 group-hover:text-red-600"
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

                  {/* Première ligne - Produit, Quantité, Total */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
                    {/* Produit */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-emerald-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                          </svg>
                        </div>
                        Produit
                      </label>
                      <select
                        name="productId"
                        value={line.productId}
                        onChange={(e) =>
                          updateLine(idx, "productId", e.target.value)
                        }
                        className="w-full h-12 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 bg-white shadow-sm"
                        required
                      >
                        <option value="">Sélectionner un produit</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} - {product.price.toFixed(2)} €
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantité */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-orange-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                            />
                          </svg>
                        </div>
                        Quantité
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={1}
                          value={line.quantity}
                          onChange={(e) =>
                            updateLine(idx, "quantity", e.target.value)
                          }
                          className="w-full h-12 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 bg-white shadow-sm text-center font-medium"
                          required
                        />
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              updateLine(
                                idx,
                                "quantity",
                                Math.max(1, (line.quantity || 1) + 1)
                              )
                            }
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateLine(
                                idx,
                                "quantity",
                                Math.max(1, (line.quantity || 1) - 1)
                              )
                            }
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            />
                          </svg>
                        </div>
                        Total
                      </label>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl h-12 flex items-center justify-center shadow-sm">
                        <span className="text-lg font-bold text-green-700">
                          {line.totalPrice.toFixed(2)}
                        </span>
                        <span className="text-green-600 font-medium ml-1">
                          €
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Deuxième ligne - Description (toute la largeur) */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                          />
                        </svg>
                      </div>
                      Description
                    </label>
                    <div className="bg-white px-4 py-3 rounded-xl border border-gray-300 h-12 flex items-center shadow-sm">
                      <span className="text-gray-700 text-sm">
                        {line.productDescription ||
                          "Sélectionnez un produit pour voir la description"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addLine}
                className="group w-full flex items-center justify-center gap-3 py-4 px-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                  <svg
                    className="w-5 h-5 text-white"
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
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Ajouter une ligne produit
                  </div>
                  <div className="text-sm text-gray-500 group-hover:text-blue-500 transition-colors">
                    Cliquez pour ajouter un nouveau produit à votre devis
                  </div>
                </div>
              </button>
            </div>

            {/* Total Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">
                      Récapitulatif du devis
                    </h4>
                    <p className="text-sm text-gray-600">
                      Montant total de votre devis
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Total</p>
                    <p className="text-lg font-bold text-gray-900">
                      {calculateTotalHT().toFixed(2)} €
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-3 shadow-sm border border-blue-200">
                    <p className="text-sm text-blue-600 mb-1">Total TTC</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {(calculateTotalHT() * 1.2).toFixed(2)} €
                    </p>
                  </div>
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

      {/* Popup de notification */}
      <NotificationPopup
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </div>
  );
}

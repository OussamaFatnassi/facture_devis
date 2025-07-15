// src/app/quotation/page.tsx
"use client";

import { useState } from "react";
import { createQuotation } from "../actions/quotation-actions";
import { Button, TextField } from "@radix-ui/themes";
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
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-gray-900 text-white px-6 py-4 shadow-md flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold">
          Facture & Devis
        </Link>
        <Link
          href="/quotation/list"
          className="text-sm bg-white text-gray-900 px-4 py-2 rounded hover:bg-gray-100 transition"
        >
          Devis
        </Link>
      </nav>

      {/* Formulaire principal */}
      <main className="flex-1 p-6 space-y-6 max-w-3xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-gray-800">
          Créer un nouveau devis
        </h1>

        <form action={createQuotation} className="space-y-6">
          <div className="space-y-2">
            <label className="block font-medium">Client ID</label>
            <TextField.Root name="clientId" required className="w-full" />
          </div>

          <div className="space-y-2">
            <label className="block font-medium">Tax rate (%)</label>
            <TextField.Root
              name="taxRate"
              type="number"
              defaultValue={20}
              step="0.01"
              className="w-full"
            />
          </div>

          <div className="space-y-4">
            {lines.map((line, idx) => (
              <div
                key={idx}
                className="flex flex-col md:flex-row gap-2 items-center"
              >
                <TextField.Root
                  name="description"
                  placeholder="Description"
                  value={line.description}
                  onChange={(e) =>
                    updateLine(idx, "description", e.target.value)
                  }
                  className="flex-1"
                  required
                />
                <TextField.Root
                  name="quantity"
                  type="number"
                  placeholder="Qty"
                  value={line.quantity}
                  onChange={(e) =>
                    updateLine(idx, "quantity", parseInt(e.target.value))
                  }
                  className="w-24"
                  required
                />
                <TextField.Root
                  name="unitPrice"
                  type="number"
                  placeholder="Unit Price"
                  value={line.unitPrice}
                  onChange={(e) =>
                    updateLine(idx, "unitPrice", parseFloat(e.target.value))
                  }
                  className="w-32"
                  required
                />
                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(idx)}
                    className="text-red-500 text-xs hover:underline"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              onClick={addLine}
              className="text-sm text-blue-600"
            >
              + Ajouter une ligne
            </Button>
          </div>

          <Button type="submit" className="w-full">
            Créer le devis
          </Button>
        </form>
      </main>
    </div>
  );
}

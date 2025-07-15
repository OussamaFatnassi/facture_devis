import { PrismaQuotationRepository } from "@/src/app/quotation/infrastructure/repositories/quotation-repository";
// import { GetAllQuotations } from "@/src/app/quotation/application/use-cases/get-all-quotations";
import { GetQuotationByUser } from "../../application/use-cases/get-quotations-by-user";

import Link from "next/link";
import { QuotationLine } from "../../domain/Quotation";
import { CurrentUserServiceImpl } from "@/src/app/user-auth/infrastructure/services/current-user-service";

export default async function QuotationListPage() {
  const repo = new PrismaQuotationRepository();
  const userService = new CurrentUserServiceImpl();
  const useCase = new GetQuotationByUser(repo);
  const userResponse = await userService.getCurrentUser();
  const quotations = await useCase.execute(userResponse.user?.id);

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

      {/* Liste des devis */}
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6">Liste des devis</h1>

        <table className="w-full border text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">#</th>
              <th className="p-2 border">Client</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Statut</th>
              <th className="p-2 border">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((q, i) => (
              <tr key={q.id} className="hover:bg-gray-50">
                <td className="p-2 border">{i + 1}</td>
                <td className="p-2 border">
                  <Link
                    href={`/quotation/${q.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {q.client.firstname} {q.client.lastname}
                  </Link>
                </td>
                <td className="p-2 border">
                  {new Date(q.date).toLocaleDateString()}
                </td>
                <td className="p-2 border">{q.status}</td>
                <td className="p-2 border">
                  {Array.isArray(q.lines)
                    ? q.lines
                        .reduce(
                          (sum: number, line: QuotationLine) =>
                            sum + line.totalPrice,
                          0
                        )
                        .toFixed(2) + " €"
                    : "N/A"}

                  {/* Ajout du bouton PDF */}
                  <div className="mt-2">
                    <Link
                      href={`/api/quotations/${q.id}/download`}
                      target="_blank"
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Télécharger PDF
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      <Link
        href="/quotation"
        className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-blue-700 transition"
      >
        <span className="text-lg">+</span>
        <span className="hidden sm:inline text-sm font-medium">
          Nouveau devis
        </span>
      </Link>
    </div>
  );
}

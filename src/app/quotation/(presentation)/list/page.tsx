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
              <th className="p-2 border">Action</th>
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
                </td>
                <td className="p-2 border">
                  {" "}
                  {/* Ajout du bouton PDF */}
                  <div className="mt-2">
                    <Link
                      href={`/api/quotations/${q.id}/download`}
                      target="_blank"
                      className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition font-medium text-xs gap-2"
                      title="Télécharger ce devis en PDF"
                    >
                      {/* Icône de téléchargement (SVG inline, accessible) */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                        />
                      </svg>
                      <span className="sr-only sm:not-sr-only">PDF</span>
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

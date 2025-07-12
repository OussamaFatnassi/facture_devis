// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar simple */}
      <nav className="bg-gray-900 text-white px-6 py-4 shadow-md flex items-center justify-between">
        <h1 className="text-lg font-semibold">Facture & Devis</h1>
        <Link
          href="/quotation"
          className="text-sm bg-white text-gray-900 px-4 py-2 rounded hover:bg-gray-100 transition"
        >
          Créer un devis
        </Link>
      </nav>

      {/* Contenu principal */}
      <main className="flex-1 flex items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-700">
          Bienvenue sur votre application de gestion de devis
        </h2>
      </main>

      {/* Footer minimal (optionnel) */}
      <footer className="bg-gray-100 text-center py-4 text-sm text-gray-500">
        © {new Date().getFullYear()} - Application ESGI
      </footer>
    </div>
  );
}

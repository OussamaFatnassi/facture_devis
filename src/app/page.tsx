// app/page.tsx

import Link from "next/link";
import { getCurrentUser } from "./user-auth/actions/login-actions";

export default async function Home() {
  const userResponse = await getCurrentUser();
  const user = userResponse.user;

  return (
    <div className="min-h-screen flex flex-col">

      {/* Contenu principal */}
      <main className="flex-1 flex items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-700">
          Bienvenue sur votre application de gestion de devis
        </h2>
        {user?.firstName} {user?.id}
      </main>

      {/* Footer minimal (optionnel) */}
      <footer className="bg-gray-100 text-center py-4 text-sm text-gray-500">
        © {new Date().getFullYear()} - Application ESGI
      </footer>
    </div>
  );
}

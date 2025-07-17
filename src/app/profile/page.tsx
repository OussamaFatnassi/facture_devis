"use client";

import { useAuth } from "../user-auth/infrastructure/services/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/user-auth/login");
    }
  }, [isAuthenticated, router]);

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-md border border-gray-200 p-8">

        {/* User avatar & name */}
        <div className="flex items-center space-x-5 mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
            {(user.fullName || user.email)?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xl font-medium text-gray-800">{user.fullName || user.email}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 capitalize">
              {user.role}
            </span>
          </div>
        </div>

        {/* User info section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-gray-700">
          <div className="flex flex-col space-y-1">
            <span className="text-gray-500">Nom complet</span>
            <span className="font-medium">{user.fullName || "—"}</span>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-gray-500">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-gray-500">Rôle</span>
            <span className="font-medium capitalize">{user.role}</span>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-gray-500">Statut</span>
            <span className="text-green-600 font-semibold">Actif</span>
          </div>
        </div>
      </div>
    </main>
  );
}

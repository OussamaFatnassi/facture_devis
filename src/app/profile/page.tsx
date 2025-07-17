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
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-sm rounded-2xl border border-gray-200 p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Mon profil</h1>

        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-xl font-medium text-white">
              {(user.fullName || user.email)?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-800">{user.fullName || user.email}</p>
            <p className="text-sm text-gray-500">{user.role}</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-gray-700">
          <div className="flex justify-between">
            <span className="text-gray-500">Nom complet</span>
            <span className="font-medium">{user.fullName || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Adresse e-mail</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Rôle</span>
            <span className="font-medium capitalize">{user.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

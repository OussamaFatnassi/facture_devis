"use server";

import { logoutUser } from "./login-actions";
import { redirect } from "next/navigation";

export async function handleLogout() {
  try {
    await logoutUser();
    redirect("/user-auth/login");
  } catch (error) {
    console.error("Logout failed:", error);
    redirect("/user-auth/login");
  }
} 
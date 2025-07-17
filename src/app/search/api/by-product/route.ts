import { NextRequest, NextResponse } from "next/server";
import { byProductController } from "@/src/app/search/infrastructure/controllers/by-product-controller";
import { getCurrentUser } from "@/src/app/user-auth/actions/login-actions";

export async function GET(req: NextRequest) {
  try {
    // Récupérer l'utilisateur connecté
    const userResponse = await getCurrentUser();
    if (!userResponse.success || !userResponse.user) {
      return NextResponse.json({ 
        success: false, 
        message: "Utilisateur non authentifié" 
      }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productName = searchParams.get("product") || "";

    const result = await byProductController(productName, userResponse.user.id);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Erreur lors de la recherche:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Erreur lors de la recherche" 
    }, { status: 500 });
  }
}

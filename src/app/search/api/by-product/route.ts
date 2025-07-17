import { NextRequest, NextResponse } from "next/server";
import { byProductController } from "@/src/app/search/infrastructure/controllers/by-product-controller";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productName = searchParams.get("product") || "";

  const result = await byProductController(productName);

  return NextResponse.json({ success: true, ...result });
}

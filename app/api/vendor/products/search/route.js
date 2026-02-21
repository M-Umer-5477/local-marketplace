// /api/vendor/products/search/route.js
import { NextResponse } from "next/server";
import db from "@/lib/db";
import Product from "@/models/product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
export async function GET(req) {
  try {
    await db.connect();
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "seller") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const shopId = searchParams.get("shopId");

    console.log("🔎 Incoming search:", { q, shopId });

    // ✅ Validate inputs
    if (!q || !shopId) {
      console.log("❌ Missing q or shopId");
      return NextResponse.json({ error: "Missing query or shopId" }, { status: 400 });
    }

    // ✅ Build regex safely
    const nameRegex = new RegExp(q, "i");
    const barcodeRegex = new RegExp(`^${q}$`, "i");

    // ✅ Try searching
    const products = await Product.find({
      shopId,
      $or: [{ name: nameRegex }, { barcode: barcodeRegex }],
    }).limit(10);

    console.log("✅ Products found:", products.length);

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("❌ Search API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

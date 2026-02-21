import { NextResponse } from "next/server";
import Product from "@/models/product";
import db from "@/lib/db";
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
    const name = searchParams.get("name");
    const shopId = searchParams.get("shopId");

    // ✅ Always return valid JSON, even if params are missing
    if (!name || !shopId) {
      return NextResponse.json({ products: [] }, { status: 200 });
    }

    const regex = new RegExp(`^${name}`, "i");
    const products = await Product.find({
      shopId,
      name: { $regex: regex },
    })
      .limit(10)
      .select("_id name price barcode");

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("Suggestions API error:", error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}

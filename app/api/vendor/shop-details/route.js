import { NextResponse } from "next/server";
import db from "@/lib/db";
import Seller from "@/models/seller";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    await db.connect();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const seller = await Seller.findOne({ email: session.user.email });

    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      shop: {
        shopName: seller.shopName || "Shop",
        phone: seller.phone || "",
        shopAddress: seller.shopAddress || "",
        fullName: seller.fullName || "",
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Shop Details Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import db from "@/lib/db";
import Seller from "@/models/seller";

export async function GET(req) {
  try {
    await db.connect();
    // Fetch only active sellers, sort by newest
    const sellers = await Seller.find({ isActive: true, role: "seller" })
      .select("shopName fullName phone shopLogo walletBalance isShopOpen")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, sellers }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
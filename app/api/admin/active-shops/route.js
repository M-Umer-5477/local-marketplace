import { NextResponse } from "next/server";
import db from "@/lib/db";
import Seller from "@/models/seller";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
export async function GET(req) {
  try {
    await db.connect();
     const session = await getServerSession(authOptions);
    
        if (!session || session.user.role !== "admin") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    // Fetch all approved sellers (Active AND Suspended), sort by newest
    const allSellers = await Seller.find({ verificationStatus: "Approved", role: "seller" })
      .select("shopName fullName phone shopLogo walletBalance isShopOpen isActive")
      .sort({ createdAt: -1 });

    const activeShops = allSellers.filter(s => s.isActive === true);
    const suspendedShops = allSellers.filter(s => s.isActive === false);

    return NextResponse.json({ success: true, activeShops, suspendedShops }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
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
    // 1. Fetch Debtors (Negative Wallet)
    const debtors = await Seller.find({ 
        role: "seller", 
        walletBalance: { $lt: 0 } // Less than 0
    }).sort({ walletBalance: 1 }); // Ascending (Most negative first)

    // 2. Calculate Total Debt (How much money is stuck in market)
    const totalDebt = debtors.reduce((acc, curr) => acc + curr.walletBalance, 0);

    return NextResponse.json({ success: true, debtors, totalMarketDebt: Math.abs(totalDebt) }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
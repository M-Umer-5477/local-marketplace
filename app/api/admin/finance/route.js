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
    
    // 1. RECEIVABLES: Sellers who owe us money (Negative Wallet = they collected COD)
    const debtors = await Seller.find({ 
        role: "seller", 
        walletBalance: { $lt: 0 }
    }).sort({ walletBalance: 1 }).select('shopName phone walletBalance email');

    const receivableAmount = debtors.reduce((acc, curr) => acc + Math.abs(curr.walletBalance), 0);

    // 2. PAYABLES: Sellers we owe money to (Positive Wallet = we owe from Stripe/Online)
    const creditors = await Seller.find({ 
        role: "seller", 
        walletBalance: { $gt: 0 }
    }).sort({ walletBalance: -1 }).select('shopName phone walletBalance email');

    const payableAmount = creditors.reduce((acc, curr) => acc + curr.walletBalance, 0);

    // 3. Summary
    const netPosition = payableAmount - receivableAmount; // Positive = we owe more, Negative = sellers owe more

    return NextResponse.json({ 
      success: true, 
      receivables: {
        debtors,
        totalAmount: receivableAmount,
        count: debtors.length
      },
      payables: {
        creditors,
        totalAmount: payableAmount,
        count: creditors.length
      },
      summary: {
        totalReceivable: receivableAmount,
        totalPayable: payableAmount,
        netPosition: netPosition,
        netPositionLabel: netPosition > 0 ? "Platform owes sellers" : "Sellers owe platform"
      }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
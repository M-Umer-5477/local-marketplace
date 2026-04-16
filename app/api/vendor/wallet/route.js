import { NextResponse } from "next/server";
import db from "@/lib/db";
import Seller from "@/models/seller";
import Transaction from "@/models/transaction"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    await db.connect();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch Seller (Just for Balance & Settings)
    const seller = await Seller.findOne({ email: session.user.email })
      .select("walletBalance commissionRate savedPayoutDetails"); // We don't need 'transactions' array anymore

    if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });

    // 2. Fetch ALL Transactions from the Collection
    const allTransactions = await Transaction.find({ seller: seller._id })
      .sort({ createdAt: -1 }); // Newest first

    // 3. Split them into categories
    const history = [];  // For "Recent Activity" (Automatic stuff)
    const requests = []; // For "Requests" (Manual Deposit/Withdraw)

    allTransactions.forEach((txn) => {
        // Commission & Earnings go to History
        if (["Commission_Deduction", "Order_Earning"].includes(txn.category)) {
            history.push(txn);
        } 
        // Deposits & Withdrawals go to Requests
        else {
            requests.push(txn);
        }
    });

    return NextResponse.json({ 
      success: true, 
      wallet: {
        balance: seller.walletBalance,
        commissionRate: seller.commissionRate,
        savedPayoutDetails: seller.savedPayoutDetails,
        history: history, 
        requests: requests 
      }
    });

  } catch (error) {
    console.error("Wallet Fetch Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
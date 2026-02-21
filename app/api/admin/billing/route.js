
import { NextResponse } from "next/server";
import db from "@/lib/db";
import Transaction from "@/models/transaction";
import Seller from "@/models/seller";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// 1. FETCH ALL PENDING REQUESTS
export async function GET(req) {
  try {
    await db.connect();
    const session = await getServerSession(authOptions);
    
        if (!session || session.user.role !== "admin") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    // Fetch transactions where status is 'Pending'
    const requests = await Transaction.find({ status: "Pending" })
      .populate("seller", "shopName shopLogo phone")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// 2. APPROVE / REJECT REQUEST
export async function PUT(req) {
  try {
    await db.connect();
    const { transactionId, action } = await req.json(); // action = "Approve" or "Reject"

    const txn = await Transaction.findById(transactionId);
    if (!txn) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

    if (txn.status !== "Pending") {
      return NextResponse.json({ error: "Already processed" }, { status: 400 });
    }

    // --- 🧠 SMART WALLET LOGIC ---
    let walletChange = 0;

    if (action === "Approve") {
        txn.status = "Approved";

        if (txn.category === "Dues_Clearing") {
            // ✅ DEPOSIT: Seller paid us, so we INCREASE their balance (e.g. -500 + 500 = 0)
            walletChange = txn.amount;
        } 
        else if (txn.category === "Payout_Withdrawal") {
            // ✅ WITHDRAWAL: Money was ALREADY deducted when they requested.
            // So we do NOTHING to the wallet here. We just confirm the transaction.
            walletChange = 0; 
        }

    } else {
        txn.status = "Rejected";

        if (txn.category === "Dues_Clearing") {
             // DEPOSIT REJECT: They said they paid, but didn't. No change.
             walletChange = 0;
        }
        else if (txn.category === "Payout_Withdrawal") {
             // ✅ WITHDRAWAL REJECT: We must REFUND the frozen money.
             walletChange = txn.amount; 
        }
    }

    // Apply Wallet Change (if any)
    if (walletChange !== 0) {
        await Seller.findByIdAndUpdate(txn.seller, {
            $inc: { walletBalance: walletChange }
        });
    }

    await txn.save();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Update Failed" }, { status: 500 });
  }
}
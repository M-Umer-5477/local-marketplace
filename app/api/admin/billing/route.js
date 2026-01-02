import { NextResponse } from "next/server";
import db from "@/lib/db";
import Transaction from "@/models/transaction";
import Seller from "@/models/seller";

// 1. FETCH ALL PENDING REQUESTS
export async function GET(req) {
  try {
    await db.connect();
    
    // Fetch transactions where status is 'Pending'
    // Populate 'seller' so we can show the Shop Name
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

    // --- APPROVAL LOGIC ---
    if (action === "Approve") {
        // 1. Update Seller Wallet
        // If Type is "Credit" (Deposit), we ADD to wallet (e.g. -66 + 66 = 0)
        // If Type is "Debit" (Withdrawal), we SUBTRACT (e.g. 500 - 500 = 0)
        
        const amountChange = txn.type === "Credit" ? txn.amount : -txn.amount;
        
        await Seller.findByIdAndUpdate(txn.seller, {
            $inc: { walletBalance: amountChange }
        });

        txn.status = "Approved";
    } else {
        txn.status = "Rejected";
    }

    await txn.save();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Update Failed" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import db from "@/lib/db";
import Seller from "@/models/seller";
import Transaction from "@/models/transaction";

export async function POST(req) {
  try {
    await db.connect();
    const { sellerId } = await req.json();

    // 1. Find the Seller
    const seller = await Seller.findById(sellerId);
    if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });

    // 2. Get the exact amount they owe (e.g., -195 becomes 195)
    const amountToClear = Math.abs(seller.walletBalance);

    if (amountToClear === 0) {
        return NextResponse.json({ error: "Seller has no debt" }, { status: 400 });
    }

    // 3. Update Wallet (Reset to 0)
    // We add the positive amount: -195 + 195 = 0
    await Seller.findByIdAndUpdate(sellerId, {
        $inc: { walletBalance: amountToClear }
    });

    // 4. Log the Transaction (So you have a record of this manual cash collection)
    await Transaction.create({
        seller: sellerId,
        amount: amountToClear,
        type: "Credit",
        category: "Dues_Clearing",
        method: "Cash Handover (Admin)", // Mark clearly that Admin took cash
        status: "Approved", // Auto-approved since Admin is doing it
        description: "Manual debt clearance by Admin (Cash Received)"
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Clear Debt Error:", error);
    return NextResponse.json({ error: "Failed to clear debt" }, { status: 500 });
  }
}
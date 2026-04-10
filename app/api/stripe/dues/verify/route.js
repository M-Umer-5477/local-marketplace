import { NextResponse } from "next/server";
import Stripe from "stripe";
import db from "@/lib/db";
import Seller from "@/models/seller";
import Transaction from "@/models/transaction";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    await db.connect();
    const { sessionId } = await req.json();

    // 1. Verify with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not paid" }, { status: 400 });
    }

    // 2. Extract Data
    const { sellerId, type, amountPaid } = session.metadata;
    
    if (type !== "Dues_Clearing") {
        return NextResponse.json({ error: "Invalid payment type" }, { status: 400 });
    }

    // 3. Idempotency Check: Did we already process this session?
    const existingTxn = await Transaction.findOne({ transactionId: sessionId });
    if (existingTxn) {
        return NextResponse.json({ success: true, message: "Already processed" });
    }

    const numericAmount = parseFloat(amountPaid);

    // 4. Update Seller Wallet (CREDIT the paid amount to zero the negative balance)
    await Seller.findByIdAndUpdate(sellerId, {
        $inc: { walletBalance: numericAmount }
    });

    // 5. Log Transaction
    await Transaction.create({
        seller: sellerId,
        amount: numericAmount,
        type: "Credit", // Seller gave money to Admin, restoring their balance
        category: "Dues_Clearing",
        description: `Platform Dues Paid Online via Stripe`,
        status: "Completed",
        method: "Stripe",
        transactionId: sessionId // Using Stripe sessionId as unique constraint
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Dues Verify Error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

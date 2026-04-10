import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";
import Seller from "@/models/seller";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    await db.connect();
    
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "seller") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const seller = await Seller.findOne({ email: session.user.email });
    if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    
    if (seller.walletBalance >= 0) {
        return NextResponse.json({ error: "No dues to clear" }, { status: 400 });
    }

    const amountDue = Math.abs(seller.walletBalance);

    // 1. Format items for Stripe
    const line_items = [{
      price_data: {
        currency: "pkr",
        product_data: {
          name: "Clear Platform Dues",
          description: `Payment for outstanding commission to the platform.`,
        },
        unit_amount: Math.round(amountDue * 100), // Convert to paisa
      },
      quantity: 1,
    }];

    const metadata = {
        sellerId: seller._id.toString(),
        type: "Dues_Clearing",
        amountPaid: amountDue
    };

    // 2. Create Stripe Session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_URL}/vendor/wallet?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/vendor/wallet`,
      metadata: metadata,
    });

    return NextResponse.json({ url: stripeSession.url });

  } catch (error) {
    console.error("Stripe Dues Checkout Error:", error);
    return NextResponse.json({ error: "Payment initiation failed" }, { status: 500 });
  }
}

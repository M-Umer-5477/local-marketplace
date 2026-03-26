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
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { items, shopId, deliveryAddress, deliveryFee, deliveryMode } = body;

    // ✅ NEW: Check minimum order amount
    const seller = await Seller.findById(shopId);
    if (!seller) return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    
    const cartTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const minimumOrderAmount = seller.minimumOrderAmount || 0;
    
    if (minimumOrderAmount > 0 && cartTotal < minimumOrderAmount) {
      return NextResponse.json(
        { error: `Minimum order amount is Rs. ${minimumOrderAmount}. Current total: Rs. ${cartTotal}` }, 
        { status: 400 }
      );
    }

    // 1. Format items for Stripe
    const line_items = items.map((item) => ({
      price_data: {
        currency: "pkr",
        product_data: {
          name: item.name,
          images: [item.image],
        },
        unit_amount: Math.round(item.price * 100), // Convert to paisa
      },
      quantity: item.quantity,
    }));

    // Add Delivery Fee if applicable
    if (deliveryFee > 0) {
      line_items.push({
        price_data: {
          currency: "pkr",
          product_data: { name: "Delivery Fee" },
          unit_amount: Math.round(deliveryFee * 100),
        },
        quantity: 1,
      });
    }

    // 2. Create Stripe Session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout`,
      metadata: {
        userId: session.user.id,
        shopId: shopId,
        // Only stringify the address if it exists, otherwise send empty string
        addressJSON: deliveryAddress ? JSON.stringify(deliveryAddress) : "",
        deliveryMode: deliveryMode || "pickup",
        deliveryFee: deliveryFee || 0
      },
    });

    return NextResponse.json({ url: stripeSession.url });

  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: "Payment initiation failed" }, { status: 500 });
  }
}
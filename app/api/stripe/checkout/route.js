import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { items, shopId, deliveryAddress, deliveryFee, deliveryMode } = body;

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
        // We pass the full address as a string to retrieve it later
        addressJSON: JSON.stringify(deliveryAddress), 
        deliveryMode: deliveryMode,
        deliveryFee: deliveryFee
      },
    });

    return NextResponse.json({ url: stripeSession.url });

  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: "Payment initiation failed" }, { status: 500 });
  }
}
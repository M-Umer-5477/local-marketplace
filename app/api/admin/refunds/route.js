import { NextResponse } from "next/server";
import db from "@/lib/db";
import Order from "@/models/order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe"; // ✅ IMPORT STRIPE

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 1. GET: Fetch all pending refunds
export async function GET(req) {
  try {
    await db.connect();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pendingRefunds = await Order.find({
      orderStatus: "Cancelled",
      isPaid: true,
      isRefunded: { $ne: true } 
    })
    .populate("shopId", "shopName")
    .populate("userId", "name email phone")
    .sort({ updatedAt: -1 });

    return NextResponse.json({ success: true, refunds: pendingRefunds }, { status: 200 });

  } catch (error) {
    console.error("Fetch Refunds Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// 2. PUT: Process the REAL Stripe refund
export async function PUT(req) {
  try {
    await db.connect();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await req.json();

    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // 🚨 1. CONTACT STRIPE TO ISSUE REFUND
    if (order.stripeSessionId) {
      try {
        // First, retrieve the checkout session to get the actual Payment Intent ID
        const stripeSession = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
        
        if (stripeSession.payment_intent) {
          // Tell Stripe to refund the money!
          await stripe.refunds.create({
            payment_intent: stripeSession.payment_intent,
          });
        }
      } catch (stripeError) {
        console.error("Stripe API Refund Error:", stripeError);
        return NextResponse.json({ error: "Stripe failed to process refund. Check Stripe Dashboard." }, { status: 400 });
      }
    }

    // 🚨 2. IF STRIPE SUCCEEDS, UPDATE OUR DATABASE
    await Order.updateOne(
      { _id: orderId },
      {  isRefunded: true  },
     
    );

    return NextResponse.json({ success: true, message: "Refund processed successfully via Stripe" }, { status: 200 });

  } catch (error) {
    console.error("Process Refund Error:", error);
    return NextResponse.json({ error: "Failed to process refund" }, { status: 500 });
  }
}
// import { NextResponse } from "next/server";
// import db from "@/lib/db";
// import Order from "@/models/order";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// // 1. GET: Fetch all pending refunds
// export async function GET(req) {
//   try {
//     await db.connect();
//     const session = await getServerSession(authOptions);

//     // Ensure only admins can access this
//     if (!session || session.user.role !== "admin") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Find orders that are: Cancelled, Paid Online, and NOT yet refunded
//     const pendingRefunds = await Order.find({
//       orderStatus: "Cancelled",
//       isPaid: true,
//       isRefunded: { $ne: true } // We will add this flag when a refund is processed
//     })
//     .populate("shopId", "shopName")
//     .populate("userId", "name email phone")
//     .sort({ updatedAt: -1 });

//     return NextResponse.json({ success: true, refunds: pendingRefunds }, { status: 200 });

//   } catch (error) {
//     console.error("Fetch Refunds Error:", error);
//     return NextResponse.json({ error: "Server Error" }, { status: 500 });
//   }
// }

// // 2. PUT: Process the refund
// export async function PUT(req) {
//   try {
//     await db.connect();
//     const session = await getServerSession(authOptions);

//     if (!session || session.user.role !== "admin") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { orderId } = await req.json();

//     const order = await Order.findById(orderId);
//     if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

//     // --- VIVA NOTE: STRIPE INTEGRATION ---
//     // In a production app, you would call the Stripe API here:
//     // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
//     // await stripe.refunds.create({ payment_intent: order.stripeSessionId });
    
//     // For Phase 1, we just update the database to mark it as resolved.
//     order.isRefunded = true;
//     await order.save();

//     return NextResponse.json({ success: true, message: "Refund processed successfully" }, { status: 200 });

//   } catch (error) {
//     console.error("Process Refund Error:", error);
//     return NextResponse.json({ error: "Failed to process refund" }, { status: 500 });
//   }
// }
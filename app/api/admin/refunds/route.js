import { NextResponse } from "next/server";
import db from "@/lib/db";
import Order from "@/models/order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe"; // ✅ IMPORT STRIPE

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 1. GET: Fetch all refunds with statistics
export async function GET(req) {
  try {
    await db.connect();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameter for filtering
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'all'; // all, pending, approved, rejected

    const refundStatuses = ["Cancelled", "Returned", "Not_Picked_Up"];
    // Build filter
    let filter = {
      orderStatus: { $in: refundStatuses },
      isPaid: true
    };

    if (status === 'pending') {
      filter.isRefunded = { $ne: true };
    } else if (status === 'approved') {
      filter.isRefunded = true;
    }

    // Fetch all matching refunds
    const refunds = await Order.find(filter)
      .populate("shopId", "shopName phone")
      .populate("userId", "name email phone")
      .sort({ updatedAt: -1 });

    // Calculate statistics
    const pending = await Order.countDocuments({
      orderStatus: { $in: refundStatuses },
      isPaid: true,
      isRefunded: { $ne: true }
    });

    const approved = await Order.countDocuments({
      orderStatus: { $in: refundStatuses },
      isPaid: true,
      isRefunded: true
    });

    const totalRefundValue = refunds.reduce((acc, curr) => acc + (curr.total || 0), 0);

    // Calculate pending refunds older than 3 days
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const overdueRefunds = await Order.countDocuments({
      orderStatus: { $in: refundStatuses },
      isPaid: true,
      isRefunded: { $ne: true },
      createdAt: { $lt: threeDaysAgo }
    });

    return NextResponse.json({ 
      success: true, 
      refunds,
      stats: {
        total: refunds.length,
        pending,
        approved,
        totalRefundValue,
        overdueRefunds,
        averageProcessingTime: pending > 0 ? "2-3 days" : "N/A"
      }
    }, { status: 200 });

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
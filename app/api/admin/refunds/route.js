import { NextResponse } from "next/server";
import db from "@/lib/db";
import Order from "@/models/order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe"; // ✅ IMPORT STRIPE
import { sendEmail } from "@/lib/mailer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 1. GET: Fetch all refunds with statistics
export async function GET(req) {
  try {
    await db.connect();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const refundStatuses = ["Cancelled", "Returned", "Not_Picked_Up"];

    // Fetch all matching refunds
    const allRefunds = await Order.find({
      orderStatus: { $in: refundStatuses },
      isPaid: true
    })
      .populate("shopId", "shopName phone")
      .populate("userId", "name email phone")
      .sort({ updatedAt: -1 });

    const pendingRefunds = allRefunds.filter(r => !r.isRefunded);
    const approvedRefunds = allRefunds.filter(r => r.isRefunded);

    const totalRefundValue = allRefunds.reduce((acc, curr) => acc + (curr.total || 0), 0);

    // Calculate pending refunds older than 3 days
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const overdueRefunds = pendingRefunds.filter(r => new Date(r.createdAt) < threeDaysAgo).length;

    return NextResponse.json({ 
      success: true, 
      pendingRefunds,
      approvedRefunds,
      stats: {
        total: allRefunds.length,
        pending: pendingRefunds.length,
        approved: approvedRefunds.length,
        totalRefundValue,
        overdueRefunds,
        averageProcessingTime: pendingRefunds.length > 0 ? "2-3 days" : "N/A"
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

    // --- 📧 SEND EMAIL NOTIFICATIONS ---
    const detailedOrder = await Order.findById(orderId).populate("userId").populate("shopId");
    
    if (detailedOrder) {
        try {
            // Customer Email
            if (detailedOrder.userId?.email) {
                const custSubject = "💰 Refund Issued - Martly Order #" + detailedOrder._id.toString().slice(-6);
                const custHtml = `<div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #16a34a;">Refund Processed</h2>
                    <p>Dear ${detailedOrder.userId.name || 'Customer'},</p>
                    <p>A refund of <strong>Rs. ${detailedOrder.total}</strong> has been issued to your original payment method for order #${detailedOrder._id.toString().slice(-6)}.</p>
                    <p>Please note that it may take 5-7 business days for your bank to process the funds.</p>
                    <p>Thank you for shopping on Martly!</p>
                </div>`;
                await sendEmail(detailedOrder.userId.email, custSubject, custHtml);
            }
            
            // Seller Email
            if (detailedOrder.shopId?.email) {
                const sellerSubject = "⚠️ Order Refunded - Martly Order #" + detailedOrder._id.toString().slice(-6);
                const sellerHtml = `<div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #dc2626;">Order Refunded</h2>
                    <p>Dear ${detailedOrder.shopId.shopName},</p>
                    <p>A customer refund was successfully processed via Stripe for order #${detailedOrder._id.toString().slice(-6)}.</p>
                    <p>Any necessary ledger adjustments were applied automatically when the order was cancelled/refused.</p>
                </div>`;
                await sendEmail(detailedOrder.shopId.email, sellerSubject, sellerHtml);
            }
        } catch (emailErr) {
            console.error("Failed to send refund emails:", emailErr);
        }
    }

    return NextResponse.json({ success: true, message: "Refund processed successfully via Stripe" }, { status: 200 });

  } catch (error) {
    console.error("Process Refund Error:", error);
    return NextResponse.json({ error: "Failed to process refund" }, { status: 500 });
  }
}
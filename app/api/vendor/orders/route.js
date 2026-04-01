import { NextResponse } from "next/server";
import db from "@/lib/db";
import Order from "@/models/order";
import Seller from "@/models/seller";
import Product from "@/models/product"; 
import Transaction from "@/models/transaction"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 1. GET ORDERS
export async function GET(req) {
  try {
    await db.connect();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const seller = await Seller.findOne({ email: session.user.email });
    if (!seller) return NextResponse.json({ error: "Seller profile not found" }, { status: 404 });

    const orders = await Order.find({ shopId: seller._id })
      .sort({ createdAt: -1 })
      .populate("userId", "name phone email"); 

    return NextResponse.json({ success: true, orders }, { status: 200 });

  } catch (error) {
    console.error("Fetch Orders Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// 2. UPDATE ORDER STATUS (WITH WALLET, REFUND & RESTOCK LOGIC)
export async function PUT(req) {
  try {
    await db.connect();
    const session = await getServerSession(authOptions);
    const { orderId, status, estimatedPrepTime } = await req.json();

    if (!session || session.user.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify Seller owns this order
    const seller = await Seller.findOne({ email: session.user.email });
    const order = await Order.findOne({ _id: orderId, shopId: seller._id });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Status definitions
    const isCompleted = status === "Delivered" || status === "Picked_Up";
    const isCancelled = status === "Cancelled";
    const isReturned = status === "Returned"; // 🚨 NEW: Tracking the refused COD orders
    const isConfirmed = status === "Confirmed"; // NEW: For setting ETA

    // --- 📋 SET TIMESTAMPS ---
    if (isConfirmed && !order.confirmedAt) {
      order.confirmedAt = new Date();
    }
    
    // Always update the time of last status change
    order.statusUpdatedAt = new Date();

    // --- ⏱️ SET ESTIMATED PREP TIME ---
    if (isConfirmed && estimatedPrepTime) {
      order.estimatedPrepTime = parseInt(estimatedPrepTime);
    }

    // --- ✅ 1. COD COMMISSION LOGIC (Existing) ---
    // Only deduct if completed AND not already deducted (COD Orders)
    if (isCompleted && !order.commissionDeducted) {
        
        await Seller.findByIdAndUpdate(seller._id, {
            $inc: { walletBalance: -order.commissionAmount }
        });

        await Transaction.create({
            seller: seller._id,
            amount: order.commissionAmount,
            type: "Debit", // Money leaving seller (owed to admin)
            category: "Commission_Deduction",
            description: `Commission for Order #${order._id.toString().slice(-6)}`,
            status: "Completed",
        });

        order.commissionDeducted = true;
    }

    // --- 🚨 2. ONLINE PAYMENT REVERSAL LOGIC ---
    // If order is paid online and vendor cancels it, we MUST take the earning back!
    if (isCancelled && order.isPaid) {
        // Calculate the exact earning they received in stripe/verify route: (Total - Commission)
        const earningToReverse = order.total - (order.commissionAmount || 0);

        // 1. Deduct from Wallet
        await Seller.findByIdAndUpdate(seller._id, {
            $inc: { walletBalance: -earningToReverse }
        });

        // 2. Log Reversal Transaction
        await Transaction.create({
            seller: seller._id,
            amount: earningToReverse,
            type: "Debit", 
            category: "Dues_Clearing", // Using your existing enum for ledger adjustments
            description: `Payment Reversal for Cancelled Order #${order._id.toString().slice(-6)}`,
            status: "Completed"
        });
    }

    // --- 📦 3. INVENTORY RESTORATION LOGIC ---
    // 🚨 UPDATED: If order is cancelled OR returned (refused at door), put stock back!
    if (isCancelled || isReturned) {
        for (const item of order.items) {
            // Find product and increment stock by the cancelled/returned quantity
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: item.quantity }
            });
        }
    }

    // Finally, Update Status
    order.orderStatus = status;
    await order.save();

    return NextResponse.json({ success: true, message: "Order updated successfully" }, { status: 200 });

  } catch (error) {
    console.error("Order Update Error:", error);
    return NextResponse.json({ error: "Update Failed" }, { status: 500 });
  }
}
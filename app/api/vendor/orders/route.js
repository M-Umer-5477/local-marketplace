import { NextResponse } from "next/server";
import db from "@/lib/db";
import Order from "@/models/order";
import Seller from "@/models/seller";
import Product from "@/models/product"; 
import Transaction from "@/models/transaction"; 
import { sendEmail } from "@/lib/mailer";
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
    const order = await Order.findOne({ _id: orderId, shopId: seller._id }).populate("userId", "name email");

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Status definitions
    const isCompleted = status === "Delivered" || status === "Picked_Up";
    const isCancelled = status === "Cancelled";
    const isReturned = status === "Returned"; //  Tracking refused COD orders
    const isNotPickedUp = status === "Not_Picked_Up"; //  NEW: Tracking refused pickup orders
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
        
        const updatedSeller = await Seller.findByIdAndUpdate(seller._id, {
            $inc: { walletBalance: -order.commissionAmount }
        }, { new: true });

        await Transaction.create({
            seller: seller._id,
            amount: order.commissionAmount,
            type: "Debit", // Money leaving seller (owed to admin)
            category: "Commission_Deduction",
            description: `Commission for Order #${order._id.toString().slice(-6)}`,
            status: "Completed",
        });

        order.commissionDeducted = true;

        // --- 📧 DEBT WARNING TRIGGER (-5000 threshold) ---
        if (updatedSeller.walletBalance <= -5000 && !updatedSeller.hasReceivedDebtWarning) {
            updatedSeller.hasReceivedDebtWarning = true;
            await updatedSeller.save();

            try {
                const subject = "⚠️ Urgent: Clear your platform dues - Martly";
                const htmlMessage = `<div style="font-family: Arial, sans-serif; padding: 20px; border-left: 4px solid #dc2626; background-color: #fef2f2;">
                    <h2 style="color: #dc2626;">Maximum Debt Reached</h2>
                    <p>Dear ${updatedSeller.shopName},</p>
                    <p>Your platform debt has exceeded <strong>Rs. 5,000</strong> due to accumulated Cash-on-Delivery commissions.</p>
                    <p>Please clear your dues via the Wallet section in your Vendor Dashboard immediately to prevent platform suspension.</p>
                    <p>Thank you.</p>
                </div>`;
                await sendEmail(updatedSeller.email, subject, htmlMessage);
            } catch (err) {
                console.error("Failed to send debt warning email", err);
            }
        }
    }

    // --- 🚨 2. ONLINE PAYMENT REVERSAL LOGIC ---
    // If order is paid online and vendor cancels it or it is refused/not picked up, we MUST take the earning back!
    if ((isCancelled || isReturned || isNotPickedUp) && order.isPaid) {
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

    // --- 🔄 2.5 COD COMMISSION REFUND LOGIC ---
    // If COD order was marked delivered (commission deducted) but now returned, refund it!
    if ((isCancelled || isReturned || isNotPickedUp) && !order.isPaid && order.commissionDeducted) {
        await Seller.findByIdAndUpdate(seller._id, {
            $inc: { walletBalance: order.commissionAmount }
        });

        await Transaction.create({
            seller: seller._id,
            amount: order.commissionAmount,
            type: "Credit", 
            category: "Dues_Clearing",
            description: `Commission Refund for Cancelled COD Order #${order._id.toString().slice(-6)}`,
            status: "Completed"
        });

        order.commissionDeducted = false;
    }

    // --- 📦 3. INVENTORY RESTORATION LOGIC ---
    // 🚨 UPDATED: If order is cancelled, returned, or not picked up, put stock back!
    if (isCancelled || isReturned || isNotPickedUp) {
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

    // --- 📧 SEND CUSTOMER STATUS EMAIL ---
    if (order.userId && order.userId.email) {
        try {
            let subject = `Order Update #${orderId.slice(-6)} - Martly`;
            let statusMessage = "Your order status has been updated.";
            let color = "#2563eb"; // Blue

            switch(status) {
                case "Confirmed":
                    subject = `✅ Order Confirmed! Preparing your items - Martly`;
                    statusMessage = `Great news! <strong>${seller.shopName}</strong> has accepted your order and is now preparing it.`;
                    color = "#16a34a"; // Green
                    if (estimatedPrepTime) statusMessage += `<br/>Estimated Prep Time: ${estimatedPrepTime} mins.`;
                    break;
                case "Ready_For_Pickup":
                case "Out_For_Delivery":
                    subject = `🛵 Your order is on the way! - Martly`;
                    if(status === "Ready_For_Pickup") subject = `🛍️ Your order is ready for pickup! - Martly`;
                    statusMessage = `Your order from <strong>${seller.shopName}</strong> is ${status.replace(/_/g, ' ').toLowerCase()}.`;
                    color = "#eab308"; // Yellow
                    break;
                case "Delivered":
                case "Picked_Up":
                    subject = `🎉 Order Completed! - Martly`;
                    statusMessage = `Your order from <strong>${seller.shopName}</strong> has been completed successfully. Thank you for shopping!`;
                    color = "#16a34a"; // Green
                    break;
                case "Cancelled":
                case "Returned":
                case "Not_Picked_Up":
                    subject = `❌ Order Cancelled/Failed - Martly`;
                    statusMessage = `Unfortunately, your order from <strong>${seller.shopName}</strong> was marked as ${status.replace(/_/g, ' ')}. Please contact the shop if you have any questions.`;
                    color = "#dc2626"; // Red
                    break;
            }

            const html = `
                <div style="font-family: Arial, sans-serif; padding: 20px; border-top: 4px solid ${color};">
                    <h2 style="color: ${color};">Order Update</h2>
                    <p>Dear ${order.userId.name},</p>
                    <p>${statusMessage}</p>
                    <br/>
                    <p>Track your full order history in the Martly App.</p>
                </div>
            `;
            sendEmail(order.userId.email, subject, html); // Non-blocking
        } catch (err) {
             console.error("Failed to send customer status update email:", err);
        }
    }

    return NextResponse.json({ success: true, message: "Order updated successfully" }, { status: 200 });

  } catch (error) {
    console.error("Order Update Error:", error);
    return NextResponse.json({ error: "Update Failed" }, { status: 500 });
  }
}
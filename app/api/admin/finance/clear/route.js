import { NextResponse } from "next/server";
import db from "@/lib/db";
import Seller from "@/models/seller";
import Transaction from "@/models/transaction";
import { sendEmail } from "@/lib/mailer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    await db.connect();
    const session = await getServerSession(authOptions);
        
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
      
    const { sellerId, action } = await req.json();

    if (!sellerId || !action) {
      return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }

    // 1. Find the Seller
    const seller = await Seller.findById(sellerId);
    if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });

    const currentBalance = seller.walletBalance || 0;

    if (action === "collect") {
        // Platform is collecting debt from seller (e.g., COD commissions owed)
        if (currentBalance >= 0) {
            return NextResponse.json({ error: "Seller does not owe any debt." }, { status: 400 });
        }
        const amountToClear = Math.abs(currentBalance);
        
        await Seller.findByIdAndUpdate(sellerId, {
            $inc: { walletBalance: amountToClear },
            $set: { hasReceivedDebtWarning: false } // Reset warning flag
        });

        await Transaction.create({
            seller: sellerId,
            amount: amountToClear,
            type: "Credit",
            category: "Dues_Clearing",
            method: "Manual Collection (Admin)",
            status: "Approved",
            description: "Manual debt clearance by Admin (Cash Received)"
        });

    } else if (action === "payout") {
        // Platform is paying out earnings to seller (e.g., Stripe online sales)
        if (currentBalance <= 0) {
            return NextResponse.json({ error: "No earnings to pay out to seller." }, { status: 400 });
        }
        const amountToClear = currentBalance;

        // Deduct the exact balance
        await Seller.findByIdAndUpdate(sellerId, {
            $inc: { walletBalance: -amountToClear }
        });

        await Transaction.create({
            seller: sellerId,
            amount: amountToClear,
            type: "Debit", // Debit because money left the platform
            category: "Payout",
            method: "Manual Payout (Admin)",
            status: "Approved",
            description: "Manual earnings payout initiated by Admin"
        });
    } else {
        return NextResponse.json({ error: "Invalid Action" }, { status: 400 });
    }

    // --- 📧 SEND EMAIL NOTIFICATION ---
    if (seller.email) {
        try {
            let subject = "";
            let htmlMessage = "";

            if (action === "collect") {
                subject = "🧾 Cash Payment Receipt - Martly";
                htmlMessage = `<div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #16a34a;">Payment Confirmed</h2>
                    <p>Dear ${seller.shopName},</p>
                    <p>This is a receipt confirming we have received your cash payment of <strong>Rs. ${Math.abs(currentBalance)}</strong>.</p>
                    <p>Your platform debt has been cleared and your account is in good standing.</p>
                </div>`;
            } else if (action === "payout") {
                subject = "💸 Earnings Manually Transferred - Martly";
                htmlMessage = `<div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #16a34a;">Payout Processed</h2>
                    <p>Dear ${seller.shopName},</p>
                    <p>We have manually transferred your outstanding earnings of <strong>Rs. ${currentBalance}</strong> to your account.</p>
                    <p>Thank you for selling with Martly!</p>
                </div>`;
            }

            if (subject) await sendEmail(seller.email, subject, htmlMessage);
        } catch (emailError) {
             console.error("Failed to send clear finance notification email:", emailError);
        }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Clear Finance Error:", error);
    return NextResponse.json({ error: "Failed to process transaction" }, { status: 500 });
  }
}
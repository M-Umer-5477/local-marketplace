import { NextResponse } from "next/server";
import db from "@/lib/db";
import Seller from "@/models/seller";
import Transaction from "@/models/transaction";
import { sendEmail } from "@/lib/mailer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
export async function GET(req) {
  try {
    await db.connect();
    const session = await getServerSession(authOptions);
        
            if (!session || session.user.role !== "admin") {
              return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
    
    // 1. RECEIVABLES: Sellers who owe us money (Negative Wallet = they collected COD)
    const debtors = await Seller.find({ 
        role: "seller", 
        walletBalance: { $lt: 0 }
    }).sort({ walletBalance: 1 }).select('shopName phone walletBalance email');

    const receivableAmount = debtors.reduce((acc, curr) => acc + Math.abs(curr.walletBalance), 0);

    // 2. PAYABLES: Sellers we owe money to (Positive Wallet = we owe from Stripe/Online)
    const creditors = await Seller.find({ 
        role: "seller", 
        walletBalance: { $gt: 0 }
    }).sort({ walletBalance: -1 }).select('shopName phone walletBalance email savedPayoutDetails');

    const payableAmount = creditors.reduce((acc, curr) => acc + curr.walletBalance, 0);

    // 3. PENDING REQUESTS: Vendor initiated deposits/withdrawals
    const requests = await Transaction.find({ status: "Pending" })
      .populate("seller", "shopName shopLogo phone")
      .sort({ createdAt: -1 });

    // 4. Summary
    const netPosition = payableAmount - receivableAmount; // Positive = we owe more, Negative = sellers owe more

    return NextResponse.json({ 
      success: true, 
      requests,
      receivables: {
        debtors,
        totalAmount: receivableAmount,
        count: debtors.length
      },
      payables: {
        creditors,
        totalAmount: payableAmount,
        count: creditors.length
      },
      summary: {
        totalReceivable: receivableAmount,
        totalPayable: payableAmount,
        netPosition: netPosition,
        netPositionLabel: netPosition > 0 ? "Platform owes sellers" : "Sellers owe platform"
      }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// APPROVE / REJECT VENDOR BILLING REQUESTS
export async function PUT(req) {
  try {
    await db.connect();
    const { transactionId, action } = await req.json(); // action = "Approve" or "Reject"

    const txn = await Transaction.findById(transactionId).populate("seller");
    if (!txn) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

    if (txn.status !== "Pending") {
      return NextResponse.json({ error: "Already processed" }, { status: 400 });
    }

    // --- 🧠 SMART WALLET LOGIC ---
    let walletChange = 0;

    if (action === "Approve") {
        txn.status = "Approved";

        if (txn.category === "Dues_Clearing") {
            // ✅ DEPOSIT: Seller paid us, so we INCREASE their balance (e.g. -500 + 500 = 0)
            walletChange = txn.amount;
        } 
        else if (txn.category === "Payout_Withdrawal") {
            // ✅ WITHDRAWAL: Money was ALREADY deducted when they requested.
            // So we do NOTHING to the wallet here. We just confirm the transaction.
            walletChange = 0; 
        }

    } else {
        txn.status = "Rejected";

        if (txn.category === "Dues_Clearing") {
             // DEPOSIT REJECT: They said they paid, but didn't. No change.
             walletChange = 0;
        }
        else if (txn.category === "Payout_Withdrawal") {
             // ✅ WITHDRAWAL REJECT: We must REFUND the frozen money.
             walletChange = txn.amount; 
        }
    }

    // Apply Wallet Change (if any)
    if (walletChange !== 0) {
        await Seller.findByIdAndUpdate(txn.seller, {
            $inc: { walletBalance: walletChange }
        });
    }

    await txn.save();

    // --- 📧 SEND EMAIL NOTIFICATIONS ---
    if (txn.seller && txn.seller.email) {
        try {
            let subject = "";
            let htmlMessage = "";

            if (action === "Approve") {
                if (txn.category === "Dues_Clearing") {
                    subject = "✅ Payment Validated - Martly";
                    htmlMessage = `<div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2 style="color: #16a34a;">Payment Confirmed</h2>
                        <p>Dear ${txn.seller.shopName},</p>
                        <p>We have successfully verified your deposit of <strong>Rs. ${txn.amount}</strong>.</p>
                        <p>Your platform debt has been cleared accordingly. Thank you for your cooperation!</p>
                    </div>`;
                } else if (txn.category === "Payout_Withdrawal") {
                    subject = "💸 Earnings Payout Initiated - Martly";
                    htmlMessage = `<div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2 style="color: #16a34a;">Payout Processed</h2>
                        <p>Dear ${txn.seller.shopName},</p>
                        <p>Great news! We have processed your withdrawal request of <strong>Rs. ${txn.amount}</strong>.</p>
                        <p>The funds should reflect in your account shortly.</p>
                    </div>`;
                }
            } else {
                if (txn.category === "Dues_Clearing") {
                    subject = "⚠️ Payment Verification Failed - Martly";
                    htmlMessage = `<div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2 style="color: #dc2626;">Payment Rejected</h2>
                        <p>Dear ${txn.seller.shopName},</p>
                        <p>We could not verify your recent deposit proof of <strong>Rs. ${txn.amount}</strong>.</p>
                        <p>Please contact support or re-upload a valid proof of payment.</p>
                    </div>`;
                } else if (txn.category === "Payout_Withdrawal") {
                    subject = "⚠️ Withdrawal Request Failed - Martly";
                    htmlMessage = `<div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2 style="color: #dc2626;">Withdrawal Rejected</h2>
                        <p>Dear ${txn.seller.shopName},</p>
                        <p>Your withdrawal request for <strong>Rs. ${txn.amount}</strong> was rejected, likely due to invalid banking details.</p>
                        <p>The frozen amount has been returned to your wallet. Please update your banking details and request again.</p>
                    </div>`;
                }
            }

            if (subject) await sendEmail(txn.seller.email, subject, htmlMessage);
            
        } catch (emailError) {
             console.error("Failed to send finance notification email:", emailError);
        }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Update Failed" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import db from "@/lib/db";
import Transaction from "@/models/transaction";
import Seller from "@/models/seller";
import { sendEmail } from "@/lib/mailer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    await db.connect();
    
    // 1. Authenticate User
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get Data
    const body = await req.json();
    const { amount, type, method, transactionId, proofImage, bankDetails } = body;

    // 3. Find Seller
    const seller = await Seller.findOne({ email: session.user.email });
    if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });

    // --- 🛑 WITHDRAWAL SECURITY CHECKS ---
    if (type !== "Deposit") { // If it is a Withdrawal
        if (seller.walletBalance < parseFloat(amount)) {
            return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
        }
        if (parseFloat(amount) < 500) {
             return NextResponse.json({ error: "Minimum withdrawal is Rs. 500" }, { status: 400 });
        }
    }

    // 4. Create Transaction
    const newTxn = await Transaction.create({
      seller: seller._id,
      amount: parseFloat(amount),
      // If Deposit (Paying Dues) -> Credit (Money In)
      // If Withdrawal -> Debit (Money Out)
      type: type === "Deposit" ? "Credit" : "Debit", 
      
      category: type === "Deposit" ? "Dues_Clearing" : "Payout_Withdrawal",
      
      status: "Pending", 
      
      method,        
      transactionId, 
      proofImage,    
      bankDetails,   
      
      description: type === "Deposit" 
        ? `Manual Deposit via ${method}` 
        : `Withdrawal Request to ${bankDetails?.bankName} (${bankDetails?.accountNumber})`
    });

    // --- ❄️ FREEZE FUNDS LOGIC ---
    // If it's a withdrawal, we deduct NOW. 
    // If Admin rejects later, we will add it back.
    if (type !== "Deposit") {
        const updateDoc = {
            $inc: { walletBalance: -parseFloat(amount) }
        };
        
        // ✅ Save details for next time (Smart UX)
        if (bankDetails) {
            updateDoc.$set = {
                savedPayoutDetails: {
                    method,
                    bankName: bankDetails.bankName,
                    accountNumber: bankDetails.accountNumber,
                    accountTitle: bankDetails.accountTitle
                }
            };
        }
        await Seller.findByIdAndUpdate(seller._id, updateDoc);
    }

    // --- 📧 5. SEND ADMIN NOTIFICATION (Withdrawals only) ---
    if (type !== "Deposit") {
        try {
            const adminEmail = process.env.ADMIN_EMAIL || "admin@martly.me";
            const subject = `💸 Pending Withdrawal Request - ${seller.shopName}`;
            const html = `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #ea580c;">Payout Request Needs Review</h2>
                    <p><strong>Shop:</strong> ${seller.shopName}</p>
                    <p><strong>Amount Requested:</strong> Rs. ${parseFloat(amount)}</p>
                    <p><strong>Payout Method:</strong> ${method}</p>
                    <br/>
                    <p>Please log in to the admin finance portal to review and approve/reject this request.</p>
                </div>
            `;
            sendEmail(adminEmail, subject, html); // Non-blocking
        } catch (err) {
             console.error("Failed to notify admin of withdrawal request:", err);
        }
    }

    return NextResponse.json({ success: true, transaction: newTxn });

  } catch (error) {
    console.error("Transaction Request Error:", error);
    return NextResponse.json({ error: "Request Failed" }, { status: 500 });
  }
}
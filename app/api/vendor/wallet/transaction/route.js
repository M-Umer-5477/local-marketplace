import { NextResponse } from "next/server";
import db from "@/lib/db";
import Transaction from "@/models/transaction";
import Seller from "@/models/seller";
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
        seller.walletBalance -= parseFloat(amount);
        
        // ✅ Save details for next time (Smart UX)
        if (bankDetails) {
            seller.savedPayoutDetails = {
                method,
                bankName: bankDetails.bankName,
                accountNumber: bankDetails.accountNumber,
                accountTitle: bankDetails.accountTitle
            };
        }
        await seller.save();
    }

    return NextResponse.json({ success: true, transaction: newTxn });

  } catch (error) {
    console.error("Transaction Request Error:", error);
    return NextResponse.json({ error: "Request Failed" }, { status: 500 });
  }
}
// import { NextResponse } from "next/server";
// import db from "@/lib/db";
// import Transaction from "@/models/transaction";
// import Seller from "@/models/seller";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// export async function POST(req) {
//   try {
//     await db.connect();
    
//     // 1. Authenticate User
//     const session = await getServerSession(authOptions);
//     if (!session || session.user.role !== "seller") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // 2. Get Data from Modal
//     const body = await req.json();
//     const { amount, type, method, transactionId, proofImage, bankDetails } = body;

//     // 3. Find Seller ID
//     const seller = await Seller.findOne({ email: session.user.email });
//     if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });

//     // 4. Create the Transaction Record
//     // Note: We do NOT update walletBalance here. The Admin does that when they click "Approve".
//     const newTxn = await Transaction.create({
//       seller: seller._id,
//       amount: parseFloat(amount),
//       type: type === "Deposit" ? "Credit" : "Debit", // "Credit" because money is coming INTO the system
      
//       // Category: "Dues_Clearing" for paying back, "Payout_Withdrawal" for asking money
//       category: type === "Deposit" ? "Dues_Clearing" : "Payout_Withdrawal",
      
//       status: "Pending", // Important! Admin must verify first
      
//       method,        // e.g. "EasyPaisa"
//       transactionId, // e.g. "8452XXXX"
//       proofImage,    // URL of the screenshot
//       bankDetails,   // (Optional) Used only if withdrawing
      
//       description: type === "Deposit" 
//         ? `Manual Deposit via ${method}` 
//         : `Withdrawal Request to ${bankDetails?.bankName}`
//     });

//     return NextResponse.json({ success: true, transaction: newTxn });

//   } catch (error) {
//     console.error("Transaction Request Error:", error);
//     return NextResponse.json({ error: "Request Failed" }, { status: 500 });
//   }
// }
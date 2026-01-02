import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
  
  amount: { type: Number, required: true },
  type: { type: String, enum: ["Credit", "Debit"], required: true }, 
  // Credit = Admin giving money to Seller
  // Debit = Seller giving money to Admin

  category: { 
    type: String, 
    enum: ["Payout_Withdrawal", "Dues_Clearing", "Commission_Deduction", "Order_Earning"], 
    required: true 
  },
  
  status: { type: String, enum: ["Pending", "Approved", "Rejected", "Completed"], default: "Pending" },
  
  // Manual Proof Details (FYP Requirement)
  method: { type: String }, // "EasyPaisa", "JazzCash", "Bank Transfer"
  transactionId: { type: String }, // The Trx ID from the SMS
  proofImage: { type: String },    // Cloudinary URL of screenshot
  
  bankDetails: {
      bankName: String,
      accountNumber: String,
      accountTitle: String
  },
  
  adminNote: { type: String }, // If admin rejects, say why
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);
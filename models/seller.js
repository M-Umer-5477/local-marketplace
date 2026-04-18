
import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
  // --- Personal Details ---
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  cnic: { type: String, required: true, unique: true },
  role: { type: String, default: "seller" },

  // --- Shop Details ---
  shopName: { type: String, required: true },
  shopDescription: { type: String },
  shopType: {
    type: String,
    enum: ["Grocery", "General", "Pharmacy", "Bakery", "Vegetable", "Other"],
    required: true
  },

  // Branding
  shopLogo: { type: String, default: "" },
  shopBanner: { type: String, default: "" },

  // --- Location (GeoJSON) ---
  shopAddress: { type: String, required: true },
  shopLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: "Point",
      required: true
    },
    coordinates: {
      type: [Number],
      default: [0, 0], 
    }
  },
  deliveryRadius: { type: Number, default: 3 },

  // --- Operations ---
  isShopOpen: { type: Boolean, default: true },
  openingTime: { type: String, default: "09:00" },
  closingTime: { type: String, default: "22:00" },
  minimumOrderAmount: { type: Number, default: 300 }, // ✅ NEW: Per-shop minimum order

  // --- Verification ---
  verificationDocs: [
    {
      docType: { type: String, required: true },
      docURL: { type: String, required: true },
    },
  ],
  verificationStatus: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },

  // --- System ---
  stripeAccountId: { type: String },
  payoutStatus: { type: String, default: "Unverified" },
  isActive: { type: Boolean, default: false },
  
  // --- RATINGS & REVIEWS ---
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },

  
  // --- WALLET & COMMISSION LOGIC (UPDATED) ---
  walletBalance: { type: Number, default: 0 }, // Negative = Seller owes Admin. Positive = Admin owes Seller.
  commissionRate: { type: Number, default: 10 }, // Percentage (e.g. 10%)
  hasReceivedDebtWarning: { type: Boolean, default: false }, // Track if they were warned about Rs. 5000 debt
  
  // Internal Ledger (History of + and -)
  transactions: [
    {
        amount: Number,
        type: { type: String, enum: ["Credit", "Debit"] }, // Credit (+) / Debit (-)
        category: { type: String, enum: ["Order_Earning", "Commission_Deduction", "Payout_Withdrawal", "Dues_Clearing"] },
        description: String,
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }, // Optional link to specific order
        date: { type: Date, default: Date.now }
    }
  ],
  savedPayoutDetails: {
      method: { type: String, default: "EasyPaisa" },
      bankName: { type: String }, 
      accountNumber: { type: String },
      accountTitle: { type: String }
  },
  // --- AUTH & OTP FIELDS ---
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationExpires: { type: Date },

}, { timestamps: true });

// --- Indexes ---
sellerSchema.index({ shopLocation: "2dsphere" });

sellerSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 86400, // 24 hours — gives sellers enough time to complete registration
    partialFilterExpression: { isVerified: false }
  }
);

export default mongoose.models.Seller || mongoose.model("Seller", sellerSchema);
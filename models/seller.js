
// import mongoose from "mongoose";

// const sellerSchema = new mongoose.Schema({
//   // --- Personal Details ---
//   fullName: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   phone: { type: String, required: true, unique: true },
//   password: { type: String, required: true, select: false },
//   cnic: { type: String, required: true },
//   role: { type: String, default: "seller" },

//   // --- Shop Details ---
//   shopName: { type: String, required: true },
//   shopDescription: { type: String },
//   shopType: {
//     type: String,
//     enum: ["Grocery", "General", "Pharmacy", "Bakery", "Vegetable", "Other"],
//     required: true
//   },

//   // Branding
//   shopLogo: { type: String, default: "" },
//   shopBanner: { type: String, default: "" },

//   // --- Location (GeoJSON) ---
//   // ✅ FIX APPLIED: Added structure and defaults to prevent crashes.
//   // The 'index' was removed from coordinates because it is handled correctly at the bottom.
//   shopAddress: { type: String, required: true },
//   shopLocation: {
//     type: {
//       type: String,
//       enum: ['Point'],
//       default: "Point",
//       required: true
//     },
//     coordinates: {
//       type: [Number],
//       default: [0, 0], // ✅ Safety: Prevents "Invalid GeoJSON" errors if data is missing
//     }
//   },
//   deliveryRadius: { type: Number, default: 3 },

//   // --- Operations ---
//   isShopOpen: { type: Boolean, default: true },
//   openingTime: { type: String, default: "09:00" },
//   closingTime: { type: String, default: "22:00" },

//   // --- Verification ---
//   verificationDocs: [
//     {
//       docType: { type: String, required: true },
//       docURL: { type: String, required: true },
//     },
//   ],
//   verificationStatus: {
//     type: String,
//     enum: ["Pending", "Approved", "Rejected"],
//     default: "Pending",
//   },

//   // --- System ---
//   stripeAccountId: { type: String },
//   payoutStatus: { type: String, default: "Unverified" },
//   isActive: { type: Boolean, default: false },
//   walletBalance: { type: Number, default: 0 },

//   // --- AUTH & OTP FIELDS ---
//   isVerified: { type: Boolean, default: false },
//   verificationToken: { type: String },
//   verificationExpires: { type: Date },

//   createdAt: { type: Date, default: Date.now },
// }, { timestamps: true });

// // --- Indexes ---
// // ✅ 1. Geospatial Index on the PARENT field (Correct way for finding shops nearby)
// sellerSchema.index({ shopLocation: "2dsphere" });

// // ✅ 2. TTL Index for auto-deleting unverified accounts after 1 hour
// sellerSchema.index(
//   { createdAt: 1 },
//   {
//     expireAfterSeconds: 3600,
//     partialFilterExpression: { isVerified: false }
//   }
// );

// // ✅ FIX: Ensures Next.js doesn't ignore your new schema changes on reload
// export default mongoose.models.Seller || mongoose.model("Seller", sellerSchema);
import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
  // --- Personal Details ---
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  cnic: { type: String, required: true },
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
  
  // --- WALLET & COMMISSION LOGIC (UPDATED) ---
  walletBalance: { type: Number, default: 0 }, // Negative = Seller owes Admin. Positive = Admin owes Seller.
  commissionRate: { type: Number, default: 10 }, // Percentage (e.g. 10%)
  
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

  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// --- Indexes ---
sellerSchema.index({ shopLocation: "2dsphere" });

sellerSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 3600,
    partialFilterExpression: { isVerified: false }
  }
);

export default mongoose.models.Seller || mongoose.model("Seller", sellerSchema);
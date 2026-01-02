
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
  // ✅ FIX APPLIED: Added structure and defaults to prevent crashes.
  // The 'index' was removed from coordinates because it is handled correctly at the bottom.
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
      default: [0, 0], // ✅ Safety: Prevents "Invalid GeoJSON" errors if data is missing
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
  walletBalance: { type: Number, default: 0 },

  // --- AUTH & OTP FIELDS ---
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationExpires: { type: Date },

  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// --- Indexes ---
// ✅ 1. Geospatial Index on the PARENT field (Correct way for finding shops nearby)
sellerSchema.index({ shopLocation: "2dsphere" });

// ✅ 2. TTL Index for auto-deleting unverified accounts after 1 hour
sellerSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 3600,
    partialFilterExpression: { isVerified: false }
  }
);

// ✅ FIX: Ensures Next.js doesn't ignore your new schema changes on reload
export default mongoose.models.Seller || mongoose.model("Seller", sellerSchema);
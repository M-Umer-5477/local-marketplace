import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
  // Step 1: Personal Details
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cnic: { type: String, required: true }, // Pakistani ID
  role: { type: String,  default: "seller" ,required:false },
  // Step 2: Shop Details
  shopName: { type: String, required: true },
  shopType: { type: String, enum: ["Grocery", "General", "Pharmacy", "Other"], required: true },
  shopAddress: { type: String, required: true },
  shopLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  openingHours: { type: String },
  deliveryAvailable: { type: Boolean, default: false },

  // Step 3: Verification
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

  // Step 4: Stripe or Payment Details
  stripeAccountId: { type: String },
  payoutStatus: { type: String, enum: ["Unverified", "Verified"], default: "Unverified" },

  // Step 5: System Details
  isActive: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationExpires: Date,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Seller || mongoose.model("Seller", sellerSchema);

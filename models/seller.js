// import mongoose from "mongoose";

// const sellerSchema = new mongoose.Schema({
//   // Step 1: Personal Details
//   fullName: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   phone: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   cnic: { type: String, required: true }, // Pakistani ID
//   role: { type: String,  default: "seller" ,required:false },
//   // Step 2: Shop Details
//   shopName: { type: String, required: true },
//   shopType: { type: String, enum: ["Grocery", "General", "Pharmacy", "Other"], required: true },
//   shopAddress: { type: String, required: true },
//   shopLocation: {
//     latitude: { type: Number },
//     longitude: { type: Number },
//   },
//   openingHours: { type: String },
//   deliveryAvailable: { type: Boolean, default: false },
//   shopBanner:{ type: String, required:true},

//   // Step 3: Verification
//   verificationDocs: [
//   {
//     docType: { type: String, required: true },
//     docURL: { type: String, required: true },
//   },
// ],
//   verificationStatus: {
//     type: String,
//     enum: ["Pending", "Approved", "Rejected"],
//     default: "Pending",
//   },

//   // Step 4: Stripe or Payment Details
//   stripeAccountId: { type: String },
//   payoutStatus: { type: String, enum: ["Unverified", "Verified"], default: "Unverified" },

//   // Step 5: System Details
//   isActive: { type: Boolean, default: false },
//   isVerified: { type: Boolean, default: false },
//   verificationToken: String,
//   verificationExpires: Date,
//   createdAt: { type: Date, default: Date.now },
// });

// export default mongoose.models.Seller || mongoose.model("Seller", sellerSchema);
import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
  // --- Personal Details ---
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false }, // Secure password
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
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], index: "2dsphere" }, // Format: [Longitude, Latitude]
  },
  deliveryRadius: { type: Number, default: 3 }, // km

  // --- Operations ---
  isShopOpen: { type: Boolean, default: true }, // The main On/Off switch
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
  isActive: { type: Boolean, default: false }, // Admin approval status
  isVerified: { type: Boolean, default: false }, // Email verification
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Create index for "Find shops near me"
sellerSchema.index({ shopLocation: "2dsphere" });
sellerSchema.index(
  { createdAt: 1 }, 
  { 
    expireAfterSeconds: 3600, 
    partialFilterExpression: { isVerified: false } 
  }
);

export default mongoose.models.Seller || mongoose.model("Seller", sellerSchema);
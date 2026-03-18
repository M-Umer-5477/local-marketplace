import mongoose from "mongoose";

// 👇 NEW: Sub-schema for addresses
const AddressSchema = new mongoose.Schema({
  label: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
  address: { type: String, required: true },
  city: { type: String, required: true },
  // MongoDB GeoJSON format for map queries
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // MUST BE: [longitude, latitude]
  },
  isDefault: { type: Boolean, default: false }
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["customer", "admin"], default: "customer", required: false },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationExpires: Date,
  
  // 👇 NEW: Array of saved addresses
  addresses: [AddressSchema]
  
}, { timestamps: true });

UserSchema.index(
  { createdAt: 1 }, 
  { 
    expireAfterSeconds: 3600, 
    partialFilterExpression: { isVerified: false } 
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);

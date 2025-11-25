import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["customer", "admin"], default: "customer",required:false },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationExpires: Date,
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
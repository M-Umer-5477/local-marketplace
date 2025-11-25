import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  method: { type: String, enum: ["cash", "card", "online", "cod","khata"], required: true },
  date: { type: Date, default: Date.now },
  note: String,
});

const OrderSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // for online users (optional)

  // --- Common Info ---
  source: { type: String, enum: ["online", "offline"], default: "offline" },
  paymentMethod: { type: String, enum: ["cash", "card", "online", "cod", "khata"], default: "cash" },
  isPaid: { type: Boolean, default: false },
  isKhata: { type: Boolean, default: false },

  // --- Customer Info (for khata only) ---
  customerName: { type: String },
  customerPhone: { type: String },

  // --- Products in Order ---
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      name: String,
      quantity: Number,
      price: Number,
      subtotal: Number,
      barcode: String,
    },
  ],

  total: { type: Number, required: true },
  payments: [PaymentSchema],
  balance: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);

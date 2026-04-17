
import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  method: { type: String, enum: ["cash", "card", "online", "cod", "khata"], required: true },
  date: { type: Date, default: Date.now },
  note: String,
});

const OrderSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // --- Common Info ---
  source: { type: String, enum: ["online", "offline"], default: "offline" },
  
  // --- Khata & Balance Fields ---
  isKhata: { type: Boolean, default: false },
  customerName: { type: String },
  customerPhone: { type: String },
  balance: { type: Number, default: 0 },

  // --- Lifecycle Status ---
  orderStatus: { 
    type: String, 
    enum: [
      "Pending", 
      "Confirmed", 
      "Preparing", 
      "Out_for_Delivery", 
      "Ready_for_Pickup", 
      "Delivered",        
      "Picked_Up",
      "Not_Picked_Up",        
      "Cancelled",
      "Returned"
    ], 
    default: "Pending" 
  },

  paymentMethod: { type: String, enum: ["cash", "card", "online", "cod", "khata"], default: "cash" },
  isPaid: { type: Boolean, default: false },
  isRefunded: { type: Boolean, default: false }, // NEW FIELD to track refunds
  
  // --- REVIEWS & FEEDBACK ---
  isReviewed: { type: Boolean, default: false },
  rating: { type: Number, min: 1, max: 5 },
  feedback: { type: String },

  // ✅ NEW FIELD: Required for Stripe Verification API
  stripeSessionId: { 
    type: String ,
    unique: true, // 🛑 No duplicates allowed
    sparse: true
  }, 

  // --- WALLET TRACKING FIELDS ---
  commissionDeducted: { type: Boolean, default: false }, 
  commissionAmount: { type: Number, default: 0 },        

  // --- Delivery Info ---
  deliveryAddress: {
    address: String,
    city: String,
    location: { 
        lat: Number,
        lng: Number
    }
  },

  // --- Products in Order ---
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      name: String,
      image: String, 
      quantity: Number,
      price: Number,
      subtotal: Number,
    },
  ],

  total: { type: Number, required: true },
  payments: [PaymentSchema],
  
  deliveryMode: { 
    type: String, 
    enum: ["home_delivery", "store_pickup"], 
    default: "home_delivery" 
  },
  
  orderPin: { type: String }, 
  deliveryFee: { type: Number, default: 0 },
  
  // --- TIMESTAMPS FOR TRACKING ---
  confirmedAt: { type: Date }, // When vendor confirms
  statusUpdatedAt: { type: Date, default: Date.now }, // Last status update time
  estimatedPrepTime: { type: Number, default: 10 }, // Prep time in minutes
  
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
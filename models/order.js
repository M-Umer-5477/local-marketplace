

// import mongoose from "mongoose";

// const PaymentSchema = new mongoose.Schema({
//   amount: { type: Number, required: true },
//   method: { type: String, enum: ["cash", "card", "online", "cod", "khata"], required: true },
//   date: { type: Date, default: Date.now },
//   note: String,
// });

// const OrderSchema = new mongoose.Schema({
//   shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

//   // --- Common Info ---
//   source: { type: String, enum: ["online", "offline"], default: "offline" },
  
//   // --- Khata & Balance Fields ---
//   isKhata: { type: Boolean, default: false },
//   customerName: { type: String },
//   customerPhone: { type: String },
//   balance: { type: Number, default: 0 },

//   // ---------------------------------------
//   // UPDATED: Lifecycle Status (Includes Pickup Stages)
//   orderStatus: { 
//     type: String, 
//     enum: [
//       "Pending", 
//       "Confirmed", 
//       "Preparing", 
//       "Out_for_Delivery", // Delivery specific
//       "Ready_for_Pickup", // Pickup specific (New)
//       "Delivered",        // Delivery specific
//       "Picked_Up",        // Pickup specific (New)
//       "Cancelled"
//     ], 
//     default: "Pending" 
//   },

//   paymentMethod: { type: String, enum: ["cash", "card", "online", "cod", "khata"], default: "cash" },
//   isPaid: { type: Boolean, default: false },
  
//   // --- Delivery Info ---
//   deliveryAddress: {
//     address: String,
//     city: String,
//     location: { 
//        lat: Number,
//        lng: Number
//     }
//   },

//   // --- Products in Order ---
//   items: [
//     {
//       productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
//       name: String,
//       image: String, 
//       quantity: Number,
//       price: Number,
//       subtotal: Number,
//     },
//   ],

//   total: { type: Number, required: true },
//   payments: [PaymentSchema],
  
//   // --- Delivery Mode Configuration ---
//   deliveryMode: { 
//     type: String, 
//     enum: ["home_delivery", "store_pickup"], 
//     default: "home_delivery" 
//   },
  
//   // Security Code (Customer shows this to shopkeeper for pickup)
//   orderPin: { type: String }, 
  
//   // Delivery Fee (0 if pickup)
//   deliveryFee: { type: Number, default: 0 },
  
//   createdAt: { type: Date, default: Date.now },
// });

// export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
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
      "Cancelled"
    ], 
    default: "Pending" 
  },

  paymentMethod: { type: String, enum: ["cash", "card", "online", "cod", "khata"], default: "cash" },
  isPaid: { type: Boolean, default: false },
  isRefunded: { type: Boolean, default: false }, // NEW FIELD to track refunds
  
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
  
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
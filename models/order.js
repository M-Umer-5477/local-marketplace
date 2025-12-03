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
  // --- Khata & Balance Fields (ADD THESE) ---
  // These are safe to add. They won't break existing orders.
  isKhata: { type: Boolean, default: false },
  customerName: { type: String },
  customerPhone: { type: String },
  balance: { type: Number, default: 0 }, 
  // ---------------------------------------
  // NEW: Lifecycle Status for Online Orders
  orderStatus: { 
    type: String, 
    enum: ["Pending", "Confirmed", "Preparing", "Out_for_Delivery", "Delivered", "Cancelled"], 
    default: "Pending" 
  },

  paymentMethod: { type: String, enum: ["cash", "card", "online", "cod", "khata"], default: "cash" },
  isPaid: { type: Boolean, default: false },
  
  // NEW: Delivery Info
  deliveryAddress: {
    address: String,
    city: String,
    location: { // GeoJSON for rider routing later
       lat: Number,
       lng: Number
    }
  },
  deliveryFee: { type: Number, default: 0 },

  // --- Products in Order ---
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      name: String,
      image: String, // Good to have snapshot of image
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
  
  // Security Code (Customer tells this to the rider/shopkeeper to prove identity)
  orderPin: { type: String }, 
  
  // Delivery Fee (0 if pickup)
  deliveryFee: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
// import mongoose from "mongoose";

// const PaymentSchema = new mongoose.Schema({
//   amount: { type: Number, required: true },
//   method: { type: String, enum: ["cash", "card", "online", "cod","khata"], required: true },
//   date: { type: Date, default: Date.now },
//   note: String,
// });

// const OrderSchema = new mongoose.Schema({
//   shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // for online users (optional)

//   // --- Common Info ---
//   source: { type: String, enum: ["online", "offline"], default: "offline" },
//   paymentMethod: { type: String, enum: ["cash", "card", "online", "cod", "khata"], default: "cash" },
//   isPaid: { type: Boolean, default: false },
//   isKhata: { type: Boolean, default: false },

//   // --- Customer Info (for khata only) ---
//   customerName: { type: String },
//   customerPhone: { type: String },

//   // --- Products in Order ---
//   items: [
//     {
//       productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
//       name: String,
//       quantity: Number,
//       price: Number,
//       subtotal: Number,
//       barcode: String,
//     },
//   ],

//   total: { type: Number, required: true },
//   payments: [PaymentSchema],
//   balance: { type: Number, default: 0 },

//   createdAt: { type: Date, default: Date.now },
// });

// export default mongoose.models.Order || mongoose.model("Order", OrderSchema);

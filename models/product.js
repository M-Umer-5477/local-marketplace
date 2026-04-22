// models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, // e.g., "Shan Chana Masala 50g"
  description: { type: String, required: true },
  price: { type: Number, required: true, default: 0 }, // Store price in smallest unit (e.g., Paisa) to avoid float issues
  
  imageUrl: { type: String, required: true }, // Link to the image on Cloudinary
  category: { type: String, required: true, index: true }, // e.g., "Spices", "Snacks", "Dairy"
  
  stock: { type: Number, required: true, default: 0 }, // Current number of items in stock
  unit: { // Crucial for groceries
    type: String, 
    required: true,
    enum: ['pcs', 'kg', 'g', 'litre', 'ml'], // Pcs (pieces), Kilogram, Gram, etc.
    default: 'pcs'
  },
  barcode:{type: String, required: true},
  isActive: { type: Boolean, default: true }, // A switch on the dashboard to quickly hide/show a product
  isDelistedByAdmin: { type: Boolean, default: false }, // Compliance moderation flag set by admin
  adminDelistedAt: { type: Date, default: null },
  
  // Link to the shop that owns this product
  shopId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Seller', 
    required: true, 
    index: true 
  },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', productSchema);
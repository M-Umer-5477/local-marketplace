import { NextResponse } from "next/server";
import db from "@/lib/db";
import Seller from "@/models/seller";
import Product from "@/models/product"; // Assuming you have this model
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    await db.connect();
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid shop ID" }, { status: 400 });
    }

    // 1. Fetch Shop Details (excluding sensitive data)
    const shop = await Seller.findById(id).select("-password -cnic -verificationDocs");
    
    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    // 2. Fetch All Active Products for this Shop
    const products = await Product.find({ shopId: id, isActive: true });

    // 3. Extract Unique Categories for the Menu Sidebar
    // (Creates a list like ["Grocery", "Drinks", "Snacks"] dynamically)
    const categories = [...new Set(products.map(p => p.category))];

    // 4. Fetch Recent Reviews
    // We only need a few latest reviews to show on the shop page.
    // Instead of importing the whole Order model at the top if it's already there or importing it now.
    const OrderModel = mongoose.models.Order || mongoose.model("Order");
    const User = mongoose.models.User || mongoose.model("User");
    
    const recentReviews = await OrderModel.find({ shopId: id, isReviewed: true })
      .select("rating feedback userId createdAt")
      .populate({ path: "userId", select: "name", model: User })
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({ 
      success: true, 
      shop, 
      products, 
      categories,
      recentReviews
    });

  } catch (error) {
    console.error("Shop Details API Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
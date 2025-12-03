import { NextResponse } from "next/server";
import db from "@/lib/db";
import Seller from "@/models/seller";
import Product from "@/models/product"; // Assuming you have this model

export async function GET(req, { params }) {
  try {
    await db.connect();
    const { id } = params;

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

    return NextResponse.json({ 
      success: true, 
      shop, 
      products, 
      categories 
    });

  } catch (error) {
    console.error("Shop Details API Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
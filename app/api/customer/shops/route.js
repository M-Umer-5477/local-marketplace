import { NextResponse } from "next/server";
import db from "@/lib/db";
import Seller from "@/models/seller";

export async function GET(req) {
  try {
    await db.connect();

    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let query = { 
      isShopOpen: true, // Only show open shops (optional preference)
      isActive: true,   // Only admin-approved shops
      verificationStatus: "Approved"
    };

    // 1. Text Search Logic
    if (search) {
      query.shopName = { $regex: search, $options: "i" };
    }

    // 2. Category Filter
    if (category && category !== "All") {
      query.shopType = category;
    }

    let shops;

    // 3. Geospatial Query (The "Near Me" Logic)
    // if (lat && lng) {
    //   shops = await Seller.find({
    //     ...query,
    //     shopLocation: {
    //       $near: {
    //         $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
    //         $maxDistance: 50000 // 50km radius
    //       }
    //     }
    //   }).select("-password -cnic -verificationDocs"); // Exclude sensitive info
    // } else {
      // Fallback: Just return all matching shops
      shops = await Seller.find(query)
        .sort({ createdAt: -1 })
        .select("-password -cnic -verificationDocs");
   // }

    return NextResponse.json({ success: true, count: shops.length, shops });
  } catch (error) {
    console.error("Shop Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch shops" }, { status: 500 });
  }
}
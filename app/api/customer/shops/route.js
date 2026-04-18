import { NextResponse } from "next/server";
import db from "@/lib/db";
import Seller from "@/models/seller";
import { calculateDistance } from "@/lib/geo";


export async function GET(req) {
  try {
    await db.connect();

    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat"); 
    const lng = searchParams.get("lng");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    // 1. Build the Filter Query
    let query = { 
      isShopOpen: true,        
      isActive: true,          
      verificationStatus: "Approved" 
    };

    if (search) query.shopName = { $regex: search, $options: "i" };
    if (category && category !== "All") query.shopType = category;

    // 2. Fetch Shops (use .lean() for faster JS object manipulation)
    let shops = await Seller.find(query)
      .sort({ createdAt: -1 }) 
      .select("-password -cnic -verificationDocs -stripeAccountId -verificationToken")
      .lean();

    // 3. THE FOODPANDA FILTER (If user has an active address)
    if (lat && lng) {
       const userLat = parseFloat(lat);
       const userLng = parseFloat(lng);

       shops = shops.map(shop => {
           // MongoDB GeoJSON is [lng, lat]
           const shopLat = shop.shopLocation?.coordinates?.[1];
           const shopLng = shop.shopLocation?.coordinates?.[0];
           const dist = calculateDistance(userLat, userLng, shopLat, shopLng);
           return { ...shop, distance: dist };
       })
       // 🚨 STRICT FILTER: Only return shops that can reach this exact address!
       .filter(shop => shop.distance !== null && shop.distance <= (shop.deliveryRadius || 10))
       // 🚨 SORT: Nearest shops at the top!
       .sort((a, b) => a.distance - b.distance);
    }

    return NextResponse.json({ success: true, count: shops.length, shops });

  } catch (error) {
    console.error("Shop Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch shops" }, { status: 500 });
  }
}
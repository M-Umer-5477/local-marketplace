
// import { NextResponse } from "next/server";
// import db from "@/lib/db";
// import Seller from "@/models/seller";

// export async function GET(req) {
//   try {
//     await db.connect();

//     const { searchParams } = new URL(req.url);
//     // We don't strictly need lat/lng here because frontend does the math,
//     // but we keep them in params in case you want to enable server-side sorting later.
//     // const lat = searchParams.get("lat"); 
//     // const lng = searchParams.get("lng");
    
//     const category = searchParams.get("category");
//     const search = searchParams.get("search");

//     // 1. Build the Filter Query
//     let query = { 
//       isShopOpen: true,        // Only show open shops
//       isActive: true,          // Only admin-approved shops
//       verificationStatus: "Approved" 
//     };

//     // 2. Text Search (Case-insensitive)
//     if (search) {
//       query.shopName = { $regex: search, $options: "i" };
//     }

//     // 3. Category Filter
//     if (category && category !== "All") {
//       query.shopType = category;
//     }

//     // 4. Fetch Shops
//     // We explicitly exclude heavy/private fields, but ensure 'shopLocation' and 'deliveryRadius' are sent.
//     const shops = await Seller.find(query)
//       .sort({ createdAt: -1 }) // Newest shops first (Frontend will re-sort by distance)
//       .select("-password -cnic -verificationDocs -stripeAccountId -verificationToken");

//     return NextResponse.json({ success: true, count: shops.length, shops });

//   } catch (error) {
//     console.error("Shop Fetch Error:", error);
//     return NextResponse.json({ error: "Failed to fetch shops" }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import db from "@/lib/db";
import Seller from "@/models/seller";

// --- RADAR MATH IN THE BACKEND ---
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

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
// import { NextResponse } from "next/server";
// import db from "@/lib/db";
// import Seller from "@/models/seller";

// export async function GET(req) {
//   try {
//     await db.connect();

//     const { searchParams } = new URL(req.url);
//     const lat = searchParams.get("lat");
//     const lng = searchParams.get("lng");
//     const category = searchParams.get("category");
//     const search = searchParams.get("search");

//     let query = { 
//       isShopOpen: true, // Only show open shops (optional preference)
//       isActive: true,   // Only admin-approved shops
//       verificationStatus: "Approved"
//     };

//     // 1. Text Search Logic
//     if (search) {
//       query.shopName = { $regex: search, $options: "i" };
//     }

//     // 2. Category Filter
//     if (category && category !== "All") {
//       query.shopType = category;
//     }

//     let shops;

//     // 3. Geospatial Query (The "Near Me" Logic)
//     // if (lat && lng) {
//     //   shops = await Seller.find({
//     //     ...query,
//     //     shopLocation: {
//     //       $near: {
//     //         $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
//     //         $maxDistance: 50000 // 50km radius
//     //       }
//     //     }
//     //   }).select("-password -cnic -verificationDocs"); // Exclude sensitive info
//     // } else {
//       // Fallback: Just return all matching shops
//       shops = await Seller.find(query)
//         .sort({ createdAt: -1 })
//         .select("-password -cnic -verificationDocs");
//    // }

//     return NextResponse.json({ success: true, count: shops.length, shops });
//   } catch (error) {
//     console.error("Shop Fetch Error:", error);
//     return NextResponse.json({ error: "Failed to fetch shops" }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import db from "@/lib/db";
import Seller from "@/models/seller";

export async function GET(req) {
  try {
    await db.connect();

    const { searchParams } = new URL(req.url);
    // We don't strictly need lat/lng here because frontend does the math,
    // but we keep them in params in case you want to enable server-side sorting later.
    // const lat = searchParams.get("lat"); 
    // const lng = searchParams.get("lng");
    
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    // 1. Build the Filter Query
    let query = { 
      isShopOpen: true,        // Only show open shops
      isActive: true,          // Only admin-approved shops
      verificationStatus: "Approved" 
    };

    // 2. Text Search (Case-insensitive)
    if (search) {
      query.shopName = { $regex: search, $options: "i" };
    }

    // 3. Category Filter
    if (category && category !== "All") {
      query.shopType = category;
    }

    // 4. Fetch Shops
    // We explicitly exclude heavy/private fields, but ensure 'shopLocation' and 'deliveryRadius' are sent.
    const shops = await Seller.find(query)
      .sort({ createdAt: -1 }) // Newest shops first (Frontend will re-sort by distance)
      .select("-password -cnic -verificationDocs -stripeAccountId -verificationToken");

    return NextResponse.json({ success: true, count: shops.length, shops });

  } catch (error) {
    console.error("Shop Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch shops" }, { status: 500 });
  }
}
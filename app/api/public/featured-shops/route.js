// import { NextResponse } from "next/server";
// import db from "@/lib/db";
// import Seller from "@/models/seller";

// export async function GET() {
//   try {
//     await db.connect();

//     // --- UPDATED QUERY LOGIC ---
//     // Fetch 4 shops that are fully verified, approved, and active.
//     const shops = await Seller.find({ 
//         verificationStatus: "Approved", // Admin has approved documents
//         isVerified: true,               // Email is verified
//         isActive: true                  // Shop is currently active
//       }) 
//       .select("shopName shopType shopLogo shopAddress")
//       .sort({ createdAt: -1 })
//       .limit(4);

//     return NextResponse.json({ success: true, shops }, { status: 200 });
//   } catch (error) {
//     console.error("Featured Shops Error:", error);
//     return NextResponse.json({ success: false, shops: [] }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import db from "@/lib/db";
import Seller from "@/models/seller";

export async function GET() {
  try {
    await db.connect();

    // --- UPDATED QUERY LOGIC ---
    const shops = await Seller.find({ 
        verificationStatus: "Approved", 
        isVerified: true,               
        isActive: true                  
      }) 
      // ⚠️ IMPORTANT: Added 'shopLocation' and 'deliveryRadius' for map logic
      .select("shopName shopType shopLogo shopAddress shopLocation deliveryRadius")
      .sort({ createdAt: -1 })
      .limit(8); // Increased limit slightly to allow for distance sorting

    return NextResponse.json({ success: true, shops }, { status: 200 });
  } catch (error) {
    console.error("Featured Shops Error:", error);
    return NextResponse.json({ success: false, shops: [] }, { status: 500 });
  }
}
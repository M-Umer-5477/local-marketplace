import { NextResponse } from "next/server";
import db from "@/lib/db";
import Seller from "@/models/seller";
import { getServerSession } from "next-auth"; 
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
   

    await db.connect();
    const session = await getServerSession(authOptions);
        
            if (!session || session.user.role !== "admin") {
              return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
    // 2. Fetch all sellers where status is 'Pending' AND verification docs exist
    // We sort by newest first
    const pendingSellers = await Seller.find({ 
      verificationStatus: "Pending",
      isVerified:"true",
      role: "seller" 
    }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, sellers: pendingSellers }, { status: 200 });

  } catch (error) {
    console.error("Admin Fetch Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
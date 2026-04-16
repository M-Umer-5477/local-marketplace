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
    // 2. Fetch all sellers where status is 'Pending' OR 'Rejected' AND verification docs exist
    // We sort by newest first
    const allApplications = await Seller.find({ 
      verificationStatus: { $in: ["Pending", "Rejected"] },
      isVerified: true,
      role: "seller" 
    }).sort({ createdAt: -1 });

    const pendingSellers = allApplications.filter(s => s.verificationStatus === "Pending");
    const rejectedSellers = allApplications.filter(s => s.verificationStatus === "Rejected");

    return NextResponse.json({ success: true, pendingSellers, rejectedSellers }, { status: 200 });

  } catch (error) {
    console.error("Admin Fetch Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
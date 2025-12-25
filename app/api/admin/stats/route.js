import { NextResponse } from "next/server";
import db from "@/lib/db";
import Seller from "@/models/seller";
import Order from "@/models/order"; // Assuming you have an Order model
import User from "@/models/user";

export async function GET() {
  try {
    await db.connect();

    // 1. Fetch Counts
    const pendingVerifications = await Seller.countDocuments({ verificationStatus: "Pending", role: "seller" });
    const activeShops = await Seller.countDocuments({ isActive: true, role: "seller" });
    const totalCustomers = await User.countDocuments({ role: "customer" });

    // 2. Calculate Financials (Aggregation Pipeline)
    // Sum up the 'total' field of all orders where status is 'Delivered'
    const revenueStats = await Order.aggregate([
      { $match: { orderStatus: "Delivered" } },
      { $group: { _id: null, totalVolume: { $sum: "$total" } } }
    ]);
    
    // Total value of goods sold
    const grossVolume = revenueStats[0]?.totalVolume || 0;
    
    // Platform Revenue (1% Commission)
    const platformRevenue = grossVolume * 0.01;

    return NextResponse.json({ 
        success: true, 
        stats: {
            pendingVerifications,
            activeShops,
            totalCustomers,
            grossVolume,
            platformRevenue
        } 
    }, { status: 200 });

  } catch (error) {
    console.error("Admin Stats Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
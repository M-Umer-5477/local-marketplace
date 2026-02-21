import { NextResponse } from "next/server";
import db from "@/lib/db";
import Seller from "@/models/seller";
import Order from "@/models/order"; 
import User from "@/models/user";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
export async function GET() {
  try {
    await db.connect();
const session = await getServerSession(authOptions);
    
        if (!session || session.user.role !== "admin") {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    // 1. Basic Counts (Keep existing logic)
    const pendingVerifications = await Seller.countDocuments({ verificationStatus: "Pending", role: "seller" });
    const activeShops = await Seller.countDocuments({ isActive: true, role: "seller" });
    const totalCustomers = await User.countDocuments({ role: "customer" });

    // 2. Financial Aggregation (NEW: The Hybrid Economy Logic)
    // We filter out Cancelled orders to get real GMV and Revenue
    const financials = await Order.aggregate([
      { 
        $match: { 
            orderStatus: { $nin: ["Cancelled", "Pending"] } // Only confirmed/completed orders count towards revenue
        } 
      },
      {
        $group: {
          _id: null,
          totalGMV: { $sum: "$total" }, // Total money flowed through system
          platformRevenue: { $sum: "$commissionAmount" }, // Your actual Profit (Commission)
          totalOrders: { $count: {} }
        }
      }
    ]);

    const financialStats = financials[0] || { totalGMV: 0, platformRevenue: 0, totalOrders: 0 };

    // 3. Wallet Health (Who owes who?)
    const walletStats = await Seller.aggregate([
      {
        $group: {
          _id: null,
          // Money you owe sellers (Positive Balances from Stripe)
          totalSellerCredit: { 
             $sum: { $cond: [{ $gt: ["$walletBalance", 0] }, "$walletBalance", 0] }
          },
          // Money sellers owe you (Negative Balances from COD)
          totalSellerDebt: { 
             $sum: { $cond: [{ $lt: ["$walletBalance", 0] }, "$walletBalance", 0] }
          }
        }
      }
    ]);

    const wallet = walletStats[0] || { totalSellerCredit: 0, totalSellerDebt: 0 };

    return NextResponse.json({ 
        success: true, 
        stats: {
            pendingVerifications,
            activeShops,
            totalCustomers,
            
            // New Calculated Fields
            grossVolume: financialStats.totalGMV,
            platformRevenue: financialStats.platformRevenue,
            totalOrders: financialStats.totalOrders,
            
            // Wallet Data
            payableToSellers: wallet.totalSellerCredit,
            receivableFromSellers: Math.abs(wallet.totalSellerDebt) // Make positive for display
        } 
    }, { status: 200 });

  } catch (error) {
    console.error("Admin Stats Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import db from "@/lib/db";
import Seller from "@/models/seller";
import Order from "@/models/order"; 
import User from "@/models/user";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
  try {
    await db.connect();
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get date range from query params
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'all';
    
    let dateFilter = {};
    const now = new Date();
    
    if (range === 'today') {
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      dateFilter = { createdAt: { $gte: today } };
    } else if (range === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: weekAgo } };
    } else if (range === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: monthAgo } };
    }
    
    // 1. Basic Counts - always global (not affected by date range)
    const pendingVerifications = await Seller.countDocuments({ verificationStatus: "Pending", role: "seller" });
    const activeShops = await Seller.countDocuments({ isActive: true, role: "seller" });
    const totalCustomers = await User.countDocuments({ role: "customer" });

    // 2. Financial Aggregation with date filtering
    const financials = await Order.aggregate([
      { 
        $match: { 
          source: "online",
          orderStatus: { $nin: ["Cancelled", "Returned", "Not_Picked_Up", "Pending"] },
          ...dateFilter
        } 
      },
      {
        $group: {
          _id: null,
          totalGMV: { $sum: "$total" },
          platformRevenue: { $sum: "$commissionAmount" },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    const financialStats = financials[0] || { totalGMV: 0, platformRevenue: 0, totalOrders: 0 };

    const refundStatuses = ["Cancelled", "Returned", "Not_Picked_Up"];
    
    const pendingRefundsCount = await Order.countDocuments({
      source: "online",
      orderStatus: { $in: refundStatuses },
      isPaid: true,
      isRefunded: { $ne: true },
      ...dateFilter
    });

    const approvedRefundsCount = await Order.countDocuments({
      source: "online",
      orderStatus: { $in: refundStatuses },
      isPaid: true,
      isRefunded: true,
      ...dateFilter
    });

    const totalRefundsValue = await Order.aggregate([
      {
        $match: {
          source: "online",
          orderStatus: { $in: refundStatuses },
          isPaid: true,
          ...dateFilter
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" }
        }
      }
    ]);

    // Calculate overdue refunds (pending refunds older than 3 days)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const overdueRefundsCount = await Order.countDocuments({
      source: "online",
      orderStatus: { $in: refundStatuses },
      isPaid: true,
      isRefunded: { $ne: true },
      createdAt: { $lt: threeDaysAgo }
    });

    // 4. Seller Performance (Top 5 by revenue)
    const topSellers = await Order.aggregate([
      { 
        $match: { 
          source: "online",
          orderStatus: { $nin: ["Cancelled", "Returned", "Not_Picked_Up", "Pending"] },
          ...dateFilter
        }
      },
      { $group: { _id: "$shopId", revenue: { $sum: "$total" }, orderCount: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      { $lookup: { from: "sellers", localField: "_id", foreignField: "_id", as: "seller" } },
      { $unwind: "$seller" },
      { $project: { shopName: "$seller.shopName", revenue: 1, orderCount: 1 } }
    ]);

    // 5. Wallet Health - Calculate actual payables and receivables
    const walletBreakdown = await Seller.aggregate([
      {
        $group: {
          _id: null,
          totalPayable: { 
            $sum: { $cond: [{ $gt: ["$walletBalance", 0] }, "$walletBalance", 0] }
          },
          totalReceivable: { 
            $sum: { $cond: [{ $lt: ["$walletBalance", 0] }, { $multiply: ["$walletBalance", -1] }, 0] }
          }
        }
      }
    ]);

    const walletStats = walletBreakdown[0] || { totalPayable: 0, totalReceivable: 0 };

    const orderTrends = await Order.aggregate([
      { $match: { source: "online", ...dateFilter } },
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return NextResponse.json({ 
      success: true, 
      stats: {
        // Basic metrics
        pendingVerifications: pendingVerifications || 0,
        activeShops: activeShops || 0,
        totalCustomers: totalCustomers || 0,
        
        // Financial Data
        grossVolume: financialStats.totalGMV || 0,
        platformRevenue: financialStats.platformRevenue || 0,
        totalOrders: financialStats.totalOrders || 0,
        
        // Refund Data
        pendingRefunds: pendingRefundsCount || 0,
        totalRefundValue: totalRefundsValue[0]?.total || 0,
        issuedRefunds: approvedRefundsCount || 0,
        overdueRefunds: overdueRefundsCount || 0,
        
        // Seller Data
        topSellers: topSellers || [],
        
        // Wallet/Financial Position
        payableToSellers: walletStats.totalPayable || 0,
        receivableFromSellers: walletStats.totalReceivable || 0,
        
        // Trends
        orderTrends: orderTrends || []
      },
      range
    }, { status: 200 });

  } catch (error) {
    console.error("Admin Stats Error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch stats",
      stats: {
        pendingVerifications: 0,
        activeShops: 0,
        totalCustomers: 0,
        grossVolume: 0,
        platformRevenue: 0,
        totalOrders: 0,
        pendingRefunds: 0,
        totalRefundValue: 0,
        issuedRefunds: 0,
        overdueRefunds: 0,
        topSellers: [],
        payableToSellers: 0,
        receivableFromSellers: 0,
        orderTrends: []
      }
    }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import db from "@/lib/db";
import Order from "@/models/order";
import Product from "@/models/product";
import Seller from "@/models/seller";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    await db.connect();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const seller = await Seller.findOne({ email: session.user.email });
    if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });

    const shopId = seller._id;

    // --- Helper: Get date range ---
    const getTodayRange = () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      return { $gte: start, $lte: end };
    };

    const getYesterdayRange = () => {
      const start = new Date();
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      return { $gte: start, $lte: end };
    };

    const getThisMonthRange = () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { $gte: start, $lte: end };
    };

    const getLastMonthRange = () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { $gte: start, $lte: end };
    };

    // --- 1. KPIs Calculation ---
    const todayOrders = await Order.find({
      shopId,
      createdAt: getTodayRange(),
      orderStatus: { $ne: "Cancelled" }
    });

    const yesterdayOrders = await Order.find({
      shopId,
      createdAt: getYesterdayRange(),
      orderStatus: { $ne: "Cancelled" }
    });

    const todaySales = todayOrders.reduce((acc, order) => acc + order.total, 0);
    const yesterdaySales = yesterdayOrders.reduce((acc, order) => acc + order.total, 0);
    const newOrdersCount = todayOrders.filter(o => o.orderStatus === "Pending").length;
    
    const pendingTasks = await Order.countDocuments({
      shopId,
      orderStatus: { $in: ["Confirmed", "Preparing", "Out_for_Delivery", "Ready_for_Pickup"] }
    });

    // --- 1.5 Phase 1: Total Revenue & Comparison ---
    const thisMonthOrders = await Order.find({
      shopId,
      createdAt: getThisMonthRange(),
      orderStatus: { $ne: "Cancelled" }
    });

    const lastMonthOrders = await Order.find({
      shopId,
      createdAt: getLastMonthRange(),
      orderStatus: { $ne: "Cancelled" }
    });

    const totalMonthRevenue = thisMonthOrders.reduce((acc, order) => acc + order.total, 0);
    const lastMonthRevenue = lastMonthOrders.reduce((acc, order) => acc + order.total, 0);
    const monthRevenueChange = lastMonthRevenue > 0 ? ((totalMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : 0;

    // --- 1.6 Phase 1: Order Status Breakdown ---
    const orderStatusBreakdown = await Order.aggregate([
      { $match: { shopId } },
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = {
      Pending: 0,
      Confirmed: 0,
      Preparing: 0,
      Out_for_Delivery: 0,
      Ready_for_Pickup: 0,
      Delivered: 0,
      Picked_Up: 0,
      Cancelled: 0,
      Returned: 0
    };

    orderStatusBreakdown.forEach(status => {
      if (status._id in statusCounts) {
        statusCounts[status._id] = status.count;
      }
    });

    // --- 1.7 Phase 1: Performance Score ---
    const totalOrders = Object.values(statusCounts).reduce((a, b) => a + b, 0);
    const deliveredOrders = statusCounts.Delivered + statusCounts.Picked_Up;
    const cancelledOrders = statusCounts.Cancelled;
    const returnedOrders = statusCounts.Returned;

    const fulfillmentRate = totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : 0;
    const cancellationRate = totalOrders > 0 ? ((cancelledOrders / totalOrders) * 100).toFixed(1) : 0;

    // Simple performance score (0-100) based on fulfillment and cancellation
    const performanceScore = Math.max(0, 100 - (cancelledOrders * 5) - (returnedOrders * 3));
    const performanceRating = performanceScore >= 80 ? "Excellent" : performanceScore >= 60 ? "Good" : "Fair";

    // --- 2. Live Incoming Orders (Pending) ---
    const liveOrders = await Order.find({ shopId, orderStatus: "Pending" })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name"); // Get customer name

    // --- 3. Low Stock Items (< 10 units) ---
    const lowStockItems = await Product.find({ 
      shopId, 
      stock: { $lt: 10 } 
    }).limit(5).select("name stock unit");

    // --- 4. Weekly Sales Trend ---
    const weeklySalesTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const daySales = await Order.find({
        shopId,
        createdAt: { $gte: date, $lt: nextDate },
        orderStatus: { $ne: "Cancelled" }
      }).lean();

      const totalSales = daySales.reduce((acc, order) => acc + order.total, 0);
      weeklySalesTrend.push({ day: dayName, sales: totalSales });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          todaySales,
          todaySalesChange: yesterdaySales > 0 ? ((todaySales - yesterdaySales) / yesterdaySales * 100).toFixed(1) : 0,
          newOrders: newOrdersCount,
          pendingTasks,
          isOnline: seller.isShopOpen,
          totalMonthRevenue,
          monthRevenueChange
        },
        performanceScore: {
          score: performanceScore,
          rating: performanceRating,
          fulfillmentRate,
          cancellationRate
        },
        orderStatusBreakdown: statusCounts,
        liveOrders: liveOrders.map(o => ({
           id: o._id.toString().slice(-6).toUpperCase(),
           customer: o.userId?.name || "Guest",
           total: o.total,
           type: o.deliveryMode === 'home_delivery' ? 'Delivery' : 'Pickup',
           fullId: o._id
        })),
        lowStockItems: lowStockItems.map(p => ({
           name: p.name,
           stock: p.stock,
           unit: p.unit
        })),
        weeklySalesTrend
      }
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
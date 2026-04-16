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

    // --- Date Filter Logic ---
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'month';
    
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

    // Calculate Weekly Date Ranges
    const weeklyRanges = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      weeklyRanges.push({ i, date, nextDate, dayName });
    }

    // --- PARALLELIZE ALL QUERIES FOR MAX PERFORMANCE ---
    const [
      todayOrders,
      yesterdayOrders,
      pendingTasks,
      newOrdersCount,
      thisMonthOrders,
      lastMonthOrders,
      onlineOrdersLifetime,
      offlineOrdersLifetime,
      onlineStatusBreakdown,
      liveOrders,
      lowStockItems,
      ...weeklySalesData
    ] = await Promise.all([
      Order.find({ shopId, createdAt: getTodayRange(), orderStatus: { $ne: "Cancelled" } }).lean(),
      Order.find({ shopId, createdAt: getYesterdayRange(), orderStatus: { $ne: "Cancelled" } }).lean(),
      Order.countDocuments({ shopId, source: "online", orderStatus: { $in: ["Confirmed", "Preparing", "Out_for_Delivery", "Ready_for_Pickup"] } }),
      Order.countDocuments({ shopId, source: "online", orderStatus: "Pending" }),
      Order.find({ shopId, ...dateFilter, orderStatus: { $ne: "Cancelled" } }).lean(),
      Order.find({ shopId, createdAt: getLastMonthRange(), orderStatus: { $ne: "Cancelled" } }).lean(),
      Order.countDocuments({ shopId, source: "online", ...dateFilter }),
      Order.countDocuments({ shopId, source: "offline", ...dateFilter }),
      Order.aggregate([
        { $match: { shopId, source: "online", ...dateFilter } },
        { $group: { _id: "$orderStatus", count: { $sum: 1 } } }
      ]),
      Order.find({ shopId, source: "online", orderStatus: "Pending" })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId", "name")
        .lean(),
      Product.find({ shopId, stock: { $lt: 10 } })
        .limit(5)
        .select("name stock unit")
        .lean(),
      // 7. Weekly Omnichannel Sales Trend map
      ...weeklyRanges.map(range => 
         Order.find({
            shopId,
            createdAt: { $gte: range.date, $lt: range.nextDate },
            orderStatus: { $ne: "Cancelled" }
         }).lean()
      )
    ]);

    // --- Process Output ---
    const todaySalesTotal = todayOrders.reduce((acc, o) => acc + o.total, 0);
    const todaySalesOnline = todayOrders.filter(o => o.source === "online").reduce((acc, o) => acc + o.total, 0);
    const todaySalesOffline = todayOrders.filter(o => o.source === "offline").reduce((acc, o) => acc + o.total, 0);

    const yesterdaySales = yesterdayOrders.reduce((acc, o) => acc + o.total, 0);
    const todaySalesChange = yesterdaySales > 0 ? ((todaySalesTotal - yesterdaySales) / yesterdaySales * 100).toFixed(1) : 0;

    const totalMonthRevenue = thisMonthOrders.reduce((acc, o) => acc + o.total, 0);
    const monthOnlineRevenue = thisMonthOrders.filter(o => o.source === "online").reduce((acc, o) => acc + o.total, 0);
    const monthOfflineRevenue = thisMonthOrders.filter(o => o.source === "offline").reduce((acc, o) => acc + o.total, 0);

    const lastMonthRevenue = lastMonthOrders.reduce((acc, o) => acc + o.total, 0);
    const monthRevenueChange = lastMonthRevenue > 0 ? ((totalMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : 0;

    // Build Status counts map
    const statusCounts = {
      Pending: 0, Confirmed: 0, Preparing: 0, 
      Out_for_Delivery: 0, Ready_for_Pickup: 0, 
      Delivered: 0, Picked_Up: 0, Cancelled: 0, 
      Returned: 0, Not_Picked_Up: 0
    };

    onlineStatusBreakdown.forEach(status => {
      if (status._id in statusCounts) statusCounts[status._id] = status.count;
    });

    const totalOnlineOrders = Object.values(statusCounts).reduce((a, b) => a + b, 0);
    const deliveredOrders = statusCounts.Delivered + statusCounts.Picked_Up;
    const cancelledOrders = statusCounts.Cancelled;
    const returnedOrders = statusCounts.Returned + statusCounts.Not_Picked_Up;

    const fulfillmentRate = totalOnlineOrders > 0 ? ((deliveredOrders / totalOnlineOrders) * 100).toFixed(1) : 0;
    const cancellationRate = totalOnlineOrders > 0 ? ((cancelledOrders / totalOnlineOrders) * 100).toFixed(1) : 0;
    const performanceScore = Math.max(0, 100 - (cancelledOrders * 5) - (returnedOrders * 3));
    const performanceRating = performanceScore >= 80 ? "Excellent" : performanceScore >= 60 ? "Good" : "Fair";

    // Build Weekly Sales Payload
    const weeklySalesTrend = weeklyRanges.map((range, index) => {
      const daySales = weeklySalesData[index];
      const onlineDaily = daySales.filter(o => o.source === "online").reduce((acc, o) => acc + o.total, 0);
      const offlineDaily = daySales.filter(o => o.source === "offline").reduce((acc, o) => acc + o.total, 0);
      return { 
          day: range.dayName, 
          onlineSales: onlineDaily,
          offlineSales: offlineDaily,
          totalSales: onlineDaily + offlineDaily 
      };
    });
    
    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          todaySalesTotal,
          todaySalesOnline,
          todaySalesOffline,
          todaySalesChange,
          
          totalMonthRevenue,
          monthOnlineRevenue,
          monthOfflineRevenue,
          monthRevenueChange,
          
          newOrders: newOrdersCount,
          pendingTasks,
          isOnline: seller.isShopOpen,
        },
        omniChannelDist: {
            online: onlineOrdersLifetime,
            offline: offlineOrdersLifetime
        },
        performanceScore: {
          score: performanceScore,
          rating: performanceRating,
          fulfillmentRate,
          cancellationRate,
          totalScoredOrders: totalOnlineOrders
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
"use client";
import { useEffect, useState } from "react";
import { Loader2, TrendingUp, Users, Store, AlertCircle, DollarSign, Wallet, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("all");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/admin/stats?range=${range}`);
        const data = await res.json();
        if (data.success) setStats(data.stats);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [range]);

  if (loading) return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8">
      {/* Header with Date Filter */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h2>
          <p className="text-muted-foreground">Welcome back, Super Admin. Here is your financial pulse.</p>
        </div>
        <div className="flex gap-2">
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="today">Today</SelectItem>
              </SelectContent>
            </Select>
            <Link href="/admin/verifications">
                <Button className="shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white border-none">
                    Review Applications
                </Button>
            </Link>
        </div>
      </div>

      {/* 🚨 ACTION ALERTS SECTION */}
      <Card className="border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
            Immediate Actions Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link href="/admin/verifications" className="block">
              <Button variant="outline" className="w-full justify-start gap-2 text-left h-auto py-2 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-950">
                <span className="text-lg font-bold text-orange-600">{stats?.pendingVerifications}</span>
                <span className="text-sm">Pending Seller Applications</span>
              </Button>
            </Link>
            
            <Link href="/admin/refunds" className="block">
              <Button variant="outline" className="w-full justify-start gap-2 text-left h-auto py-2 border-red-200 hover:bg-red-50 dark:hover:bg-red-950">
                <span className="text-lg font-bold text-red-600">{stats?.pendingRefunds}</span>
                <span className="text-sm">Refunds 3+ Days Pending</span>
              </Button>
            </Link>

            <Link href="/admin/finance" className="block">
              <Button variant="outline" className="w-full justify-start gap-2 text-left h-auto py-2 border-yellow-200 hover:bg-yellow-50 dark:hover:bg-yellow-950">
                <span className="text-lg font-bold text-yellow-600">Rs. {stats?.payableToSellers?.toLocaleString?.() || 0}</span>
                <span className="text-sm">To Pay to Sellers</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Revenue Card */}
        <Card className="border-l-4 border-l-green-500 shadow-sm bg-card text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Platform Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">Rs. {(stats?.platformRevenue || 0)?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Commission from {stats?.totalOrders} orders</p>
          </CardContent>
        </Card>

        {/* GMV Card */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm bg-card text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Merchandise Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {(stats?.grossVolume || 0)?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats?.totalOrders} Completed Orders</p>
          </CardContent>
        </Card>

        {/* Pending Approvals Card */}
        <Card className="border-l-4 border-l-orange-500 shadow-sm bg-card text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingVerifications}</div>
            <p className="text-xs text-muted-foreground">Sellers waiting for review</p>
          </CardContent>
        </Card>

        {/* Active Shops Card */}
        <Card className="border-l-4 border-l-purple-500 shadow-sm bg-card text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shops</CardTitle>
            <Store className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeShops}</div>
            <p className="text-xs text-muted-foreground">{stats?.totalCustomers} Customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Refund & Wallet Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Refunds */}
        <Card className="border-l-4 border-l-red-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refund Activity</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Pending</span>
              <Badge variant="outline" className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400">{stats?.pendingRefunds}</Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Issued</span>
              <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400">{stats?.issuedRefunds}</Badge>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium">Total Value</span>
              <span className="font-bold">Rs. {(stats?.totalRefundValue || 0)?.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Health */}
        <Card className="border-l-4 border-l-blue-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Health</CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">We Owe Sellers</span>
              <span className="font-bold text-orange-600">Rs. {(stats?.payableToSellers || 0)?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Sellers Owe Us</span>
              <span className="font-bold text-green-600">Rs. {(stats?.receivableFromSellers || 0)?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium">Net Position</span>
              <span className={`font-bold ${stats?.payableToSellers > stats?.receivableFromSellers ? 'text-orange-600' : 'text-green-600'}`}>
                {stats?.payableToSellers > stats?.receivableFromSellers ? '+' : '-'} Rs. {Math.abs((stats?.payableToSellers || 0) - (stats?.receivableFromSellers || 0)).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Sellers Section */}
      {stats?.topSellers && stats.topSellers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Top Performing Sellers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topSellers.map((seller, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium">{seller.shopName}</p>
                      <p className="text-xs text-muted-foreground">{seller.orderCount} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">Rs. {seller.revenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Status Breakdown */}
      {stats?.orderTrends && (
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {stats.orderTrends.map((status) => (
                <div key={status._id} className="flex flex-col items-center p-3 bg-muted/20 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{status.count}</p>
                  <p className="text-xs text-muted-foreground text-center">{status._id?.replace(/_/g, ' ') || 'Unknown'}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

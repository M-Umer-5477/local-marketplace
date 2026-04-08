
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import Link from "next/link";
import { 
  Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from "recharts";
import { 
  Banknote, Package, ClipboardList, Store, AlertTriangle, Bell, ArrowRight, Loader2,
  TrendingUp, TrendingDown, Star, Eye, Plus, Settings, FileText, LogOut
} from "lucide-react";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SellerDashboardPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState("all");
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  // 1. Fetch Real Data
  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/vendor/analytics");
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error("Failed to load dashboard");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 2. Handle Shop Status Toggle
  const handleStoreStatusChange = async (isOnline) => {
    // Optimistic Update
    setData(prev => ({ ...prev, kpis: { ...prev.kpis, isOnline } }));
    
    try {
       await fetch("/api/seller/myshop", {
         method: "PUT",
         body: JSON.stringify({ isShopOpen: isOnline })
       });
       toast.success(isOnline ? "Store is now Online" : "Store is now Offline");
    } catch (error) {
       toast.error("Update failed");
    }
  };

  // 3. Quick Accept Action
  const handleQuickAccept = async (orderId) => {
     try {
        await fetch("/api/vendor/orders", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId, status: "Confirmed" }),
        });
        toast.success("Order Accepted");
        fetchDashboardData(); // Refresh data
     } catch (e) {
        toast.error("Error accepting order");
     }
  };

if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <AlertTriangle className="h-10 w-10 opacity-50" />
        <p>Dashboard unavailable.</p>
      </div>
    );
  }

  // Helper to format currency
  const formatCurrency = (amount) => `Rs ${amount.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  // Colors for performance rating
  const getPerformanceColor = (rating) => {
    switch(rating) {
      case "Excellent": return "text-green-600";
      case "Good": return "text-blue-600";
      default: return "text-yellow-600";
    }
  };

  // Chart Styling
  const chartAxisColor = resolvedTheme === 'dark' ? '#9ca3af' : '#4b5563'; 
  const chartGridColor = resolvedTheme === 'dark' ? '#374151' : '#e5e7eb'; 
  const chartBarColor = '#2563eb'; // Primary Blue

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 md:py-4 bg-background min-h-screen">
      
      {/* Header with Date Range Selector */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your shop's performance.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          {/* Date Range Selector */}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Store Status */}
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${data.kpis.isOnline ? 'text-green-600' : 'text-red-500'}`}>
                {data.kpis.isOnline ? 'Store Online' : 'Store Offline'}
            </span>
            <Switch checked={data.kpis.isOnline} onCheckedChange={handleStoreStatusChange} />
          </div>
        </div>
      </div>

      {/* Performance Score Card */}
      <Card className="border-blue-200 dark:border-blue-900/50 bg-linear-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-600" /> Shop Performance Score
              </CardTitle>
              <CardDescription>Your overall shop health and reliability</CardDescription>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${getPerformanceColor(data.performanceScore.rating)}`}>
                {Math.round(data.performanceScore.score)}
              </div>
              <Badge className="mt-1" variant="secondary">{data.performanceScore.rating}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Fulfillment Rate</p>
              <p className="text-2xl font-bold text-green-600">{data.performanceScore.fulfillmentRate}%</p>
            </div>
            <div className="bg-white dark:bg-slate-900/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Cancellation Rate</p>
              <p className="text-2xl font-bold text-orange-600">{data.performanceScore.cancellationRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Row - Enhanced with Trends */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Today's Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.kpis.todaySales)}</div>
            <div className="flex items-center gap-1 text-xs">
              {data.kpis.todaySalesChange >= 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-600">+{data.kpis.todaySalesChange}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-red-600">{data.kpis.todaySalesChange}%</span>
                </>
              )}
              <span className="text-muted-foreground">from yesterday</span>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.kpis.totalMonthRevenue)}</div>
            <div className="flex items-center gap-1 text-xs">
              {data.kpis.monthRevenueChange >= 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-600">+{data.kpis.monthRevenueChange}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-red-600">{data.kpis.monthRevenueChange}%</span>
                </>
              )}
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpis.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">Orders needing attention</p>
          </CardContent>
        </Card>
        
        {/* New Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Requests</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpis.newOrders}</div>
            <p className="text-xs text-muted-foreground">Pending confirmation</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards Row */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/vendor/manageProducts?action=add">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-2">
                <Plus className="h-8 w-8 text-blue-600" />
                <p className="font-medium text-sm">Add New Product</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/vendor/manageProducts">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-2">
                <Package className="h-8 w-8 text-green-600" />
                <p className="font-medium text-sm">Manage Inventory</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/vendor/myShop">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-2">
                <Store className="h-8 w-8 text-purple-600" />
                <p className="font-medium text-sm">View My Shop</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/vendor/wallet">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-2">
                <LogOut className="h-8 w-8 text-orange-600" />
                <p className="font-medium text-sm">Withdraw Earnings</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Recent Orders Table */}
        <Card className="lg:col-span-4 col-span-full md:col-span-full">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from your customers.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
             {data.liveOrders.length > 0 ? (
                 <div className="min-w-full">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden sm:table-cell">Order ID</TableHead>
                                <TableHead className="hidden md:table-cell">Customer</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.liveOrders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium hidden sm:table-cell">#{order.id}</TableCell>
                                    <TableCell className="hidden md:table-cell text-sm">{order.customer}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`text-xs ${order.type === 'Delivery' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-yellow-200 bg-yellow-50 text-yellow-700'}`}>
                                            {order.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-sm">{formatCurrency(order.total)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="ghost" className="text-xs" onClick={() => handleQuickAccept(order.fullId)}>Accept</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 </div>
             ) : (
                <div className="text-center py-8 text-muted-foreground">No new orders yet.</div>
             )}
          </CardContent>
          <CardFooter>
             <Link href="/vendor/orders" className="w-full">
                <Button variant="outline" className="w-full">View All Orders <ArrowRight className="ml-2 h-4 w-4" /></Button>
             </Link>
          </CardFooter>
        </Card>

        {/* Order Status Breakdown & Low Stock Column */}
        <div className="lg:col-span-3 col-span-full md:col-span-full space-y-4">
            
            {/* Order Status Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Order Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                    <div className="space-y-3">
                        {Object.entries(data.orderStatusBreakdown).filter(([_, count]) => count > 0).map(([status, count]) => {
                          const total = Object.values(data.orderStatusBreakdown).reduce((a, b) => a + b, 0);
                          const percentage = ((count / total) * 100).toFixed(0);
                          return (
                            <div key={status} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Badge variant="outline" className="min-w-fit text-xs sm:text-sm">{status.replace(/_/g, ' ')}</Badge>
                                <div className="flex-1 bg-muted rounded-full h-2 min-w-10">
                                  <div className="bg-blue-600 h-2 rounded-full" style={{width: `${percentage}%`}}></div>
                                </div>
                              </div>
                              <span className="text-sm font-medium whitespace-nowrap">{count} ({percentage}%)</span>
                            </div>
                          );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Low Stock Card */}
            <Card className="border-red-100 dark:border-red-900/50">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-red-600 text-sm sm:text-base">
                        <AlertTriangle className="h-4 w-4 shrink-0" /> Low Stock Alert
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-4 md:p-6">
                    {data.lowStockItems.length > 0 ? (
                        data.lowStockItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded-md gap-2">
                                <span className="truncate">{item.name}</span>
                                <span className="font-bold text-red-500 whitespace-nowrap">{item.stock} {item.unit}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">Inventory looks good.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
            {/* Sales Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Weekly Sales</CardTitle>
                </CardHeader>
                <CardContent className="pl-0">
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.weeklySalesTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                                <XAxis dataKey="day" stroke={chartAxisColor} fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    cursor={{fill: 'transparent'}}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Bar dataKey="sales" fill={chartBarColor} radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Order Type Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Delivery vs Pickup</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={[
                                    { name: 'Delivery', value: data.orderStatusBreakdown.Out_for_Delivery + data.orderStatusBreakdown.Delivered },
                                    { name: 'Pickup', value: data.orderStatusBreakdown.Ready_for_Pickup + data.orderStatusBreakdown.Picked_Up }
                                ]}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                <Cell fill="#3b82f6" />
                                <Cell fill="#8b5cf6" />
                            </Pie>
                            <Tooltip formatter={(value) => value.toLocaleString()} />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import Link from "next/link";
import { 
  Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from "recharts";
import { 
  Banknote, Package, ClipboardList, Store, AlertTriangle, Bell, ArrowRight ,Loader2
} from "lucide-react";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function SellerDashboardPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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
  // Chart Styling
  const chartAxisColor = resolvedTheme === 'dark' ? '#9ca3af' : '#4b5563'; 
  const chartGridColor = resolvedTheme === 'dark' ? '#374151' : '#e5e7eb'; 
  const chartBarColor = '#2563eb'; // Primary Blue

  return (
    <div className="flex-1 space-y-4 p-4 md:p-2 bg-background min-h-screen">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your shop's performance.</p>
        </div>
        <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${data.kpis.isOnline ? 'text-green-600' : 'text-red-500'}`}>
                {data.kpis.isOnline ? 'Store Online' : 'Store Offline'}
            </span>
            <Switch checked={data.kpis.isOnline} onCheckedChange={handleStoreStatusChange} />
        </div>
      </div>

      {/* KPIs Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs {data.kpis.todaySales.toLocaleString()}</div>
          </CardContent>
        </Card>

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Recent Orders Table */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from your customers.</CardDescription>
          </CardHeader>
          <CardContent>
             {data.liveOrders.length > 0 ? (
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.liveOrders.map(order => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">#{order.id}</TableCell>
                                <TableCell>{order.customer}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={order.type === 'Delivery' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-yellow-200 bg-yellow-50 text-yellow-700'}>
                                        {order.type}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">Rs {order.total}</TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" variant="ghost" onClick={() => handleQuickAccept(order.fullId)}>Accept</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
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

        {/* Low Stock & Chart Column */}
        <div className="lg:col-span-3 space-y-4">
            
            {/* Low Stock Card */}
            <Card className="border-red-100 dark:border-red-900/50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center text-red-600">
                        <AlertTriangle className="mr-2 h-4 w-4" /> Low Stock Alert
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {data.lowStockItems.length > 0 ? (
                        data.lowStockItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm p-2 bg-muted/50 rounded-md">
                                <span>{item.name}</span>
                                <span className="font-bold text-red-500">{item.stock} {item.unit}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">Inventory looks good.</p>
                    )}
                </CardContent>
            </Card>

            {/* Sales Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Weekly Sales</CardTitle>
                </CardHeader>
                <CardContent className="pl-0">
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.weeklySalesTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                                <XAxis dataKey="day" stroke={chartAxisColor} fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    cursor={{fill: 'transparent'}}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="sales" fill={chartBarColor} radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

        </div>
      </div>
    </div>
  );
}
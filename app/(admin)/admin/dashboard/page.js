"use client";
import { useEffect, useState } from "react";
import { Loader2, TrendingUp, Users, Store, AlertCircle, DollarSign, Wallet, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        if (data.success) setStats(data.stats);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h2>
          <p className="text-muted-foreground">Welcome back, Super Admin. Here is your financial pulse.</p>
        </div>
        <div className="flex gap-2">
            <Link href="/admin/verifications">
                <Button className="shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white border-none">
                    Review Applications
                </Button>
            </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* 1. Revenue Card - Green Theme */}
        <Card className="border-l-4 border-l-green-500 shadow-sm bg-card text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Platform Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">Rs. {stats?.platformRevenue?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Commission Earned</p>
          </CardContent>
        </Card>

        {/* 2. GMV - Blue Theme (Changed from Pending Approvals) */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm bg-card text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total GMV</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {stats?.grossVolume?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats?.totalOrders} Completed Orders</p>
          </CardContent>
        </Card>

        {/* 3. Pending Verifications - Orange Theme */}
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

        {/* 4. Active Shops - Purple Theme */}
        <Card className="border-l-4 border-l-purple-500 shadow-sm bg-card text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shops</CardTitle>
            <Store className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeShops}</div>
            <p className="text-xs text-muted-foreground">{stats?.totalCustomers} Registered Customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Second Row: Activity & Wallet Health */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Recent Activity (Placeholder) */}
        <Card className="col-span-4 shadow-sm bg-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-muted/40 rounded-lg border border-dashed border-muted-foreground/25">
                <TrendingUp className="mr-2 h-4 w-4" /> Live Order Feed Coming Soon
            </div>
          </CardContent>
        </Card>
        
        {/* WALLET HEALTH (NEW: Replaces System Health) */}
        <Card className="col-span-3 shadow-sm bg-card border-t-4 border-t-indigo-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-indigo-600"/> 
                Wallet Settlements
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-6 pt-2">
                 
                 {/* Money you need to pay OUT (Stripe money belonging to sellers) */}
                 <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                     <div className="flex items-center gap-3">
                         <div className="bg-red-100 p-2 rounded-full text-red-600">
                            <ArrowUpRight className="h-4 w-4" />
                         </div>
                         <div>
                             <p className="text-sm font-medium text-red-900 dark:text-red-200">You Owe Sellers</p>
                             <p className="text-xs text-red-600 dark:text-red-400">Pending Payouts</p>
                         </div>
                     </div>
                     <span className="text-xl font-bold text-red-700 dark:text-red-400">
                        Rs. {stats?.payableToSellers?.toLocaleString()}
                     </span>
                 </div>

                 {/* Money you need to COLLECT (Cash commissions) */}
                 <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                     <div className="flex items-center gap-3">
                         <div className="bg-green-100 p-2 rounded-full text-green-600">
                            <ArrowDownLeft className="h-4 w-4" />
                         </div>
                         <div>
                             <p className="text-sm font-medium text-green-900 dark:text-green-200">Sellers Owe You</p>
                             <p className="text-xs text-green-600 dark:text-green-400">Pending Collections</p>
                         </div>
                     </div>
                     <span className="text-xl font-bold text-green-700 dark:text-green-400">
                        Rs. {stats?.receivableFromSellers?.toLocaleString()}
                     </span>
                 </div>

             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
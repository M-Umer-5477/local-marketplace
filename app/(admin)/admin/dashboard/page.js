"use client";
import { useEffect, useState } from "react";
import { Loader2, TrendingUp, Users, Store, AlertCircle, DollarSign } from "lucide-react";
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
          <p className="text-muted-foreground">Welcome back, Super Admin. Here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
            {/* Quick Action Buttons */}
            <Link href="/admin/verifications">
                {/* Added 'text-white' to ensure readability on both themes */}
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
            <CardTitle className="text-sm font-medium">Total Platform Revenue</CardTitle>
            {/* Dark mode: use lighter green (400) */}
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {stats?.platformRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">1% of Rs. {stats?.grossVolume.toLocaleString()} volume</p>
          </CardContent>
        </Card>

        {/* 2. Pending Verifications - Orange Theme */}
        <Card className="border-l-4 border-l-orange-500 shadow-sm bg-card text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            {/* Dark mode: use lighter orange (400) */}
            <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingVerifications}</div>
            <p className="text-xs text-muted-foreground">Sellers waiting for review</p>
          </CardContent>
        </Card>

        {/* 3. Active Shops - Blue Theme */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm bg-card text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shops</CardTitle>
            {/* Dark mode: use lighter blue (400) */}
            <Store className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeShops}</div>
            <p className="text-xs text-muted-foreground">Live on platform</p>
          </CardContent>
        </Card>

        {/* 4. Total Customers - Purple Theme */}
        <Card className="border-l-4 border-l-purple-500 shadow-sm bg-card text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            {/* Dark mode: use lighter purple (400) */}
            <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for Next Graph/Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
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
        
        <Card className="col-span-3 shadow-sm bg-card">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                 <div className="flex items-center justify-between">
                     <span className="text-sm text-muted-foreground">Database Status</span>
                     <span className="text-sm text-green-600 dark:text-green-400 font-bold">Connected</span>
                 </div>
                 <div className="flex items-center justify-between">
                     <span className="text-sm text-muted-foreground">Email Server</span>
                     <span className="text-sm text-green-600 dark:text-green-400 font-bold">Operational</span>
                 </div>
                 <div className="flex items-center justify-between">
                     <span className="text-sm text-muted-foreground">Current Version</span>
                     <span className="text-sm font-mono text-foreground">v1.2.0 (Premium)</span>
                 </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
// "use client";
// import { useEffect, useState } from "react";
// import { Loader2, TrendingUp, Users, Store, AlertCircle, DollarSign } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";

// export default function AdminDashboardPage() {
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const res = await fetch("/api/admin/stats");
//         const data = await res.json();
//         if (data.success) setStats(data.stats);
//       } catch (error) {
//         console.error(error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchStats();
//   }, []);

//   if (loading) return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

//   return (
//     <div className="space-y-8">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
//         <div>
//           <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
//           <p className="text-muted-foreground">Welcome back, Super Admin. Here's what's happening today.</p>
//         </div>
//         <div className="flex gap-2">
//             {/* Quick Action Buttons */}
//             <Link href="/admin/verifications">
//                 <Button className="shadow-lg bg-indigo-600 hover:bg-indigo-700">Review Applications</Button>
//             </Link>
//         </div>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
//         {/* 1. Revenue Card */}
//         <Card className="border-l-4 border-l-green-500 shadow-sm">
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Platform Revenue</CardTitle>
//             <DollarSign className="h-4 w-4 text-green-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">Rs. {stats?.platformRevenue.toLocaleString()}</div>
//             <p className="text-xs text-muted-foreground">1% of Rs. {stats?.grossVolume.toLocaleString()} volume</p>
//           </CardContent>
//         </Card>

//         {/* 2. Pending Verifications (Critical) */}
//         <Card className="border-l-4 border-l-orange-500 shadow-sm">
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
//             <AlertCircle className="h-4 w-4 text-orange-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{stats?.pendingVerifications}</div>
//             <p className="text-xs text-muted-foreground">Sellers waiting for review</p>
//           </CardContent>
//         </Card>

//         {/* 3. Active Shops */}
//         <Card className="border-l-4 border-l-blue-500 shadow-sm">
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Active Shops</CardTitle>
//             <Store className="h-4 w-4 text-blue-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{stats?.activeShops}</div>
//             <p className="text-xs text-muted-foreground">Live on platform</p>
//           </CardContent>
//         </Card>

//         {/* 4. Total Customers */}
//         <Card className="border-l-4 border-l-purple-500 shadow-sm">
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
//             <Users className="h-4 w-4 text-purple-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{stats?.totalCustomers}</div>
//             <p className="text-xs text-muted-foreground">Registered users</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Placeholder for Next Graph/Section */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
//         <Card className="col-span-4 shadow-sm">
//           <CardHeader>
//             <CardTitle>Recent Activity</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
//                 <TrendingUp className="mr-2 h-4 w-4" /> Live Order Feed Coming Soon
//             </div>
//           </CardContent>
//         </Card>
//         <Card className="col-span-3 shadow-sm">
//           <CardHeader>
//             <CardTitle>System Health</CardTitle>
//           </CardHeader>
//           <CardContent>
//              <div className="space-y-4">
//                  <div className="flex items-center justify-between">
//                      <span className="text-sm">Database Status</span>
//                      <span className="text-sm text-green-600 font-bold">Connected</span>
//                  </div>
//                  <div className="flex items-center justify-between">
//                      <span className="text-sm">Email Server</span>
//                      <span className="text-sm text-green-600 font-bold">Operational</span>
//                  </div>
//                  <div className="flex items-center justify-between">
//                      <span className="text-sm">Current Version</span>
//                      <span className="text-sm font-mono">v1.2.0 (Premium)</span>
//                  </div>
//              </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
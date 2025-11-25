"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, Package, ClipboardList, Store, AlertTriangle, Bell } from "lucide-react";
import { useTheme } from "next-themes"; // Import useTheme for chart coloring

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


// Mock Data structure for development - this will be replaced by the API call
const mockDashboardData = {
  kpis: {
    todaySales: 14250,
    newOrders: 12,
    pendingTasks: 5,
    isOnline: true,
  },
  liveOrders: [
    { id: "#1234", customer: "Ali Hassan", total: 850, type: "Delivery" },
    { id: "#1233", customer: "Fatima Jutt", total: 1500, type: "Pickup" },
    { id: "#1232", customer: "Usman Ghani", total: 320, type: "Delivery" },
  ],
  lowStockItems: [
    { name: "Milkpak 1 Litre", stock: 2, unit: "units" },
    { name: "Onions (Pyaz)", stock: 1.5, unit: "kg" },
    { name: "Lays French Cheese", stock: 4, unit: "units" },
    { name: "Shan Chana Masala 50g", stock: 8, unit: "units" },
  ],
  weeklySalesTrend: [
    { day: "Mon", sales: 11500 },
    { day: "Tue", sales: 13200 },
    { day: "Wed", sales: 9800 },
    { day: "Thu", sales: 16400 },
    { day: "Fri", sales: 18900 },
    { day: "Sat", sales: 12100 },
    { day: "Sun", sales: 14250 },
  ],
};


export default function SellerDashboardPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 1. Hook to get the current resolved theme
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setTimeout(() => {
      setData(mockDashboardData);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Handle store online/offline toggle
  const handleStoreStatusChange = (isOnline) => {
    setData(prevData => ({
      ...prevData,
      kpis: { ...prevData.kpis, isOnline }
    }));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen text-foreground">Loading dashboard...</div>;
  }
  
  if (!data) {
    return <div className="flex items-center justify-center h-screen text-foreground">Could not load dashboard data.</div>;
  }
  
  // 2. Define Chart Colors based on theme
  const chartAxisColor = resolvedTheme === 'dark' ? 'hsl(0 0% 87%)' : 'hsl(0 0% 25%)'; // Bright white/Light gray in dark mode
  
  // FIX: Significantly increased visibility of grid lines in Dark Mode
  const chartGridColor = resolvedTheme === 'dark' ? 'hsl(0 0% 25%)' : 'hsl(0 0% 90%)'; // Darker Gray (L=25) in dark mode
  
  const chartBarColor = 'hsl(var(--primary))';


  return (
    // FIX: Changed bg-muted/40 to bg-background to achieve a uniform deep color across the whole dashboard area
    <div className="flex-1 space-y-4 sm:p-4 md:p-4 bg-background">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">
            Sunday, 19 October 2025 - Here's a summary of your shop's activity today.
          </p>
        </div>
      </div>

      {/* KPIs Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Cards use semantic colors automatically */}
        <Card className="shadow-sm"> 
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs {data.kpis.todaySales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+5.2% from yesterday</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Orders</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{data.kpis.newOrders}</div>
            <p className="text-xs text-muted-foreground">Ready to be prepared</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpis.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">Orders currently in preparation</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Store Status</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span 
              className={`text-lg font-semibold ${
                data.kpis.isOnline 
                  ? 'text-[--color-chart-2]' // Success/Online color
                  : 'text-destructive'
              }`}
            >
              {data.kpis.isOnline ? 'Online' : 'Offline'}
            </span>
            <Switch checked={data.kpis.isOnline} onCheckedChange={handleStoreStatusChange} />
          </CardContent>
        </Card>
      </div>

      {/* Actionable Lists Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <Bell className="h-5 w-5 mr-2 animate-pulse text-[--color-chart-2]" />
              Live Incoming Orders
            </CardTitle>
            <CardDescription>Accept new orders as they arrive.</CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.liveOrders.map(order => (
                        <TableRow key={order.id}>
                            <TableCell>
                                <div className="font-medium">{order.customer}</div>
                                <div className="hidden text-sm text-muted-foreground md:inline">{order.id}</div>
                            </TableCell>
                            <TableCell><Badge variant={order.type === 'Delivery' ? 'default' : 'secondary'}>{order.type}</Badge></TableCell>
                            <TableCell className="text-right">Rs {order.total.toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                                <Button size="sm">Accept</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>Restock these items to avoid losing sales.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.lowStockItems.map(item => (
                <div 
                  key={item.name} 
                  className="flex items-center justify-between mb-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                    <p className="text-sm font-medium">{item.name}</p>
                    <Badge variant="destructive">{item.stock} {item.unit} left</Badge>
                </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button className="w-full">Manage Full Inventory</Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Chart Row */}
      <div className="grid gap-4 grid-cols-1">
        <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Weekly Sales Trend</CardTitle>
              <CardDescription>Comparison of sales over the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data.weeklySalesTrend}>
                        {/* FIX: Grid lines are now brighter in dark mode (L=25), making them clearly visible */}
                        <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} /> 
                        
                        {/* Axis text color is dynamically set */}
                        <XAxis 
                          dataKey="day" 
                          stroke={chartAxisColor} 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false} 
                          tick={{ fill: chartAxisColor }}
                        />
                        <YAxis 
                          stroke={chartAxisColor} 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(value) => `Rs ${value/1000}k`} 
                          tick={{ fill: chartAxisColor }}
                        />
                        
                        {/* Tooltip background fill */}
                        <Tooltip contentStyle={{ 
                            backgroundColor: resolvedTheme === 'dark' ? 'hsl(0 0% 10%)' : 'white',
                            border: `1px solid ${chartGridColor}`,
                            color: chartAxisColor 
                        }} 
                        labelStyle={{ color: chartAxisColor }}
                        cursor={{fill: 'hsl(var(--muted))', fillOpacity: 0.5}}
                        />
                        
                        <Bar dataKey="sales" fill={chartBarColor} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
// "use client";

// import { useEffect, useState } from "react";
// import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
// import { Switch } from "@/components/ui/switch";
// import { Badge } from "@/components/ui/badge";
// import { IndianRupee, Package, ClipboardList, Store, AlertTriangle, Bell } from "lucide-react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// // Mock Data structure for development - this will be replaced by the API call
// const mockDashboardData = {
//   kpis: {
//     todaySales: 14250,
//     newOrders: 12,
//     pendingTasks: 5,
//     isOnline: true,
//   },
//   liveOrders: [
//     { id: "#1234", customer: "Ali Hassan", total: 850, type: "Delivery" },
//     { id: "#1233", customer: "Fatima Jutt", total: 1500, type: "Pickup" },
//     { id: "#1232", customer: "Usman Ghani", total: 320, type: "Delivery" },
//   ],
//   lowStockItems: [
//     { name: "Milkpak 1 Litre", stock: 2, unit: "units" },
//     { name: "Onions (Pyaz)", stock: 1.5, unit: "kg" },
//     { name: "Lays French Cheese", stock: 4, unit: "units" },
//     { name: "Shan Chana Masala 50g", stock: 8, unit: "units" },
//   ],
//   weeklySalesTrend: [
//     { day: "Mon", sales: 11500 },
//     { day: "Tue", sales: 13200 },
//     { day: "Wed", sales: 9800 },
//     { day: "Thu", sales: 16400 },
//     { day: "Fri", sales: 18900 },
//     { day: "Sat", sales: 12100 },
//     { day: "Sun", sales: 14250 },
//   ],
// };


// export default function SellerDashboardPage() {
//   const [data, setData] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     // In a real application, you would fetch data from your API here
//     // fetch('/api/vendor/dashboard-summary')
//     //   .then(res => res.json())
//     //   .then(apiData => {
//     //     setData(apiData);
//     //     setIsLoading(false);
//     //   });
    
//     // For now, we use mock data after a short delay to simulate loading
//     setTimeout(() => {
//       setData(mockDashboardData);
//       setIsLoading(false);
//     }, 1000);
//   }, []);

//   // Handle store online/offline toggle
//   const handleStoreStatusChange = (isOnline) => {
//     setData(prevData => ({
//       ...prevData,
//       kpis: { ...prevData.kpis, isOnline }
//     }));
//     // Here you would also make an API call to update the status in the database
//     // POST /api/vendor/shop-status { isOnline }
//   };

//   if (isLoading) {
//     return <div className="flex items-center justify-center h-screen">Loading dashboard...</div>;
//   }
  
//   if (!data) {
//      return <div className="flex items-center justify-center h-screen">Could not load dashboard data.</div>;
//   }

//   return (
//     <div className="flex-1 space-y-4 p-4 md:  bg-gray-50/50">
//       <div className="flex items-center justify-between space-y-2">
//         <div>
//             <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
//             <p className="text-muted-foreground">
//                 Sunday, 19 October 2025 - Here's a summary of your shop's activity today.
//             </p>
//         </div>
//       </div>

//       {/* KPIs Row */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
//             <h1 className="h-4 w-4 text-muted-foreground" >Rs</h1>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">Rs {data.kpis.todaySales.toLocaleString()}</div>
//             <p className="text-xs text-muted-foreground">+5.2% from yesterday</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">New Orders</CardTitle>
//             <ClipboardList className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">+{data.kpis.newOrders}</div>
//             <p className="text-xs text-muted-foreground">Ready to be prepared</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
//             <Package className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{data.kpis.pendingTasks}</div>
//             <p className="text-xs text-muted-foreground">Orders currently in preparation</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Store Status</CardTitle>
//             <Store className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent className="flex items-center justify-between">
//             <span className={`text-lg font-semibold ${data.kpis.isOnline ? 'text-green-600' : 'text-red-600'}`}>
//               {data.kpis.isOnline ? 'Online' : 'Offline'}
//             </span>
//             <Switch checked={data.kpis.isOnline} onCheckedChange={handleStoreStatusChange} />
//           </CardContent>
//         </Card>
//       </div>

//       {/* Actionable Lists Row */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
//         <Card className="lg:col-span-4">
//           <CardHeader>
//             <CardTitle className="flex items-center">
//               <Bell className="h-5 w-5 mr-2 animate-pulse text-green-500" />
//               Live Incoming Orders
//             </CardTitle>
//             <CardDescription>Accept new orders as they arrive.</CardDescription>
//           </CardHeader>
//           <CardContent>
//              <Table>
//                 <TableHeader>
//                     <TableRow>
//                         <TableHead>Customer</TableHead>
//                         <TableHead>Type</TableHead>
//                         <TableHead className="text-right">Amount</TableHead>
//                         <TableHead className="text-right">Actions</TableHead>
//                     </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                     {data.liveOrders.map(order => (
//                         <TableRow key={order.id}>
//                             <TableCell>
//                                 <div className="font-medium">{order.customer}</div>
//                                 <div className="hidden text-sm text-muted-foreground md:inline">{order.id}</div>
//                             </TableCell>
//                             <TableCell><Badge variant={order.type === 'Delivery' ? 'default' : 'secondary'}>{order.type}</Badge></TableCell>
//                             <TableCell className="text-right">Rs {order.total.toLocaleString()}</TableCell>
//                             <TableCell className="text-right">
//                                 <Button size="sm">Accept</Button>
//                             </TableCell>
//                         </TableRow>
//                     ))}
//                 </TableBody>
//             </Table>
//           </CardContent>
//         </Card>
//         <Card className="lg:col-span-3">
//           <CardHeader>
//             <CardTitle className="flex items-center text-amber-600">
//                 <AlertTriangle className="h-5 w-5 mr-2" />
//                 Low Stock Alert
//             </CardTitle>
//             <CardDescription>Restock these items to avoid losing sales.</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {data.lowStockItems.map(item => (
//                 <div key={item.name} className="flex items-center justify-between mb-2 p-2 rounded-lg hover:bg-gray-100">
//                     <p className="text-sm font-medium">{item.name}</p>
//                     <Badge variant="destructive">{item.stock} {item.unit} left</Badge>
//                 </div>
//             ))}
//           </CardContent>
//           <CardFooter>
//             <Button className="w-full">Manage Full Inventory</Button>
//           </CardFooter>
//         </Card>
//       </div>
      
//        {/* Chart Row */}
//       <div className="grid gap-4 grid-cols-1">
//         <Card>
//             <CardHeader>
//                 <CardTitle>Weekly Sales Trend</CardTitle>
//                 <CardDescription>Comparison of sales over the last 7 days.</CardDescription>
//             </CardHeader>
//             <CardContent className="pl-2">
//                 <ResponsiveContainer width="100%" height={350}>
//                     <BarChart data={data.weeklySalesTrend}>
//                         <CartesianGrid strokeDasharray="3 3" />
//                         <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
//                         <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs ${value/1000}k`} />
//                         <Tooltip cursor={{fill: 'rgba(240, 240, 240, 0.5)'}} />
//                         <Bar dataKey="sales" fill="#16a34a" radius={[4, 4, 0, 0]} />
//                     </BarChart>
//                 </ResponsiveContainer>
//             </CardContent>
//         </Card>
//       </div>

//     </div>
//   );
// }
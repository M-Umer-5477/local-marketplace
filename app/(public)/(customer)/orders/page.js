"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Loader2, Package, ChevronRight, Clock, MapPin, 
  Store, ShoppingBag, Calendar 
} from "lucide-react";

// ShadCN Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/customer/order");
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  // Filter Orders
  const activeOrders = orders.filter(o => 
    ["Pending", "Confirmed", "Preparing", "Out_for_Delivery"].includes(o.orderStatus)
  );
  
  const pastOrders = orders.filter(o => 
    ["Delivered", "Cancelled"].includes(o.orderStatus)
  );

  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <Button variant="outline" onClick={() => router.push("/shops")}>
            Start Shopping
          </Button>
        </div>

        {orders.length === 0 ? (
          <EmptyState />
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
              <TabsTrigger value="active">Active ({activeOrders.length})</TabsTrigger>
              <TabsTrigger value="past">History</TabsTrigger>
            </TabsList>

            {/* --- ACTIVE ORDERS TAB --- */}
            <TabsContent value="active" className="mt-6 space-y-4">
              {activeOrders.length > 0 ? (
                activeOrders.map((order) => (
                  <OrderListItem key={order._id} order={order} isActive={true} />
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-dashed">
                  <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  No active orders right now.
                </div>
              )}
            </TabsContent>

            {/* --- PAST ORDERS TAB --- */}
            <TabsContent value="past" className="mt-6 space-y-4">
              {pastOrders.length > 0 ? (
                pastOrders.map((order) => (
                  <OrderListItem key={order._id} order={order} isActive={false} />
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-dashed">
                  <Clock className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  No past orders found.
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: ORDER CARD ---
function OrderListItem({ order, isActive }) {
  // Determine Status Color
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-yellow-500 hover:bg-yellow-600";
      case "Confirmed": return "bg-blue-500 hover:bg-blue-600";
      case "Out_for_Delivery": return "bg-purple-500 hover:bg-purple-600";
      case "Delivered": return "bg-green-600 hover:bg-green-600";
      case "Cancelled": return "bg-red-500 hover:bg-red-600";
      default: return "bg-gray-500";
    }
  };

  return (
    <Link href={`/orders/${order._id}`} className="block">
      <Card className="hover:shadow-md transition-shadow group cursor-pointer border-l-4" style={{ borderLeftColor: isActive ? '#3b82f6' : '#9ca3af' }}>
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Left: Shop Info & Items */}
            <div className="flex gap-4">
              {/* Shop Logo / Icon */}
              <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center shrink-0 overflow-hidden border">
                 {order.shopId?.shopLogo ? (
                    <img src={order.shopId.shopLogo} alt="Shop" className="h-full w-full object-cover" />
                 ) : (
                    <Store className="h-6 w-6 text-muted-foreground" />
                 )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                   <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                     {order.shopId?.shopName || "Unknown Shop"}
                   </h3>
                   <Badge className={`${getStatusColor(order.orderStatus)} text-xs px-2 py-0.5`}>
                     {order.orderStatus.replace(/_/g, " ")}
                   </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-1">
                   {order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                   <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(order.createdAt).toLocaleDateString()}
                   </span>
                   <span className="font-semibold text-foreground">
                      Rs. {order.total}
                   </span>
                </div>
              </div>
            </div>

            {/* Right: Action Chevron */}
            <div className="hidden md:flex items-center text-muted-foreground group-hover:text-primary">
                <span className="text-sm font-medium mr-2">View Details</span>
                <ChevronRight className="h-5 w-5" />
            </div>

          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// --- SUB-COMPONENT: EMPTY STATE ---
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="bg-muted p-6 rounded-full mb-4">
        <ShoppingBag className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold">No orders yet</h2>
      <p className="text-muted-foreground mb-6">Looks like you haven't placed any orders yet.</p>
      <Link href="/shops">
        <Button size="lg">Start Shopping</Button>
      </Link>
    </div>
  );
}
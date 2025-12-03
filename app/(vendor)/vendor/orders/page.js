"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { 
  Loader2, Package, CheckCircle2, Clock, Truck, XCircle, 
  MapPin, Phone, MessageCircle, RefreshCw 
} from "lucide-react";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // Tracks which order is updating

  // 1. Fetch Orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vendor/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. Update Status Handler
  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const res = await fetch("/api/vendor/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Order marked as ${newStatus}`);
        // Optimistic UI Update (Update local state instantly)
        setOrders((prev) => 
          prev.map((o) => o._id === orderId ? { ...o, orderStatus: newStatus } : o)
        );
      } else {
        toast.error("Update failed");
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setUpdating(null);
    }
  };

  // 3. Smart WhatsApp Handler (Rider Handover)
 // 3. Smart WhatsApp Handler (Rider Handover)
  const shareWithRider = (order) => {
    const address = order.deliveryAddress?.address || "Pickup";
    const city = order.deliveryAddress?.city || "";
    
    // FIX: Get Name/Phone from the populated 'userId' object, NOT deliveryAddress
    const customerName = order.userId?.name || "Customer";
    const customerPhone = order.userId?.phone || "N/A";

    const message = `
📦 *New Delivery for ShopSync*
*Order ID:* #${order._id.slice(-6).toUpperCase()}
*Customer:* ${customerName}
*Phone:* ${customerPhone}
*Amount to Collect:* Rs. ${order.total} (${order.paymentMethod})

📍 *Address:* ${address}, ${city}

Please deliver ASAP.
    `.trim();

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // Separate Orders into Active vs History
  const activeOrders = orders.filter(o => !["Delivered", "Cancelled"].includes(o.orderStatus));
  const historyOrders = orders.filter(o => ["Delivered", "Cancelled"].includes(o.orderStatus));

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground">Manage and track customer orders.</p>
        </div>
        <Button variant="outline" onClick={fetchOrders} size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="active">Active Orders ({activeOrders.length})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
           {activeOrders.length === 0 ? (
             <EmptyState />
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {activeOrders.map((order) => (
                 <OrderCard 
                    key={order._id} 
                    order={order} 
                    onUpdate={handleStatusUpdate} 
                    updating={updating === order._id}
                    onShare={shareWithRider}
                 />
               ))}
             </div>
           )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
           <div className="space-y-4">
             {historyOrders.map((order) => (
                 <div key={order._id} className="flex justify-between items-center p-4 border rounded-lg bg-card/50">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold">#{order._id.slice(-6).toUpperCase()}</span>
                            <Badge variant="outline">{order.orderStatus}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold">Rs. {order.total}</p>
                        <p className="text-xs text-muted-foreground">{order.items.length} items</p>
                    </div>
                 </div>
             ))}
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// --- SUB-COMPONENT: ORDER CARD ---
function OrderCard({ order, onUpdate, updating, onShare }) {
  const isDelivery = order.deliveryMode === 'home_delivery';

  return (
    <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
           <div>
              <CardTitle className="text-lg">#{order._id.slice(-6).toUpperCase()}</CardTitle>
              <span className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</span>
           </div>
           <Badge className={
             order.orderStatus === "Pending" ? "bg-yellow-500" :
             order.orderStatus === "Confirmed" ? "bg-blue-500" :
             order.orderStatus === "Preparing" ? "bg-orange-500" : "bg-purple-600"
           }>
             {order.orderStatus}
           </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 pb-3">
        {/* Items Summary */}
        <div className="space-y-1">
           {order.items.slice(0, 3).map((item, i) => (
             <div key={i} className="flex justify-between text-sm">
                <span><span className="font-bold">x{item.quantity}</span> {item.name}</span>
                <span className="text-muted-foreground">Rs. {item.subtotal}</span>
             </div>
           ))}
           {order.items.length > 3 && (
             <p className="text-xs text-muted-foreground pt-1">...and {order.items.length - 3} more</p>
           )}
        </div>
        
        {/* Delivery Details */}
        <div className="bg-muted/40 p-3 rounded-md text-sm space-y-1">
           <div className="flex items-start gap-2">
              {isDelivery ? <MapPin className="h-4 w-4 mt-0.5 text-primary"/> : <Store className="h-4 w-4 mt-0.5 text-primary"/>}
              <div className="flex-1">
                 <p className="font-semibold">{isDelivery ? "Home Delivery" : "Store Pickup"}</p>
                 {isDelivery && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                        {order.deliveryAddress?.address}, {order.deliveryAddress?.city}
                    </p>
                 )}
              </div>
           </div>
           <div className="flex items-center gap-2 pt-1">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{order.deliveryAddress?.phone || "No phone"}</span>
           </div>
        </div>

        {/* Payment */}
        <div className="flex justify-between items-center pt-2 border-t">
           <span className="text-sm font-medium text-muted-foreground">Total (COD)</span>
           <span className="text-lg font-bold">Rs. {order.total}</span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 pt-0">
         {/* Action: Update Status */}
         <div className="grid grid-cols-2 gap-2 w-full">
            {order.orderStatus === "Pending" ? (
                <>
                    <Button 
                        variant="outline" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onUpdate(order._id, "Cancelled")}
                        disabled={updating}
                    >
                        Reject
                    </Button>
                    <Button 
                        onClick={() => onUpdate(order._id, "Confirmed")}
                        disabled={updating}
                    >
                        {updating ? <Loader2 className="animate-spin h-4 w-4"/> : "Accept"}
                    </Button>
                </>
            ) : (
                <Select 
                    disabled={updating} 
                    onValueChange={(val) => onUpdate(order._id, val)} 
                    defaultValue={order.orderStatus}
                >
                    <SelectTrigger className="col-span-2">
                        <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                        <SelectItem value="Preparing">Preparing</SelectItem>
                        <SelectItem value="Out_for_Delivery">Out for Delivery</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                    </SelectContent>
                </Select>
            )}
         </div>

         {/* Action: WhatsApp Rider */}
         {order.orderStatus !== "Pending" && order.deliveryMode === 'home_delivery' && (
             <Button 
                variant="secondary" 
                className="w-full text-green-700 bg-green-100 hover:bg-green-200"
                onClick={() => onShare(order)}
             >
                <MessageCircle className="mr-2 h-4 w-4" /> Share with Rider
             </Button>
         )}
      </CardFooter>
    </Card>
  );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl bg-muted/20">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No active orders</h3>
            <p className="text-muted-foreground">New orders will appear here.</p>
        </div>
    )
}
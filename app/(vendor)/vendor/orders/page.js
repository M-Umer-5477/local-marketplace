
// "use client";

// import { useEffect, useState } from "react";
// import { toast } from "sonner";
// import { 
//   Loader2, Package, CheckCircle2, Truck, XCircle, 
//   MapPin, Phone, MessageCircle, RefreshCw, Store 
// } from "lucide-react";

// // ShadCN UI
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// export default function SellerOrdersPage() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [updating, setUpdating] = useState(null); 

//   // 1. Fetch Orders
//   const fetchOrders = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch("/api/vendor/orders");
//       const data = await res.json();
//       if (data.success) {
//         setOrders(data.orders);
//       }
//     } catch (error) {
//       toast.error("Failed to load orders");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   // 2. Update Status Handler
//   const handleStatusUpdate = async (orderId, newStatus) => {
//     setUpdating(orderId);
//     try {
//       const res = await fetch("/api/vendor/orders", {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ orderId, status: newStatus }),
//       });

//       if (res.ok) {
//         toast.success(`Order updated successfully`);
//         setOrders((prev) => 
//           prev.map((o) => o._id === orderId ? { ...o, orderStatus: newStatus } : o)
//         );
//       } else {
//         toast.error("Update failed");
//       }
//     } catch (e) {
//       toast.error("Network error");
//     } finally {
//       setUpdating(null);
//     }
//   };

//   // 3. Smart WhatsApp Handler
//   const shareWithRider = (order) => {
//     const address = order.deliveryAddress?.address || "Pickup";
//     const city = order.deliveryAddress?.city || "";
//     const customerName = order.userId?.name || "Customer";
//     const customerPhone = order.userId?.phone || "N/A";

//     const message = `
// 📦 *New Delivery Task*
// *Order ID:* #${order._id.slice(-6).toUpperCase()}
// *Customer:* ${customerName}
// *Phone:* ${customerPhone}
// *Collect Cash:* Rs. ${order.total}

// 📍 *Address:* ${address}, ${city}

// Google Maps: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + " " + city)}
//     `.trim();

//     const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
//     window.open(url, "_blank");
//   };

//   // Filter Orders
//   // Active = Everything NOT Cancelled or Completed
//   const activeOrders = orders.filter(o => !["Delivered", "Picked_Up", "Cancelled"].includes(o.orderStatus));
  
//   // History = Delivered, Picked Up, or Cancelled
//   const historyOrders = orders.filter(o => ["Delivered", "Picked_Up", "Cancelled"].includes(o.orderStatus));

//   if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

//   return (
//     <div className="p-6 max-w-6xl mx-auto space-y-6">
      
//       <div className="flex justify-between items-center">
//         <div>
//             <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
//             <p className="text-muted-foreground">Process incoming orders.</p>
//         </div>
//         <Button variant="outline" onClick={fetchOrders} size="sm" className="gap-2">
//             <RefreshCw className="h-4 w-4" /> Refresh
//         </Button>
//       </div>

//       <Tabs defaultValue="active" className="w-full">
//         <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
//           <TabsTrigger value="active">Active Orders ({activeOrders.length})</TabsTrigger>
//           <TabsTrigger value="history">History</TabsTrigger>
//         </TabsList>

//         <TabsContent value="active" className="mt-6">
//            {activeOrders.length === 0 ? (
//              <EmptyState />
//            ) : (
//              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//                {activeOrders.map((order) => (
//                  <OrderCard 
//                     key={order._id} 
//                     order={order} 
//                     onUpdate={handleStatusUpdate} 
//                     updating={updating === order._id}
//                     onShare={shareWithRider}
//                  />
//                ))}
//              </div>
//            )}
//         </TabsContent>

//         <TabsContent value="history" className="mt-6">
//            <div className="space-y-4">
//              {historyOrders.map((order) => (
//                  <div key={order._id} className="flex justify-between items-center p-4 border rounded-lg bg-card/50">
//                     <div>
//                         <div className="flex items-center gap-2">
//                             <span className="font-bold">#{order._id.slice(-6).toUpperCase()}</span>
//                             <Badge variant={order.orderStatus === 'Cancelled' ? 'destructive' : 'outline'}>
//                                 {order.orderStatus.replace(/_/g, " ")}
//                             </Badge>
//                         </div>
//                         <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
//                     </div>
//                     <div className="text-right">
//                         <p className="font-bold">Rs. {order.total}</p>
//                         <p className="text-xs text-muted-foreground">{order.deliveryMode === 'store_pickup' ? 'Pickup' : 'Delivery'}</p>
//                     </div>
//                  </div>
//              ))}
//            </div>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }

// // --- SUB-COMPONENT: ORDER CARD (LOGIC FIXED) ---
// function OrderCard({ order, onUpdate, updating, onShare }) {
//   const isDelivery = order.deliveryMode === 'home_delivery';
//   const isPickup = order.deliveryMode === 'store_pickup';

//   return (
//     <Card className={`border-l-4 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full ${isDelivery ? 'border-l-blue-500' : 'border-l-yellow-500'}`}>
//       <CardHeader className="pb-3">
//         <div className="flex justify-between items-start">
//            <div>
//               <CardTitle className="text-lg">#{order._id.slice(-6).toUpperCase()}</CardTitle>
//               <span className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</span>
//            </div>
//            <Badge className={
//              order.orderStatus === "Pending" ? "bg-yellow-500 hover:bg-yellow-600" :
//              order.orderStatus === "Confirmed" ? "bg-blue-500 hover:bg-blue-600" :
//              "bg-green-600 hover:bg-green-700"
//            }>
//              {order.orderStatus.replace(/_/g, " ")}
//            </Badge>
//         </div>
//       </CardHeader>
      
//       <CardContent className="space-y-4 pb-3 flex-1">
        
//         {/* Delivery Mode Badge */}
//         <div className={`text-xs font-bold px-2 py-1 rounded w-fit ${isDelivery ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>
//             {isDelivery ? "🚚 Home Delivery" : "🏪 Customer Pickup"}
//         </div>

//         {/* Items Summary */}
//         <div className="space-y-1">
//            {order.items.slice(0, 3).map((item, i) => (
//              <div key={i} className="flex justify-between text-sm">
//                 <span><span className="font-bold">x{item.quantity}</span> {item.name}</span>
//                 <span className="text-muted-foreground">Rs. {item.subtotal}</span>
//              </div>
//            ))}
//         </div>
        
//         {/* Contact Details */}
//         <div className="bg-muted/40 p-3 rounded-md text-sm space-y-1">
//            <div className="flex items-center gap-2">
//               <Phone className="h-3 w-3 text-muted-foreground" />
//               <span className="text-xs text-muted-foreground font-medium">
//                   {order.userId?.phone || "No Phone"}
//               </span>
//            </div>
           
//            <div className="flex items-start gap-2 pt-1">
//               {isDelivery ? <MapPin className="h-3 w-3 mt-0.5 text-muted-foreground"/> : <Store className="h-3 w-3 mt-0.5 text-muted-foreground"/>}
//               <div className="flex-1">
//                  {isDelivery && (
//                     <p className="text-xs text-muted-foreground line-clamp-2">
//                         {order.deliveryAddress?.address}, {order.deliveryAddress?.city}
//                     </p>
//                  )}
//                  {isPickup && <p className="text-xs text-muted-foreground">Client will visit shop</p>}
//               </div>
//            </div>
//         </div>

//         <div className="flex justify-between items-center pt-2 border-t">
//            <span className="text-sm font-medium text-muted-foreground">Total ({order.paymentMethod.toUpperCase()})</span>
//            <span className="text-lg font-bold">Rs. {order.total}</span>
//         </div>
//       </CardContent>

//       <CardFooter className="flex flex-col gap-2 pt-2 border-t bg-muted/10">
         
//          {/* 1. PENDING STAGE */}
//          {order.orderStatus === "Pending" && (
//              <div className="grid grid-cols-2 gap-2 w-full">
//                 <Button 
//                     variant="outline" 
//                     className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
//                     onClick={() => onUpdate(order._id, "Cancelled")}
//                     disabled={updating}
//                 >
//                     Reject
//                 </Button>
//                 <Button 
//                     onClick={() => onUpdate(order._id, "Confirmed")}
//                     disabled={updating}
//                     className="bg-green-600 hover:bg-green-700"
//                 >
//                     {updating ? <Loader2 className="animate-spin h-4 w-4"/> : "Accept"}
//                 </Button>
//              </div>
//          )}

//          {/* 2. CONFIRMED -> PACKING */}
//          {order.orderStatus === "Confirmed" && (
//              <Button className="w-full" onClick={() => onUpdate(order._id, "Preparing")} disabled={updating}>
//                 Start Packing
//              </Button>
//          )}

//          {/* 3. PACKING -> READY/OUT (SPLIT LOGIC HERE) */}
//          {order.orderStatus === "Preparing" && (
//              <Button 
//                 className="w-full" 
//                 disabled={updating}
//                 onClick={() => onUpdate(order._id, isDelivery ? "Out_for_Delivery" : "Ready_for_Pickup")}
//              >
//                 {isDelivery ? "Handover to Rider" : "Mark Ready for Pickup"}
//              </Button>
//          )}

//          {/* 4. READY -> DONE (SPLIT LOGIC HERE) */}
         
//          {/* A. DELIVERY FLOW */}
//          {order.orderStatus === "Out_for_Delivery" && (
//              <div className="w-full space-y-2">
//                  <Button variant="secondary" className="w-full text-green-700 bg-green-100 hover:bg-green-200 border border-green-200" onClick={() => onShare(order)}>
//                     <MessageCircle className="mr-2 h-4 w-4" /> Share with Rider
//                  </Button>
//                  <Button className="w-full" onClick={() => onUpdate(order._id, "Delivered")} disabled={updating}>
//                     Mark Delivered
//                  </Button>
//              </div>
//          )}

//          {/* B. PICKUP FLOW */}
//          {order.orderStatus === "Ready_for_Pickup" && (
//              <div className="w-full space-y-2">
//                  <div className="text-center text-xs text-muted-foreground p-2 border rounded bg-yellow-50/50">
//                     Waiting for customer arrival...
//                  </div>
//                  <Button className="w-full" onClick={() => onUpdate(order._id, "Picked_Up")} disabled={updating}>
//                     Confirm Picked Up
//                  </Button>
//              </div>
//          )}

//       </CardFooter>
//     </Card>
//   );
// }

// function EmptyState() {
//     return (
//         <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl bg-muted/20">
//             <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
//             <h3 className="text-lg font-semibold">No active orders</h3>
//             <p className="text-muted-foreground">New orders will appear here automatically.</p>
//         </div>
//     )
// }
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { 
  Loader2, Package, CheckCircle2, Truck, XCircle, 
  MapPin, Phone, MessageCircle, RefreshCw, Store 
} from "lucide-react";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- NEW IMPORT: The Static Map Component ---
// We use a simplified map here that just shows the pin (read-only)
import LocationPicker from "@/components/maps/LocationPicker"; 

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); 

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
        toast.success(`Order updated successfully`);
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

  // 3. Smart WhatsApp Handler (UPDATED FOR MAPS)
  const shareWithRider = (order) => {
    const address = order.deliveryAddress?.address || "Pickup";
    const city = order.deliveryAddress?.city || "Gujrat";
    const customerName = order.userId?.name || "Customer";
    const customerPhone = order.userId?.phone || order.customerPhone || "N/A";
    
    // --- MAPS LOGIC START ---
    // If we have coordinates, use them for a precise pin link
    let mapLink = "";
    if (order.deliveryAddress?.location?.lat) {
        const { lat, lng } = order.deliveryAddress.location;
        mapLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    } else {
        // Fallback to text search if no pin was dropped (Old orders)
        mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + " " + city)}`;
    }
    // --- MAPS LOGIC END ---

    const message = `
📦 *New Delivery Task*
*Order:* #${order._id.slice(-6).toUpperCase()}
*Name:* ${customerName}
*Phone:* ${customerPhone}
*Bill:* Rs. ${order.total} (Collect Cash)

📍 *Location:* ${address}
🔗 *Navigate:* ${mapLink}
    `.trim();

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // Filter Orders
  const activeOrders = orders.filter(o => !["Delivered", "Picked_Up", "Cancelled"].includes(o.orderStatus));
  const historyOrders = orders.filter(o => ["Delivered", "Picked_Up", "Cancelled"].includes(o.orderStatus));

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
            <p className="text-muted-foreground">Process incoming orders.</p>
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
                            <Badge variant={order.orderStatus === 'Cancelled' ? 'destructive' : 'outline'}>
                                {order.orderStatus.replace(/_/g, " ")}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold">Rs. {order.total}</p>
                        <p className="text-xs text-muted-foreground">{order.deliveryMode === 'store_pickup' ? 'Pickup' : 'Delivery'}</p>
                    </div>
                 </div>
             ))}
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// --- SUB-COMPONENT: ORDER CARD (COMPACT & UNIFORM) ---
// --- SUB-COMPONENT: ORDER CARD (COMPACT & BALANCED) ---
function OrderCard({ order, onUpdate, updating, onShare }) {
  const [showMap, setShowMap] = useState(false); // Default: Map Hidden
  
  const isDelivery = order.deliveryMode === 'home_delivery';
  const isPickup = order.deliveryMode === 'store_pickup';
  
  // Extract Coordinates if they exist
  const locationPin = order.deliveryAddress?.location;
  const hasPin = isDelivery && locationPin && locationPin.lat;

  return (
    <Card className={`flex flex-col h-full shadow-sm hover:shadow-md transition-all border-l-4 ${isDelivery ? 'border-l-blue-500' : 'border-l-yellow-500'}`}>
      
      {/* --- HEADER --- */}
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
           <div>
              <div className="flex items-center gap-2">
                 <CardTitle className="text-base">#{order._id.slice(-6).toUpperCase()}</CardTitle>
                 <Badge variant="secondary" className={`text-[10px] h-5 px-1.5 ${isDelivery ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"}`}>
                    {isDelivery ? "Delivery" : "Pickup"}
                 </Badge>
              </div>
              <span className="text-[11px] text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</span>
           </div>
           <Badge className={`text-[10px] px-2 h-5 ${
             order.orderStatus === "Pending" ? "bg-yellow-500 hover:bg-yellow-600" :
             order.orderStatus === "Confirmed" ? "bg-blue-500 hover:bg-blue-600" :
             "bg-green-600 hover:bg-green-700"
           }`}>
             {order.orderStatus.replace(/_/g, " ")}
           </Badge>
        </div>
      </CardHeader>
      
      {/* --- CONTENT --- */}
      <CardContent className="p-4 pt-0 space-y-3 flex-1">
        
        {/* 1. Items Summary */}
        <div className="bg-muted/30 p-2 rounded-md space-y-1">
           {order.items.slice(0, 2).map((item, i) => (
             <div key={i} className="flex justify-between text-xs">
                <span className="truncate max-w-[150px]"><span className="font-bold">x{item.quantity}</span> {item.name}</span>
                <span className="text-muted-foreground">Rs.{item.subtotal}</span>
             </div>
           ))}
           {order.items.length > 2 && (
              <p className="text-[10px] text-muted-foreground text-center pt-1">+{order.items.length - 2} more items</p>
           )}
        </div>

        {/* 2. Map Toggle (Delivery Only) */}
        {hasPin && (
            <div className="w-full">
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-7 text-xs flex gap-2 border-dashed border-blue-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => setShowMap(!showMap)}
                >
                    <MapPin className="w-3 h-3" /> {showMap ? "Hide Map" : "View Map Location"}
                </Button>
                
                {showMap && (
                    <div className="mt-2 rounded-md overflow-hidden border h-32 relative animate-in fade-in zoom-in-95 duration-200">
                        <div className="pointer-events-none h-full w-full">
                           <LocationPicker defaultPosition={locationPin} /> 
                        </div>
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${locationPin.lat},${locationPin.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center transition-all cursor-pointer"
                        >
                            <span className="text-xs bg-white/90 px-2 py-1 rounded shadow-sm opacity-0 hover:opacity-100">Open in App ↗</span>
                        </a>
                    </div>
                )}
            </div>
        )}
        
        {/* 3. Address / Contact (Balanced for both) */}
        <div className="text-xs space-y-2 text-muted-foreground pt-1">
           {/* Phone Row */}
           <div className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              <span>{order.userId?.phone || order.customerPhone || "N/A"}</span>
           </div>

           {/* Location Row (Dynamic Content to Fill Gap) */}
           {isDelivery ? (
               <div className="flex items-start gap-2">
                  <MapPin className="h-3 w-3 mt-0.5" />
                  <span className="line-clamp-2 leading-tight">
                    {order.deliveryAddress?.address}, {order.deliveryAddress?.city}
                  </span>
               </div>
           ) : (
               /* PICKUP FILLER CONTENT */
               <div className="flex items-center gap-2 text-yellow-700/80 bg-yellow-50/50 p-1.5 rounded border border-yellow-100/50">
                  <Store className="h-3 w-3" />
                  <span className="font-medium">Self Pickup at Store</span>
               </div>
           )}
        </div>
      </CardContent>

      {/* --- FOOTER --- */}
      <CardFooter className="flex flex-col gap-2 p-3 bg-muted/10 border-t mt-auto">
         <div className="flex justify-between items-center w-full mb-1">
           <span className="text-xs font-semibold text-muted-foreground">TOTAL BILL</span>
           <span className="text-sm font-bold text-primary">Rs. {order.total}</span>
        </div>

         {order.orderStatus === "Pending" && (
             <div className="grid grid-cols-2 gap-2 w-full">
                <Button variant="outline" size="sm" className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50" onClick={() => onUpdate(order._id, "Cancelled")} disabled={updating}>Reject</Button>
                <Button size="sm" className="h-8 text-xs bg-green-600 hover:bg-green-700" onClick={() => onUpdate(order._id, "Confirmed")} disabled={updating}>
                    {updating ? <Loader2 className="animate-spin h-3 w-3"/> : "Accept"}
                </Button>
             </div>
         )}

         {order.orderStatus === "Confirmed" && (
             <Button size="sm" className="w-full h-8 text-xs" onClick={() => onUpdate(order._id, "Preparing")} disabled={updating}>Start Packing</Button>
         )}

         {order.orderStatus === "Preparing" && (
             <Button size="sm" className="w-full h-8 text-xs" disabled={updating} onClick={() => onUpdate(order._id, isDelivery ? "Out_for_Delivery" : "Ready_for_Pickup")}>
                {isDelivery ? "Handover to Rider" : "Mark Ready"}
             </Button>
         )}

         {order.orderStatus === "Out_for_Delivery" && (
             <div className="w-full space-y-1.5">
                 <Button variant="secondary" size="sm" className="w-full h-8 text-xs text-green-700 bg-green-100 hover:bg-green-200 border border-green-200" onClick={() => onShare(order)}>
                    <MessageCircle className="mr-2 h-3 w-3" /> Share with Rider
                 </Button>
                 <Button size="sm" className="w-full h-8 text-xs" onClick={() => onUpdate(order._id, "Delivered")} disabled={updating}>Mark Delivered</Button>
             </div>
         )}

         {order.orderStatus === "Ready_for_Pickup" && (
             <Button size="sm" className="w-full h-8 text-xs" onClick={() => onUpdate(order._id, "Picked_Up")} disabled={updating}>Confirm Picked Up</Button>
         )}

      </CardFooter>
    </Card>
  );
}
function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl bg-muted/20">
            <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">No active orders</h3>
            <p className="text-muted-foreground">New orders will appear here automatically.</p>
        </div>
    )
}
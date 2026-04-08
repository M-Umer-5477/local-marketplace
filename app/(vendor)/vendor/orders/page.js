
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { 
  Loader2, Package, CheckCircle2, Truck, XCircle, 
  MapPin, Phone, MessageCircle, RefreshCw, Store, CreditCard, Banknote,
  AlertTriangle, ShieldAlert, Ban
} from "lucide-react";
import { ChevronUp, ChevronDown } from "lucide-react";

// Shadcn UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import LocationPicker from "@/components/maps/LocationPicker";
import OrderInvoice from "@/components/seller/OrderInvoice"; 

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [shopDetails, setShopDetails] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null); // For printing invoice
  
  // Modals State
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [orderToReturn, setOrderToReturn] = useState(null); // 🚨 NEW: For refused COD orders
  const [orderToConfirm, setOrderToConfirm] = useState(null); // NEW: For ETA input
  const [estimatedTime, setEstimatedTime] = useState("15"); // NEW: ETA input value

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

  // 1b. Fetch Shop Details
  const fetchShopDetails = async () => {
    try {
      const res = await fetch("/api/vendor/shop-details");
      const data = await res.json();
      if (data.success) {
        setShopDetails(data.shop);
      }
    } catch (error) {
      console.log("Could not fetch shop details");
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchShopDetails();
  }, []);

  // 2. Update Status Handler
  const handleStatusUpdate = async (orderId, newStatus, estimatedPrepTime = null) => {
    setUpdating(orderId);
    try {
      const body = { orderId, status: newStatus };
      if (estimatedPrepTime) {
        body.estimatedPrepTime = parseInt(estimatedPrepTime);
      }

      const res = await fetch("/api/vendor/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(`Order updated successfully`);
        const updatedOrders = orders.map((o) => 
          o._id === orderId 
            ? { ...o, orderStatus: newStatus, estimatedPrepTime: estimatedPrepTime || o.estimatedPrepTime } 
            : o
        );
        setOrders(updatedOrders);
        
        // 🚨 NEW: Trigger invoice print when order is confirmed
        if (newStatus === "Confirmed") {
          const confirmedOrder = updatedOrders.find(o => o._id === orderId);
          setInvoiceOrder(confirmedOrder);
        }
      } else {
        toast.error("Update failed");
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setUpdating(null);
      setOrderToCancel(null); 
      setOrderToReturn(null);
      setOrderToConfirm(null);
      setEstimatedTime("15");
    }
  };

  // 3. Smart WhatsApp Handler
  const shareWithRider = (order) => {
    const address = order.deliveryAddress?.address || "Pickup";
    const city = order.deliveryAddress?.city || "Gujrat";
    const customerName = order.userId?.name || "Customer";
    const customerPhone = order.userId?.phone || order.customerPhone || "N/A";
    
    const paymentStatus = order.isPaid 
        ? "✅ ALREADY PAID (Do NOT Collect Cash)" 
        : `💵 Collect Cash: Rs. ${order.total}`;

    let mapLink = "";
    if (order.deliveryAddress?.location?.lat) {
        const { lat, lng } = order.deliveryAddress.location;
        mapLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    } else {
        mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + " " + city)}`;
    }

    const message = `
📦 *New Delivery Task*
*Order:* #${order._id.slice(-6).toUpperCase()}
*Name:* ${customerName}
*Phone:* ${customerPhone}

💰 *Payment:* ${paymentStatus}

📍 *Location:* ${address}
🔗 *Navigate:* ${mapLink}
    `.trim();

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // 🚨 UPDATED FILTER: "Returned" moves to history automatically
  const activeOrders = orders.filter(o => !["Delivered", "Picked_Up", "Cancelled", "Returned"].includes(o.orderStatus)&& o.source !== "offline");
  const historyOrders = orders.filter(o => ["Delivered", "Picked_Up", "Cancelled", "Returned"].includes(o.orderStatus) && o.source !== "offline");

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
             <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl bg-card/50">
               <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6">
                 <Package className="h-10 w-10 text-muted-foreground" />
               </div>
               <h3 className="text-2xl font-bold text-foreground">No active orders</h3>
               <p className="text-muted-foreground mt-2 max-w-sm">
                 You are all caught up! When customers place new orders, they will appear right here.
               </p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {activeOrders.map((order) => (
                 <OrderCard 
                   key={order._id} 
                   order={order} 
                   onUpdate={handleStatusUpdate} 
                   updating={updating === order._id}
                   onShare={shareWithRider}
                   onCancelRequest={() => setOrderToCancel(order)} 
                   onReturnRequest={() => setOrderToReturn(order)} // 🚨 Pass to new return modal
                   onConfirmRequest={() => setOrderToConfirm(order)} // NEW: Open ETA modal
                 />
               ))}
             </div>
           )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
           {historyOrders.length === 0 ? (
               <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-xl bg-card/50">
                 No order history yet.
               </div>
           ) : (
               <div className="space-y-4">
                 {historyOrders.map((order) => (
                     <div key={order._id} className="flex justify-between items-center p-4 border rounded-lg bg-card/50">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold">#{order._id.slice(-6).toUpperCase()}</span>
                                <Badge variant={['Cancelled', 'Returned'].includes(order.orderStatus) ? 'destructive' : 'outline'}>
                                    {order.orderStatus.replace(/_/g, " ")}
                                </Badge>
                                {order.isPaid ? (
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">Paid</Badge>
                                ) : (
                                    <Badge variant="outline">COD</Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold">Rs. {order.total}</p>
                        </div>
                     </div>
                 ))}
               </div>
           )}
        </TabsContent>
      </Tabs>

      {/* Invoice Component - Prints automatically when order confirmed */}
      {invoiceOrder && shopDetails && (
        <OrderInvoice 
          order={invoiceOrder} 
          shopDetails={shopDetails}
          onPrintComplete={() => setInvoiceOrder(null)}
        />
      )}

      {/* 🚨 MODAL 1: CANCEL ORDER (Reject at Pending state) */}
      <Dialog open={!!orderToCancel} onOpenChange={(open) => !open && setOrderToCancel(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className={`flex items-center gap-3 mb-2 ${orderToCancel?.isPaid ? 'text-red-600' : 'text-orange-500'}`}>
                <div className={`p-2 rounded-full ${orderToCancel?.isPaid ? 'bg-red-100' : 'bg-orange-100'}`}>
                    {orderToCancel?.isPaid ? <ShieldAlert className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
                </div>
                <DialogTitle>Reject Order</DialogTitle>
            </div>
            
            <DialogDescription className="text-sm">
              {orderToCancel?.isPaid ? (
                <span className="text-red-600 font-medium">
                  🚨 WARNING: This order was already paid online via card. Canceling it will automatically trigger a refund and reverse the funds from your wallet.
                </span>
              ) : (
                <span>Are you sure you want to reject this Cash on Delivery order? The customer will be notified.</span>
              )}
            </DialogDescription>
          </DialogHeader>

          {orderToCancel && (
            <div className="bg-muted/50 p-4 rounded-lg my-2 space-y-2 text-sm border">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Order ID:</span>
                    <span className="font-medium">#{orderToCancel._id.slice(-6).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Items:</span>
                    <span className="font-medium text-right max-w-[200px] truncate">{orderToCancel.items.map(i => i.name).join(", ")}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="font-bold">Total Bill:</span>
                    <span className="font-bold text-primary">Rs. {orderToCancel.total}</span>
                </div>
            </div>
          )}

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOrderToCancel(null)} disabled={updating}>
              Keep Order
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleStatusUpdate(orderToCancel._id, "Cancelled")} 
              disabled={updating}
            >
              {updating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* 🚨 MODAL 2: RETURN ORDER (Customer refused at door) */}
      <Dialog open={!!orderToReturn} onOpenChange={(open) => !open && setOrderToReturn(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2 text-slate-700">
                <div className="p-2 rounded-full bg-slate-100">
                    <Ban className="h-6 w-6" />
                </div>
                <DialogTitle>Customer Refused Delivery</DialogTitle>
            </div>
            
            <DialogDescription className="text-sm">
              Are you sure you want to mark this order as <strong>Returned</strong>? Use this only if the rider attempted delivery but the customer refused to pay or accept the package. 
              <br/><br/>
              <em>Note: The inventory stock for these items will automatically be restored in your shop.</em>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOrderToReturn(null)} disabled={updating}>
              Cancel
            </Button>
            <Button 
              className="bg-slate-700 hover:bg-slate-800 text-white"
              onClick={() => handleStatusUpdate(orderToReturn._id, "Returned")} 
              disabled={updating}
            >
              {updating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Mark as Returned
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NEW: ETA MODAL */}
      <Dialog open={!!orderToConfirm} onOpenChange={(open) => !open && setOrderToConfirm(null)}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-[425px] mx-auto">
          <DialogHeader>
            <DialogTitle>Confirm Order & Set Preparation Time</DialogTitle>
            <DialogDescription>
              How many minutes until this order is ready?
            </DialogDescription>
          </DialogHeader>

          {orderToConfirm && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="bg-primary/5 p-3 sm:p-4 rounded-lg border border-primary/20">
                <p className="text-sm font-medium text-foreground mb-2">Order Details</p>
                <div className="text-xs sm:text-sm space-y-1 text-muted-foreground wrap-break-word">
                  <p className="font-bold">#{orderToConfirm._id.slice(-6).toUpperCase()}</p>
                  <p className="line-clamp-2">{orderToConfirm.items.map(i => i.name).join(", ")}</p>
                  <p className="font-bold text-lg">Rs. {orderToConfirm.total}</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium block">Estimated Preparation Time</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    className="flex-1 sm:flex-initial sm:w-20 px-3 py-2 border rounded-lg font-bold text-center text-base"
                  />
                  <span className="text-sm text-muted-foreground">minutes</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1 bg-gray-50 p-2 rounded">
                  <p>💡 <strong>Range:</strong> 5-120 minutes (default 15)</p>
                  <p className="text-primary font-medium">👁️ Customer ETA: {new Date(new Date().getTime() + parseInt(estimatedTime || 15) * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setOrderToConfirm(null)} disabled={updating} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button 
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
              size="sm"
              onClick={() => handleStatusUpdate(orderToConfirm._id, "Confirmed", estimatedTime)} 
              disabled={updating}
            >
              {updating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Confirm Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

// -----------------------------------
// ORDER CARD COMPONENT
// -----------------------------------
function OrderCard({ order, onUpdate, updating, onShare, onCancelRequest, onReturnRequest, onConfirmRequest }) {
  const [showMap, setShowMap] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  const isDelivery = order.deliveryMode === 'home_delivery';
  const locationPin = order.deliveryAddress?.location;
  const hasPin = isDelivery && locationPin && locationPin.lat;

  const visibleItems = expanded ? order.items : order.items.slice(0, 2);

  return (
    <Card className={`flex flex-col h-full shadow-sm hover:shadow-md transition-all border-l-4 ${isDelivery ? 'border-l-cyan-500' : 'border-l-yellow-500'}`}>
      
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
           <div>
              <div className="flex items-center gap-2">
                 <CardTitle className="text-base">#{order._id.slice(-6).toUpperCase()}</CardTitle>
                 <Badge variant="secondary" className={`text-[10px] h-5 px-1.5 ${isDelivery ? "bg-cyan-100 text-cyan-700" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"}`}>
                    {isDelivery ? "Delivery" : "Pickup"}
                 </Badge>
              </div>
              <span className="text-[11px] text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</span>
           </div>
           <Badge className={`text-[10px] px-2 h-5 ${
             order.orderStatus === "Pending" ? "bg-yellow-500 hover:bg-yellow-600" :
             order.orderStatus === "Confirmed" ? "bg-cyan-500 hover:bg-cyan-600" :
             "bg-green-600 hover:bg-green-700"
           }`}>
             {order.orderStatus.replace(/_/g, " ")}
           </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 space-y-3 flex-1">
        
        <div className="bg-muted/30 p-2 rounded-md space-y-1">
           <div className={`space-y-1 ${expanded ? 'max-h-40 overflow-y-auto pr-1' : ''}`}>
               {visibleItems.map((item, i) => (
                 <div key={i} className="flex justify-between text-xs py-1 border-b border-muted/20 last:border-0">
                    <span className="truncate max-w-40">
                        <span className="font-bold mr-1">x{item.quantity}</span> 
                        {item.name}
                    </span>
                    <span className="text-muted-foreground">Rs.{item.subtotal}</span>
                 </div>
               ))}
           </div>

           {order.items.length > 2 && (
             <button 
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-center gap-1 text-[10px] font-medium text-primary hover:text-primary/80 pt-1 mt-1 border-t border-dashed border-muted-foreground/20 transition-colors"
             >
                {expanded ? (
                    <>Show Less <ChevronUp className="h-3 w-3" /></>
                ) : (
                    <>+{order.items.length - 2} more items <ChevronDown className="h-3 w-3" /></>
                )}
             </button>
           )}
        </div>

        {hasPin && (
            <div className="w-full">
                <Button variant="outline" size="sm" className="w-full h-7 text-xs flex gap-2 border-dashed border-cyan-200 text-cyan-700 hover:text-cyan-800 hover:bg-cyan-50" onClick={() => setShowMap(!showMap)}>
                    <MapPin className="w-3 h-3" /> {showMap ? "Hide Map" : "View Map Location"}
                </Button>
                {showMap && (
                    <div className="mt-2 rounded-md overflow-hidden border h-32 relative animate-in fade-in zoom-in-95 duration-200">
                        <div className="pointer-events-none h-full w-full">
                            <LocationPicker defaultPosition={{lat: locationPin.lat, lng: locationPin.lng}} /> 
                        </div>
                        <a href={`https://www.google.com/maps/search/?api=1&query=$${locationPin.lat},${locationPin.lng}`} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center transition-all cursor-pointer">
                            <span className="text-xs bg-white/90 px-2 py-1 rounded shadow-sm opacity-0 hover:opacity-100">Open in App ↗</span>
                        </a>
                    </div>
                )}
            </div>
        )}
        
        <div className="text-xs space-y-2 text-muted-foreground pt-1">
           <div className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              <span>{order.userId?.phone || order.customerPhone || "N/A"}</span>
           </div>
           {isDelivery ? (
               <div className="flex items-start gap-2">
                  <MapPin className="h-3 w-3 mt-0.5" />
                  <span className="line-clamp-2 leading-tight">{order.deliveryAddress?.address}, {order.deliveryAddress?.city}</span>
               </div>
           ) : (
               <div className="flex items-center gap-2 text-yellow-700/80 bg-yellow-50/50 p-1.5 rounded border border-yellow-100/50">
                  <Store className="h-3 w-3" />
                  <span className="font-medium">Self Pickup at Store</span>
               </div>
           )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 p-3 bg-muted/10 border-t mt-auto">
         <div className="flex justify-between items-center w-full mb-1">
            <span className="text-xs font-semibold text-muted-foreground">TOTAL BILL</span>
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-primary">Rs. {order.total}</span>
                {order.isPaid ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-0 text-[10px] h-5 px-1.5 flex gap-1 items-center">
                        <CreditCard className="w-3 h-3" /> PAID
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 text-[10px] h-5 px-1.5 flex gap-1 items-center">
                        <Banknote className="w-3 h-3" /> COD
                    </Badge>
                )}
            </div>
         </div>

         {order.orderStatus === "Pending" && (
             <div className="grid grid-cols-2 gap-2 w-full">
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50" 
                    disabled={updating}
                    onClick={onCancelRequest} 
                >
                    Reject
                </Button>

                <Button size="sm" className="h-8 text-xs bg-green-600 hover:bg-green-700" onClick={onConfirmRequest} disabled={updating}>
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

         {/* 🚨 THE UPDATED OUT FOR DELIVERY SECTION 🚨 */}
         {order.orderStatus === "Out_for_Delivery" && (
             <div className="w-full space-y-1.5">
                 <Button variant="secondary" size="sm" className="w-full h-8 text-xs text-green-700 bg-green-100 hover:bg-green-200 border border-green-200" onClick={() => onShare(order)}>
                    <MessageCircle className="mr-2 h-3 w-3" /> Share with Rider
                 </Button>
                 
                 <div className="grid grid-cols-2 gap-2 w-full">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-xs text-slate-600 border-slate-200 hover:bg-slate-50" 
                        disabled={updating}
                        onClick={onReturnRequest} // Calls the new modal
                    >
                        Refused
                    </Button>
                    <Button size="sm" className="h-8 text-xs bg-green-600 hover:bg-green-700" onClick={() => onUpdate(order._id, "Delivered")} disabled={updating}>
                        Delivered
                    </Button>
                 </div>
             </div>
         )}

         {order.orderStatus === "Ready_for_Pickup" && (
             <Button size="sm" className="w-full h-8 text-xs" onClick={() => onUpdate(order._id, "Picked_Up")} disabled={updating}>Confirm Picked Up</Button>
         )}

      </CardFooter>
    </Card>
  );
}
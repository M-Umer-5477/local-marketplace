"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { 
  Loader2, 
  CheckCircle2, 
  Package, 
  Truck, 
  MapPin, 
  Store, 
  Phone, 
  ArrowLeft,
  ShoppingBag
} from "lucide-react";

// ShadCN Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// Status Steps Configuration
const STATUS_STEPS = [
  { id: "Pending", label: "Order Placed", icon: Package },
  { id: "Confirmed", label: "Confirmed", icon: CheckCircle2 },
  { id: "Preparing", label: "Packing", icon: Package },
  { id: "Out_for_Delivery", label: "On the Way", icon: Truck },
  { id: "Delivered", label: "Delivered", icon: CheckCircle2 },
];

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/customer/order/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setOrder(data.order);
        } else {
          // Handle error (e.g. redirect if 404)
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchOrder();
  }, [params.id]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (!order) {
    return <div className="h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold">Order not found</h2>
        <Button variant="outline" onClick={() => router.push("/")}>Go Home</Button>
    </div>;
  }

  // Determine current step index for the timeline
  const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === order.orderStatus);
  const isCancelled = order.orderStatus === "Cancelled";

  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-8">
      
      {/* Top Navigation */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push("/shops")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </Button>
        <span className="text-sm text-muted-foreground">Order #{order._id.slice(-6).toUpperCase()}</span>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: Tracking & Status --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Status Card */}
          <Card className="overflow-hidden border-primary/20 shadow-md">
            <div className={`h-2 w-full ${isCancelled ? 'bg-red-500' : 'bg-green-500'}`} />
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl text-primary">
                            {isCancelled ? "Order Cancelled" : 
                             order.orderStatus === "Delivered" ? "Order Delivered" : 
                             "Order in Progress"}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                        </CardDescription>
                    </div>
                    <Badge variant={isCancelled ? "destructive" : "default"} className="text-sm px-3 py-1">
                        {order.orderStatus.replace(/_/g, " ")}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {/* Timeline Visualization */}
                {!isCancelled && (
                    <div className="relative flex justify-between items-center mt-6 mb-2">
                        {/* Connecting Line */}
                        <div className="absolute top-4 left-0 w-full h-1 bg-muted -z-10">
                            <div 
                                className="h-full bg-primary transition-all duration-1000" 
                                style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                            />
                        </div>

                        {STATUS_STEPS.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;

                            return (
                                <div key={step.id} className="flex flex-col items-center gap-2">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all ${
                                        isActive ? "bg-primary border-primary text-white" : "bg-background border-muted text-muted-foreground"
                                    } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <span className={`text-xs font-medium hidden sm:block ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                                        {step.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
          </Card>

          {/* 2. Items List */}
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" /> Order Items
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="max-h-[400px]">
                    <div className="space-y-4">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                                <div className="flex items-center gap-4">
                                    <div className="bg-muted h-12 w-12 rounded-md flex items-center justify-center text-xs font-bold text-muted-foreground">
                                        x{item.quantity}
                                    </div>
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Rs. {item.price} per unit
                                        </p>
                                    </div>
                                </div>
                                <p className="font-bold">Rs. {item.subtotal}</p>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                
                {/* Totals */}
                <div className="mt-6 space-y-2 bg-muted/30 p-4 rounded-lg">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>Rs. {order.total - order.deliveryFee}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery Fee</span>
                        <span>Rs. {order.deliveryFee}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg pt-2">
                        <span>Grand Total</span>
                        <span className="text-primary">Rs. {order.total}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Payment Method</span>
                        <span className="uppercase">{order.paymentMethod}</span>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>

        {/* --- RIGHT COLUMN: Info Cards --- */}
        <div className="space-y-6">
            
            {/* Delivery Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Delivery Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {order.deliveryMode === 'store_pickup' ? (
                        <div className="flex items-start gap-3">
                            <Store className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                                <p className="font-medium">Store Pickup</p>
                                <p className="text-sm text-muted-foreground">Please collect your order from the shop counter.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                                <p className="font-medium">Delivery Address</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {order.deliveryAddress?.address}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {order.deliveryAddress?.city}
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Shop Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Shop Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-muted rounded-full overflow-hidden">
                            {order.shopId?.shopLogo ? (
                                <img src={order.shopId.shopLogo} alt="Shop" className="h-full w-full object-cover" />
                            ) : (
                                <Store className="h-6 w-6 m-2 text-muted-foreground" />
                            )}
                        </div>
                        <div>
                            <p className="font-bold">{order.shopId?.shopName}</p>
                            <p className="text-xs text-muted-foreground">{order.shopId?.shopAddress}</p>
                        </div>
                    </div>
                    
                    <a href={`tel:${order.shopId?.phone}`}>
                        <Button variant="outline" className="w-full gap-2">
                            <Phone className="h-4 w-4" /> Call Shop
                        </Button>
                    </a>
                </CardContent>
            </Card>

            {/* Help */}
            <Card className="bg-blue-50/50 border-blue-100">
                <CardContent className="p-4 text-center">
                    <p className="text-sm text-blue-800 mb-2">Need help with this order?</p>
                    <Button variant="link" className="text-blue-600 h-auto p-0">Contact Support</Button>
                </CardContent>
            </Card>

        </div>
      </div>
    </div>
  );
}
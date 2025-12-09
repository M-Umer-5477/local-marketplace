"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ClearCartOnMount from "./ClearCartOnMount";
import {
  Loader2, CheckCircle2, Package, Truck, Store, MapPin, Phone, ArrowLeft, ShoppingBag
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";



const DELIVERY_STEPS = [
  { id: "Pending", label: "Order Placed", icon: Package },
  { id: "Confirmed", label: "Confirmed", icon: CheckCircle2 },
  { id: "Preparing", label: "Preparing Order", icon: Package },
  { id: "Out_for_Delivery", label: "On the Way", icon: Truck },
  { id: "Delivered", label: "Delivered", icon: CheckCircle2 },
];

const PICKUP_STEPS = [
  { id: "Pending", label: "Order Placed", icon: Package },
  { id: "Confirmed", label: "Confirmed", icon: CheckCircle2 },
  { id: "Preparing", label: "Preparing Order", icon: Package },
  { id: "Ready_for_Pickup", label: "Ready for Pickup", icon: Store },
  { id: "Picked_Up", label: "Picked Up", icon: CheckCircle2 },
];



export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ------------------- FETCH ORDER --------------------- */
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/customer/order/${params.id}`);
        const data = await res.json();
        if (data.success) setOrder(data.order);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchOrder();
  }, [params.id]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  if (!order)
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold">Order not found</h2>
        <Button onClick={() => router.push("/")}>Go Home</Button>
      </div>
    );

  /* ---------------------------------------------------------
     PICKUP vs DELIVERY LOGIC
  --------------------------------------------------------- */

  const isPickup = order.deliveryMode === "store_pickup";
  const isCancelled = order.orderStatus === "Cancelled";
  const STEPS = isPickup ? PICKUP_STEPS : DELIVERY_STEPS;

  const currentIndex = STEPS.findIndex((s) => s.id === order.orderStatus);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString() +
    " at " +
    new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  /* ------------------- STATUS TITLE --------------------- */
  function getMainStatusTitle() {
    if (isCancelled) return "Order Cancelled";

    if (isPickup) {
      if (order.orderStatus === "Ready_for_Pickup") return "Ready for Pickup";
      if (order.orderStatus === "Picked_Up") return "Order Picked Up";
    }

    if (order.orderStatus === "Delivered") return "Order Delivered";

    return "Order in Progress";
  }

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */

  return (<>
  <ClearCartOnMount />
    <div className="min-h-screen bg-muted/20 p-4 md:p-8">
      {/* NAV */}
      <div className="max-w-5xl mx-auto flex justify-between items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/shops")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </Button>
        <span className="text-sm text-muted-foreground font-mono">
          #{order._id.slice(-6).toUpperCase()}
        </span>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT SECTION */}
        <div className="lg:col-span-2 space-y-6">
          {/* STATUS CARD */}
          <Card className="border-primary/20 shadow-md">
            <div className={`h-2 w-full ${isCancelled ? "bg-red-500" : "bg-green-500"}`} />

            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl text-primary">{getMainStatusTitle()}</CardTitle>
                  <CardDescription>
                    Placed on {formatDate(order.createdAt)}
                  </CardDescription>
                </div>
                <Badge variant={isCancelled ? "destructive" : "default"}>
                  {order.orderStatus.replace(/_/g, " ")}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              {!isCancelled && (
                <div className="relative flex justify-between items-center mt-6 mb-2">
                  {/* BACK LINE */}
                  <div className="absolute top-4 left-0 w-full h-1 bg-muted -z-10">
                    <div
                      className="h-full bg-primary transition-all duration-700"
                      style={{
                        width: `${(currentIndex / (STEPS.length - 1)) * 100}%`,
                      }}
                    />
                  </div>

                  {/* STEPS */}
                  {STEPS.map((step, i) => {
                    const Active = i <= currentIndex;
                    const Current = i === currentIndex;
                    const Icon = step.icon;

                    return (
                      <div key={step.id} className="flex flex-col items-center gap-2">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center border-2
                            ${Active ? "bg-primary border-primary text-white" : "bg-background border-muted text-muted-foreground"}
                            ${Current ? "ring-4 ring-primary/20" : ""}
                          `}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span
                          className={`text-xs font-medium hidden sm:block ${
                            Active ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ITEMS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2">
                <ShoppingBag className="h-5 w-5" /> Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div className="flex items-center gap-4">
                        <div className="bg-muted h-12 w-12 rounded-md flex items-center justify-center text-xs text-muted-foreground">
                          x{item.quantity}
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Rs. {item.price}</p>
                        </div>
                      </div>
                      <p className="font-bold">Rs. {item.subtotal}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* PRICE BOX */}
              <div className="mt-6 bg-muted/30 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Rs. {order.total - order.deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  {isPickup ? (
                    <span className="text-green-600 font-medium">Free (Pickup)</span>
                  ) : (
                    <span>Rs. {order.deliveryFee}</span>
                  )}
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Grand Total</span>
                  <span className="text-primary">Rs. {order.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* DELIVERY / PICKUP INFO */}
          <Card>
            <CardHeader>
              <CardTitle>{isPickup ? "Pickup Instructions" : "Delivery Details"}</CardTitle>
            </CardHeader>
            <CardContent>
              {isPickup ? (
                <div className="flex items-start gap-3 bg-yellow-50 p-3 rounded-md border border-yellow-100">
                  <Store className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900">Self Pickup</p>
                    <p className="text-sm text-yellow-700">
                      Please visit the shop counter and provide your order PIN.
                    </p>
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

          {/* SHOP INFO */}
          <Card>
            <CardHeader>
              <CardTitle>Shop Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {order.shopId?.shopLogo ? (
                    <img src={order.shopId.shopLogo} className="h-full w-full object-cover" />
                  ) : (
                    <Store className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                <div>
                  <p className="font-bold">{order.shopId?.shopName}</p>
                  <p className="text-xs text-muted-foreground">{order.shopId?.shopAddress}</p>
                </div>
              </div>

              {order.shopId?.phone && (
                <a href={`tel:${order.shopId.phone}`}>
                  <Button variant="outline" className="w-full gap-2">
                    <Phone className="h-4 w-4" /> Call Shop
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </>);
}


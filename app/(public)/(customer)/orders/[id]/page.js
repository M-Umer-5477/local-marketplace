"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ClearCartOnMount from "./ClearCartOnMount";
import {
  Loader2, CheckCircle2, Package, Truck, Store, MapPin, Phone, ArrowLeft, ShoppingBag
} from "lucide-react";
import { ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";



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
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Review State
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const submitReview = async () => {
    if (rating === 0) return toast.error("Please select a star rating first.");
    try {
      setIsSubmittingReview(true);
      const res = await fetch(`/api/customer/order/${order._id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, feedback }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Review submitted successfully!");
        setOrder(prev => ({ ...prev, isReviewed: true, rating, feedback }));
      } else {
        toast.error(data.error || "Failed to submit review");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred");
    } finally {
      setIsSubmittingReview(false);
    }
  };

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

  /* ------------------- AUTO-POLLING (5s refresh) --------------------- */
  useEffect(() => {
    if (!order && !params.id) return;
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/customer/order/${params.id}`);
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
        }
      } catch (e) {
        console.error("Auto-sync failed:", e);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [params.id]);

  /* ------------------- TIME TRACKER (updates every second) --------------------- */
  useEffect(() => {
    // Stop tracking time after order is completed
    const isCompleted = ["Delivered", "Picked_Up", "Cancelled"].includes(order?.orderStatus);
    if (isCompleted || !order?.statusUpdatedAt && !order?.confirmedAt) return;

    const interval = setInterval(() => {
      const lastUpdate = new Date(order.statusUpdatedAt || order.confirmedAt);
      const now = new Date();
      const diff = Math.floor((now - lastUpdate) / 1000 / 60);
      setTimeElapsed(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [order?.statusUpdatedAt, order?.confirmedAt, order?.orderStatus]);

  /* ------------------- ETA CALCULATION --------------------- */
  const getETA = () => {
    if (!order?.confirmedAt) return null;
    const prepTimes = {
      Pending: 0,
      Confirmed: parseInt(order.estimatedPrepTime) || 15,
      Preparing: parseInt(order.estimatedPrepTime) || 15,
      Out_for_Delivery: 0,
      Delivered: 0,
    };
    const confirmedTime = new Date(order.confirmedAt);
    const etaMinutes = prepTimes[order.orderStatus] || 15;
    const etaTime = new Date(confirmedTime.getTime() + etaMinutes * 60000);
    return etaTime;
  };

  const formatETA = (etaDate) => {
    // Don't show ETA if order is completed
    const isCompleted = ["Delivered", "Picked_Up", "Cancelled"].includes(order?.orderStatus);
    if (isCompleted) return null;
    if (!etaDate) return null;
    
    // Only show ETA during active preparation phases
    if (!["Confirmed", "Preparing", "Out_for_Delivery", "Ready_for_Pickup"].includes(order?.orderStatus)) {
      return null;
    }
    
    const now = new Date();
    const diffMs = etaDate - now;
    const diffMins = Math.ceil(diffMs / 60000);
    if (diffMins <= 0) return "Ready now";
    if (diffMins === 1) return "Ready in 1 min";
    return `Ready in ${diffMins} mins • ${etaDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  /* ------------------- PREPARATION MILESTONES --------------------- */
  const PREPARATION_MILESTONES = [
    { id: "order_received", label: "Order Received", icon: CheckCircle2 },
    { id: "items_checking", label: "Checking Items", icon: Package },
    { id: "packing", label: "Packing", icon: Package },
    { id: "quality_check", label: "Quality Check", icon: CheckCircle2 },
  ];

  const getMilestoneProgress = () => {
    if (order.orderStatus === "Pending") return 0;
    if (order.orderStatus === "Confirmed") return 1;
    if (order.orderStatus === "Preparing") return Math.min(timeElapsed, 3);
    if (["Out_for_Delivery", "Ready_for_Pickup"].includes(order.orderStatus)) return 4;
    if (["Delivered", "Picked_Up"].includes(order.orderStatus)) return 4;
    return 0;
  };

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

  const milestoneProgress = getMilestoneProgress();

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
                  <CardDescription className="mt-2 space-y-1">
                    <div>Placed on {formatDate(order.createdAt)}</div>
                    {formatETA(getETA()) && (
                      <div className="text-blue-600 font-medium flex items-center gap-1">
                        ⏱️ {formatETA(getETA())}
                      </div>
                    )}
                    {order.statusUpdatedAt && order.orderStatus !== "Pending" && !["Delivered", "Picked_Up", "Cancelled"].includes(order.orderStatus) && (
                      <div className="text-xs text-muted-foreground">
                        {order.orderStatus.replace(/_/g, " ")} for {timeElapsed} min{timeElapsed !== 1 ? "s" : ""}
                      </div>
                    )}
                  </CardDescription>
                </div>
                <Badge variant={isCancelled ? "destructive" : "default"}>
                  {order.orderStatus.replace(/_/g, " ")}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              {!isCancelled && (
                <>
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

                  {/* PREPARATION MILESTONES */}
                  {["Confirmed", "Preparing"].includes(order.orderStatus) && (
                    <div className="mt-8 pt-6 border-t">
                      <p className="text-xs font-semibold text-muted-foreground mb-4 tracking-wide">PREPARATION PROGRESS</p>
                      <div className="space-y-3">
                        {PREPARATION_MILESTONES.map((milestone, i) => {
                          const isCompleted = i <= milestoneProgress;
                          const isCurrent = i === milestoneProgress;
                          const MIcon = milestone.icon;

                          return (
                            <div key={milestone.id} className="flex items-center gap-3">
                              <div
                                className={`h-6 w-6 rounded-full flex items-center justify-center border-2 transition-all ${
                                  isCompleted
                                    ? "bg-green-500 border-green-500 text-white"
                                    : isCurrent
                                    ? "bg-primary/10 border-primary/40 text-primary animate-pulse"
                                    : "bg-gray-100 border-gray-300 text-gray-400"
                                }`}
                              >
                                <MIcon className="h-3 w-3" />
                              </div>
                              <span
                                className={`text-sm font-medium ${
                                  isCompleted ? "text-foreground" : isCurrent ? "text-primary shadow-sm" : "text-muted-foreground"
                                }`}
                              >
                                {milestone.label}
                              </span>
                              {isCompleted && i < milestoneProgress && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* ITEMS */}
          <Card className="flex flex-col">
            <CardHeader className="shrink-0">
              <CardTitle className="flex gap-2">
                <ShoppingBag className="h-5 w-5" /> Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 min-h-0 gap-4">
              <ScrollArea className="h-[300px] w-full flex-1 border rounded-md">
                <div className="space-y-3 p-4">
                  {order.items.filter(item => item.name !== "Delivery Fee").map((item, i) => (
                    <div key={i} className="flex justify-between items-start gap-3 py-2 border-b last:border-0">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="bg-muted h-10 w-10 rounded-md flex items-center justify-center text-xs font-semibold shrink-0">
                          x{item.quantity}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Rs. {item.price}</p>
                        </div>
                      </div>
                      <p className="font-bold text-sm shrink-0">Rs. {item.subtotal}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* PRICE BOX */}
              <div className="shrink-0 bg-muted/30 p-4 rounded-lg space-y-2 mt-2 border">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">Rs. {(order.total - (order.deliveryFee || 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  {isPickup ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    <span className="font-medium">Rs. {(order.deliveryFee || 0).toFixed(2)}</span>
                  )}
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base pt-2">
                  <span>Grand Total</span>
                  <span className="text-primary">Rs. {order.total.toFixed(2)}</span>
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
          {/* RATING & FEEDBACK CARD */}
          {(order.orderStatus === "Delivered" || order.orderStatus === "Picked_Up") && (
            <Card className="border-orange-500/30 shadow-lg relative overflow-hidden mt-6">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Star className="w-32 h-32" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <Star className="h-5 w-5 fill-current" /> 
                  {order.isReviewed ? "Your Review" : "Rate Your Experience"}
                </CardTitle>
                <CardDescription>
                  {order.isReviewed 
                    ? "Thank you for sharing your feedback!" 
                    : "How was your order? Your feedback helps the community."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.isReviewed ? (
                  <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-5 w-5 ${star <= order.rating ? "text-orange-500 fill-orange-500" : "text-muted"}`} />
                      ))}
                    </div>
                    {order.feedback && (
                      <p className="text-sm italic text-muted-foreground flex gap-2">
                        <MessageSquare className="h-4 w-4 shrink-0 mt-0.5" />"{order.feedback}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star} 
                          onClick={() => setRating(star)}
                          className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star className={`h-8 w-8 ${star <= rating ? "text-orange-500 fill-orange-500" : "text-muted-foreground stroke-muted-foreground opacity-30"}`} />
                        </button>
                      ))}
                    </div>
                    
                    <Textarea 
                      placeholder="Tell us what you liked (or what could be better)..."
                      className="resize-none h-24"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    />
                    
                    <Button 
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white" 
                      onClick={submitReview}
                      disabled={isSubmittingReview || rating === 0}
                    >
                      {isSubmittingReview ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Submit Review
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
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


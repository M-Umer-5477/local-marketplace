
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/cartContext";
import { useAddress } from "@/context/addressContext"; 
import { toast } from "sonner";
import { useSession } from "next-auth/react"; 

import CheckoutAuthModal from "@/components/auth/CheckoutAuthModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"; 
import { Label } from "@/components/ui/label";

import { Loader2, MapPin, CreditCard, Banknote, ArrowLeft, ShoppingBag, Store, AlertTriangle } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession(); 
  const { cart, cartTotal } = useCart(); 
  const { selectedAddress, loading: addressLoading } = useAddress(); 
  
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState("home_delivery"); 
  const [paymentMethod, setPaymentMethod] = useState("cod");
  
  // 🚨 NEW: State to hold the shop's location and radius for validation
  const [shopDetails, setShopDetails] = useState(null);

  const deliveryFee = deliveryMode === "home_delivery" ? 50 : 0;
  const grandTotal = cartTotal + deliveryFee;

  // --- RADAR MATH IN CHECKOUT ---
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  };

  useEffect(() => {
    setMounted(true);
    
    // Fetch the shop details to validate distance
    const fetchShop = async () => {
      if (!cart?.shopId) return;
      try {
         const res = await fetch(`/api/customer/shops`);
         const data = await res.json();
         if (data.success) {
            const currentShop = data.shops.find(s => s._id === cart.shopId);
            setShopDetails(currentShop);
         }
      } catch (e) { console.error(e); }
    };
    fetchShop();
  }, [cart?.shopId]);

  // 🚨 ACTIVE VALIDATION: Calculate distance on the fly
  let isOutOfRange = false;
  let currentDistance = 0;
  let isBelowMinimum = false;
  let remainingForMinimum = 0;
  
  if (selectedAddress && shopDetails && deliveryMode === "home_delivery") {
      // Remember MongoDB GeoJSON is [longitude, latitude] -> [0, 1]
      currentDistance = calculateDistance(
          selectedAddress.location.coordinates[1], selectedAddress.location.coordinates[0],
          shopDetails.shopLocation?.coordinates[1], shopDetails.shopLocation?.coordinates[0]
      );
      if (currentDistance > (shopDetails.deliveryRadius || 10)) {
          isOutOfRange = true;
      }
  }
  
  // ✅ NEW: Check minimum order amount
  const shopMinimum = shopDetails?.minimumOrderAmount || 0;
  if (shopMinimum > 0 && cartTotal < shopMinimum) {
      isBelowMinimum = true;
      remainingForMinimum = shopMinimum - cartTotal;
  }

  const handlePlaceOrder = async () => {
    if (!session) return toast.error("Please login first");
    if (cart.items.length === 0) return toast.error("Cart is empty");
    
    // ✅ NEW: Check minimum order amount
    if (isBelowMinimum) {
        return toast.error(`Minimum order is Rs. ${shopMinimum}. Add Rs. ${remainingForMinimum} more items.`);
    }
    
    // ✅ Check address selection AND range!
    if (deliveryMode === "home_delivery") {
        if (!selectedAddress) {
            return toast.error("Please select a delivery address from the top bar.");
        }
        if (isOutOfRange) {
            return toast.error("Your selected address is outside this shop's delivery radius!");
        }
    }

    setLoading(true);
    
    const finalFee = deliveryMode === "home_delivery" ? 50 : 0;
    const finalTotal = cartTotal + finalFee;
    
    const finalAddress = deliveryMode === "home_delivery" ? { 
         address: selectedAddress.address, 
         city: selectedAddress.city, 
         coordinates: {
            lat: selectedAddress.location.coordinates[1], 
            lng: selectedAddress.location.coordinates[0]
         } 
    } : undefined;

    try {
      if (paymentMethod === "online") {
         const res = await fetch("/api/stripe/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               shopId: cart.shopId,
               items: cart.items,
               deliveryAddress: finalAddress,
               deliveryFee: finalFee,
               deliveryMode: deliveryMode
            }),
         });
         const data = await res.json();
         if (data.url) {
            window.location.href = data.url; 
         } else {
            toast.error("Failed to start payment");
            setLoading(false);
         }
         return; 
      }

      const res = await fetch("/api/customer/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId: cart.shopId,
          items: cart.items,
          total: finalTotal,      
          paymentMethod,
          deliveryMode, 
          deliveryFee: finalFee,
          deliveryAddress: finalAddress,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Order placed successfully!");
        router.push(`/orders/${data.orderId}`);
      } else {
        toast.error(data.error || "Order failed");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error");
      setLoading(false);
    }
  };

  if (!mounted || status === "loading" || addressLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="bg-muted p-6 rounded-full"><ShoppingBag className="h-10 w-10 text-muted-foreground" /></div>
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <Link href="/shops"><Button>Browse Shops</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {!session ? (
            <Card><CardHeader><CardTitle>Account Required</CardTitle></CardHeader><CardContent><CheckoutAuthModal><Button className="w-full">Login</Button></CheckoutAuthModal></CardContent></Card>
          ) : (
            <>
                <Tabs value={deliveryMode} onValueChange={setDeliveryMode} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-12">
                        <TabsTrigger value="home_delivery" className="gap-2"><MapPin className="h-4 w-4" /> Home Delivery</TabsTrigger>
                        <TabsTrigger value="store_pickup" className="gap-2"><Store className="h-4 w-4" /> Pickup</TabsTrigger>
                    </TabsList>
                </Tabs>

                {deliveryMode === "home_delivery" ? (
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5"/> Delivery Address</CardTitle></CardHeader>
                        <CardContent>
                            {selectedAddress ? (
                                <div className="space-y-3">
                                    <div className={`p-4 rounded-xl border flex items-start gap-4 transition-all ${isOutOfRange ? "bg-red-50 border-red-200" : "bg-primary/5 border-primary/20"}`}>
                                        <div className={`${isOutOfRange ? "bg-red-200 text-red-600" : "bg-primary/20 text-primary"} p-2 rounded-full mt-1`}>
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className={`font-bold text-lg ${isOutOfRange ? "text-red-700" : "text-foreground"}`}>{selectedAddress.label}</h4>
                                            <p className={`text-sm mt-1 leading-relaxed ${isOutOfRange ? "text-red-600/80" : "text-muted-foreground"}`}>{selectedAddress.address}</p>
                                            <p className={`text-sm ${isOutOfRange ? "text-red-600/80" : "text-muted-foreground"}`}>{selectedAddress.city}</p>
                                        </div>
                                    </div>

                                    {/* 🚨 THE OUT OF RANGE WARNING */}
                                    {isOutOfRange && (
                                        <div className="bg-red-100 p-3 rounded-lg flex items-start gap-2 text-sm text-red-700 font-medium">
                                            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                            <p>This address is {currentDistance.toFixed(1)}km away. {cart.shopName} only delivers within {shopDetails?.deliveryRadius || 10}km. Please change your address or select Store Pickup.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-red-50 p-4 rounded-xl border border-red-200 flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-red-700">No Address Selected</h4>
                                        <p className="text-sm text-red-600/80 mt-1">Please select or add a delivery address from the top navigation bar to continue.</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="bg-yellow-50/50 border-yellow-200"><CardContent className="p-6 text-yellow-900 font-bold">Self Pickup Selected (No Fee)</CardContent></Card>
                )}

                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5"/> Payment</CardTitle></CardHeader>
                    <CardContent>
                        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                            <div className={`flex items-center space-x-2 border p-3 rounded-lg cursor-pointer ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                                <RadioGroupItem value="cod" id="cod" />
                                <Label htmlFor="cod" className="flex items-center gap-2 w-full cursor-pointer font-medium">
                                    <Banknote className="h-4 w-4 text-green-600" /> Cash on Delivery
                                </Label>
                            </div>

                            <div className={`flex items-center space-x-2 border p-3 rounded-lg cursor-pointer ${paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                                <RadioGroupItem value="online" id="online" />
                                <Label htmlFor="online" className="flex items-center gap-2 w-full cursor-pointer font-medium">
                                    <CreditCard className="h-4 w-4 text-blue-600" /> Pay with Card (Stripe)
                                </Label>
                            </div>
                        </RadioGroup>
                    </CardContent>
                </Card>
            </>
          )}
        </div>

        <div>
          <Card className="sticky top-24 shadow-lg">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>{cart.shopName}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span>x{item.quantity} {item.name}</span>
                    <span className="font-mono">Rs. {item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>Rs. {cartTotal}</span></div>
                <div className="flex justify-between"><span>Delivery</span><span>{deliveryMode === "home_delivery" ? `Rs. ${deliveryFee}` : "Free"}</span></div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-primary">Rs. {grandTotal}</span></div>
              </div>

              {/* ✅ NEW: Minimum Order Warning */}
              {shopMinimum > 0 && (
                <div className={`p-3 rounded-lg text-sm ${isBelowMinimum ? "bg-amber-50 border border-amber-200 text-amber-800" : "bg-green-50 border border-green-200 text-green-800"}`}>
                  {isBelowMinimum ? (
                    <>
                      <p className="font-semibold">Minimum Order: Rs. {shopMinimum}</p>
                      <p className="mt-1">Add Rs. <span className="font-bold text-amber-900">{remainingForMinimum}</span> more to proceed</p>
                    </>
                  ) : (
                    <p className="font-semibold">✓ Minimum order met ({shopMinimum})</p>
                  )}
                </div>
              )}

              {/* 🚨 BUTTON DISABLED IF OUT OF RANGE OR BELOW MINIMUM */}
              <Button 
                size="lg" 
                className="w-full mt-4 shadow-xl" 
                onClick={handlePlaceOrder} 
                disabled={loading || isBelowMinimum || (deliveryMode === "home_delivery" && (!selectedAddress || isOutOfRange))}
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : (paymentMethod === 'online' ? "Proceed to Payment" : "Place Order")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
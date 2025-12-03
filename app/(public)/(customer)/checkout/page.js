"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/cartContext";
import { toast } from "sonner";
import { useSession } from "next-auth/react"; 

// Components
import CheckoutAuthModal from "@/components/auth/CheckoutAuthModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"; 

// Icons
import { Loader2, MapPin, CreditCard, Banknote, ArrowLeft, ShoppingBag, Lock, Store } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession(); 
  const { cart, cartTotal, clearCart } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Checkout State
  const [deliveryMode, setDeliveryMode] = useState("home_delivery"); // 'home_delivery' | 'store_pickup'
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // Fees Logic
  const deliveryFee = deliveryMode === "home_delivery" ? 50 : 0;
  const grandTotal = cartTotal + deliveryFee;

  useEffect(() => setMounted(true), []);

  const handlePlaceOrder = async () => {
    if (!session) {
        toast.error("Please login first");
        return;
    }

    if (cart.items.length === 0) return toast.error("Cart is empty");
    
    // Manual Validation
    if (deliveryMode === "home_delivery" && (!address || !city)) {
        return toast.error("Please provide a delivery address");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/customer/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId: cart.shopId,
          items: cart.items,
          total: grandTotal,
          paymentMethod,
          deliveryMode, // Saved to DB
          deliveryFee,
          // Only send address if delivery is selected
          deliveryAddress: deliveryMode === "home_delivery" ? { address, city } : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Order placed successfully!");
        clearCart();
        router.push(`/orders/${data.orderId}`); // We will build this page next
      } else {
        toast.error(data.error || "Order failed");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  // 1. Wait for everything to be ready (Session + LocalStorage Mount)
  if (!mounted || status === "loading") {
     return (
       <div className="h-screen flex items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
       </div>
     );
  }

  // 2. Empty Cart State (Only show if truly empty AND user is loaded)
  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-in fade-in zoom-in duration-500">
        <div className="bg-muted p-6 rounded-full">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="text-muted-foreground">Looks like you haven't added anything yet.</p>
        <Link href="/shops"><Button>Browse Shops</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* --- LEFT COLUMN --- */}
        <div className="space-y-6">
          
          {/* Auth Check */}
          {status === "loading" ? (
             <Card><CardContent className="p-8 flex justify-center"><Loader2 className="animate-spin" /></CardContent></Card>
          ) : !session ? (
            
            // --- NOT LOGGED IN ---
            <Card className="border-primary/50 shadow-md">
                <CardHeader className="bg-primary/5">
                    <CardTitle className="text-primary flex items-center gap-2"><Lock className="h-5 w-5" /> Account Required</CardTitle>
                    <CardDescription>Login or register to complete your order.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <CheckoutAuthModal>
                        <Button size="lg" className="w-full shadow-lg">Login / Sign Up</Button>
                    </CheckoutAuthModal>
                </CardContent>
            </Card>

          ) : (

            // --- LOGGED IN FORM ---
            <>
                {/* 1. Delivery Method Toggle */}
                <Tabs value={deliveryMode} onValueChange={setDeliveryMode} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-12">
                        <TabsTrigger value="home_delivery" className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" /> Home Delivery
                        </TabsTrigger>
                        <TabsTrigger value="store_pickup" className="flex items-center gap-2">
                            <Store className="h-4 w-4" /> Pickup
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* 2. Address Form (Manual Inputs for now) */}
                {deliveryMode === "home_delivery" && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5"/> Shipping Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Full Address</Label>
                                <Input 
                                  placeholder="House #, Street, Area, City" 
                                  value={address} 
                                  onChange={(e) => setAddress(e.target.value)} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>City</Label>
                                <Input 
                                  placeholder="Gujrat" 
                                  value={city} 
                                  onChange={(e) => setCity(e.target.value)} 
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* 3. Payment Method */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5"/> Payment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                            <div className={`flex items-center space-x-2 border p-3 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                                <RadioGroupItem value="cod" id="cod" />
                                <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer w-full font-medium">
                                    <Banknote className="h-4 w-4 text-green-600" /> 
                                    {deliveryMode === "store_pickup" ? "Pay at Counter" : "Cash on Delivery"}
                                </Label>
                            </div>
                        </RadioGroup>
                    </CardContent>
                </Card>
            </>
          )}
        </div>

        {/* --- RIGHT COLUMN: Order Summary --- */}
        <div>
          <Card className="sticky top-24 shadow-lg border-primary/20">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Ordering from <span className="font-bold text-primary">{cart.shopName}</span></CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center text-sm group">
                    <div className="flex items-center gap-3">
                       <span className="bg-muted px-2 py-1 rounded text-xs font-bold">x{item.quantity}</span>
                       <span className="line-clamp-1">{item.name}</span>
                    </div>
                    <span className="font-mono">Rs. {item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Rs. {cartTotal}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  {deliveryMode === "home_delivery" ? (
                      <span>Rs. {deliveryFee}</span>
                  ) : (
                      <span className="text-green-600 font-medium">Free (Pickup)</span>
                  )}
                </div>
                
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">Rs. {grandTotal}</span>
                </div>
              </div>

              {session ? (
                  <Button size="lg" className="w-full mt-4 shadow-xl" onClick={handlePlaceOrder} disabled={loading}>
                    {loading ? <Loader2 className="animate-spin mr-2" /> : "Place Order"}
                  </Button>
              ) : (
                  <CheckoutAuthModal>
                     <Button size="lg" className="w-full mt-4 shadow-xl bg-muted text-muted-foreground hover:bg-muted/80">
                        Login to Complete Order
                     </Button>
                  </CheckoutAuthModal>
              )}

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
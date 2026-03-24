
"use client";
import { useEffect, useState, useRef, Suspense } from "react"; // ✅ Imported Suspense
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/context/cartContext";
import { Loader2, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";


function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const sessionId = searchParams.get("session_id");
  
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState(null);

  const hasCalledAPI = useRef(false);

  useEffect(() => {
    if (!sessionId) return;

    if (hasCalledAPI.current) return;
    hasCalledAPI.current = true;

    const verifyPayment = async () => {
      try {
        const res = await fetch("/api/stripe/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        
        const data = await res.json();
        
        if (data.success) {
           setOrderId(data.orderId);
           clearCart(); 
        } else if (data.orderId) {
           setOrderId(data.orderId);
           clearCart();
        }
      } catch (err) {
        console.error("Order creation failed", err);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, clearCart]); 

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-muted-foreground">Verifying your payment...</p>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-xl">
            <div className="flex justify-center">
                <CheckCircle className="h-20 w-20 text-green-500" />
            </div>
            
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Payment Successful!</h1>
                <p className="text-gray-500">Your order has been confirmed and the seller has been notified.</p>
            </div>

            <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-mono font-bold text-lg">#{orderId ? orderId.slice(-6).toUpperCase() : "..."}</p>
            </div>

            <Button className="w-full gap-2" size="lg" onClick={() => router.push(orderId ? `/orders/${orderId}` : '/orders')}>
                View Order Details <ArrowRight className="h-4 w-4" />
            </Button>
        </Card>
    </div>
  );
}

// ✅ 2. Created the new default export that wraps your logic in Suspense
export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-muted-foreground">Loading checkout details...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
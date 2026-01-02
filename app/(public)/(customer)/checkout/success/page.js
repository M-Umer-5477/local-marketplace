"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/context/cartContext";
import { Loader2, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const sessionId = searchParams.get("session_id");
  
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    if (!sessionId) return;

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
           clearCart(); // ✅ Clear the cart now
        }
      } catch (err) {
        console.error("Order creation failed");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

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
  );}
// "use client";

// import { useEffect, useState, useRef } from "react"; // 1. Import useRef
// import { useSearchParams, useRouter } from "next/navigation";
// import { Loader2, CheckCircle } from "lucide-react";

// export default function SuccessPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const sessionId = searchParams.get("session_id");
//   const [status, setStatus] = useState("loading");

//   // ✅ 2. Create a Ref to track if API was called
//   const hasCalledAPI = useRef(false);

//   useEffect(() => {
//     if (!sessionId) return;

//     // ✅ 3. The Guard Clause
//     // If we already called it, STOP immediately.
//     if (hasCalledAPI.current) return;
    
//     // Mark as called
//     hasCalledAPI.current = true;

//     const verifyPayment = async () => {
//       try {
//         const res = await fetch("/api/stripe/verify", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ sessionId }),
//         });

//         const data = await res.json();
        
//         if (data.success) {
//            setStatus("success");
//            // Optional: Clear cart here
//            localStorage.removeItem("cart"); 
//            window.dispatchEvent(new Event("storage")); // Trigger cart update
//         } else {
//            setStatus("error");
//         }
//       } catch (error) {
//         setStatus("error");
//       }
//     };

//     verifyPayment();
//   }, [sessionId]);

//   // ... rest of your UI render ...
//   if (status === "loading") return <div className="p-10 text-center">Verifying Payment...</div>;
//   if (status === "error") return <div className="p-10 text-center text-red-500">Payment Verification Failed</div>;

//   return (
//     <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
//       <CheckCircle className="w-16 h-16 text-green-500" />
//       <h1 className="text-2xl font-bold text-green-700">Payment Successful!</h1>
//       <p>Your order has been placed.</p>
//       <button onClick={() => router.push('/orders')} className="bg-primary text-white px-4 py-2 rounded">
//         View Orders
//       </button>
//     </div>
//   );
// }
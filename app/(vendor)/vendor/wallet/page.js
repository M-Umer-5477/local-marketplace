"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import PayDuesModal from "@/components/seller/PayDuesModal";
import WithdrawModal from "@/components/seller/WithdrawModal";

/* ------------------------------------------------------------------ */
/*  Wallet Page – Inner Content (needs Suspense for useSearchParams)   */
/* ------------------------------------------------------------------ */
function WalletContent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  /* ---------- Fetch wallet data ---------- */
  const fetchWallet = async () => {
    try {
      const res = await fetch("/api/vendor/wallet");
      const json = await res.json();
      if (json.success) setData(json.wallet);
    } catch (err) {
      toast.error("Failed to load wallet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  /* ---------- Verify Stripe session on redirect ---------- */
  useEffect(() => {
    if (!sessionId) return;

    setVerifying(true);

    const verifyDues = async () => {
      try {
        const res = await fetch("/api/stripe/dues/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const result = await res.json();

        if (result.success) {
          toast.success("Dues cleared successfully!");
          router.replace("/vendor/wallet");
          fetchWallet();
        } else {
          toast.error(result.error || "Failed to verify dues payment");
        }
      } catch (err) {
        toast.error("Network error during verification");
      } finally {
        setVerifying(false);
      }
    };

    verifyDues();
  }, [sessionId, router]);

  /* ---------- Loading / verifying state ---------- */
  if (loading || verifying) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  /* ---------- Render ---------- */
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* ==================== BALANCE CARD ==================== */}
      <Card className="bg-linear-to-br from-gray-900 to-gray-800 text-white border-none shadow-xl">
        <CardContent className="p-8">
          <div className="flex justify-between items-start">
            {/* Balance info */}
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">
                Current Wallet Balance
              </p>
              <h1
                className={`text-4xl font-bold ${
                  data?.balance < 0 ? "text-red-400" : "text-green-400"
                }`}
              >
                Rs. {data?.balance?.toLocaleString()}
              </h1>
              <p className="text-xs text-gray-500 mt-2">
                {data?.balance < 0
                  ? "You owe this amount to the platform."
                  : "Available for withdrawal."}
              </p>
            </div>

            {/* Action button */}
            <div className="flex gap-3">
              {data?.balance < 0 ? (
                <PayDuesModal
                  balance={data?.balance}
                  onPaymentSuccess={() => window.location.reload()}
                />
              ) : (
                <WithdrawModal
                  balance={data?.balance}
                  savedPayoutDetails={data?.savedPayoutDetails}
                  onSuccess={() => window.location.reload()}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ==================== TRANSACTION HISTORY ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ---------- Recent Activity (left – wider) ---------- */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 min-h-0">
            <div className="max-h-[420px] overflow-y-auto pr-1 space-y-4">
              {data?.history?.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No transactions yet.
                </p>
              ) : (
                data?.history?.map((txn, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 border rounded-lg bg-muted/20"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          txn.type === "Credit"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {txn.type === "Credit" ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-medium">
                          {txn.description || txn.category.replace("_", " ")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(txn.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`font-bold ${
                        txn.type === "Credit"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {txn.type === "Credit" ? "+" : "-"} Rs. {txn.amount}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* ---------- Requests (right – narrow) ---------- */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Requests</CardTitle>
          </CardHeader>

          <CardContent className="flex-1 min-h-0">
            <div className="max-h-[420px] overflow-y-auto pr-1 space-y-3">
              {data?.requests?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  No pending requests
                </div>
              ) : (
                data?.requests?.map((req) => (
                  <div key={req._id} className="p-3 border rounded-md text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold">
                        {req.category.replace("_", " ")}
                      </span>
                      <Badge
                        variant={
                          req.status === "Pending" ? "outline" : "default"
                        }
                      >
                        {req.status}
                      </Badge>
                    </div>

                    <div className="flex justify-between text-muted-foreground text-xs">
                      <span>
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                      <span>Rs. {req.amount}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Default Export – wraps content in Suspense for useSearchParams     */
/* ------------------------------------------------------------------ */
export default function WalletPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      }
    >
      <WalletContent />
    </Suspense>
  );
}
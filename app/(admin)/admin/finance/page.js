"use client";
import { useEffect, useState } from "react";
import { Loader2, DollarSign, Wallet, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function FinancePage() {
  const [debtors, setDebtors] = useState([]);
  const [totalDebt, setTotalDebt] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/finance");
      const data = await res.json();
      if (data.success) {
        setDebtors(data.debtors);
        setTotalDebt(data.totalMarketDebt);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Mock function to simulate collecting cash from a seller
 // ... imports

  // Updated Handler
  const handleMarkPaid = async (sellerId) => {
    // Optional: Add a confirm dialog here if you want extra safety
    if(!confirm("Confirm that you received cash from this seller?")) return;

    try {
      const res = await fetch("/api/admin/finance/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId }),
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success("Debt cleared successfully!");
        // Refresh the list automatically
        fetchData();
      } else {
        toast.error(data.error || "Failed to clear");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };
// ... rest of component

  if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-foreground">Financial Overview</h2>

      {/* Stats Card */}
      <div className="grid gap-4 md:grid-cols-2">
         <Card className="bg-primary text-primary-foreground border-none shadow-md">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium opacity-90">Total Receivables (Market Debt)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold flex items-center">
                    Rs. {totalDebt.toLocaleString()}
                </div>
                <p className="text-sm opacity-80 mt-1">Commission money currently held by sellers (COD)</p>
            </CardContent>
         </Card>
      </div>

      {/* Debtors List */}
      <Card className="bg-card text-card-foreground">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="text-orange-500 dark:text-orange-400 h-5 w-5" />
                Outstanding Balances
            </CardTitle>
        </CardHeader>
        <CardContent>
            {debtors.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                    No sellers owe money right now.
                </div>
            ) : (
                <div className="space-y-4">
                    {debtors.map((seller) => (
                        <div key={seller._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors gap-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-background p-2 rounded-full border shadow-sm h-12 w-12 flex items-center justify-center font-bold text-lg text-foreground shrink-0">
                                    {seller.shopName.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-foreground">{seller.shopName}</h4>
                                    <p className="text-sm text-muted-foreground">{seller.phone}</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-0">
                                <div className="text-left sm:text-right">
                                    <div className="font-mono text-red-600 dark:text-red-400 font-bold text-xl">
                                        Rs. {seller.walletBalance}
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2">Net Balance</p>
                                </div>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="dark:border-zinc-700 dark:hover:bg-zinc-800"
                                    onClick={() => handleMarkPaid(seller._id)}
                                >
                                    Mark Paid
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";
import { Loader2, DollarSign, Wallet, AlertTriangle, ArrowUpRight, ArrowDownLeft, CheckCircle2, Eye, CreditCard, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function FinancePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/finance");
      const json = await res.json();
      if (json.success) {
        setData(json);
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

  // Handler for Inbox Requests (Vendor Initiated)
  const handleInboxAction = async (id, action) => {
    setProcessing(id);
    try {
      const res = await fetch("/api/admin/finance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: id, action }),
      });
      
      if (res.ok) {
        toast.success(`Request ${action}d!`);
        fetchData();
      } else {
        toast.error("Action failed");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setProcessing(null);
    }
  };

  // Handler for Ledger Manual Interventions (Admin Initiated)
  const handleLedgerAction = async (sellerId, action) => {
    const isCollect = action === "collect";
    
    try {
      setProcessing(sellerId);
      const res = await fetch("/api/admin/finance/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, action }),
      });

      const responseData = await res.json();
      
      if (responseData.success) {
        toast.success(isCollect ? "Debt cleared successfully!" : "Payout logged successfully!");
        fetchData();
      } else {
        toast.error(responseData.error || "Failed to process request");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setProcessing(null);
    }
  };


  if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Financial Operations Hub</h2>
        <p className="text-muted-foreground">Manage vendor requests, outstanding dues, and proactive seller payouts.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
         <Card className="border-l-4 border-l-green-500 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Platform Receivables (Sellers Owe Us)</CardTitle>
                <ArrowDownLeft className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                    Rs. {data?.summary?.totalReceivable?.toLocaleString?.() || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Pending COD commissions</p>
            </CardContent>
         </Card>

         <Card className="border-l-4 border-l-orange-500 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Platform Debt (We Owe Sellers)</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                    Rs. {data?.summary?.totalPayable?.toLocaleString?.() || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Pending Stripe deposits waiting for payout</p>
            </CardContent>
         </Card>
      </div>

      <Tabs defaultValue="inbox" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="inbox" className="flex items-center gap-2">
                Inbox {data?.requests?.length > 0 && <Badge variant="destructive" className="h-5 px-1.5">{data.requests.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="payables">To Pay Sellers</TabsTrigger>
            <TabsTrigger value="receivables">To Collect</TabsTrigger>
        </TabsList>

        {/* --- TAB 1: INBOX (Vendor Initiated Requests) --- */}
        <TabsContent value="inbox" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Vendor Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {!data?.requests || data.requests.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground bg-muted/10 rounded-lg border border-dashed flex flex-col items-center">
                   <CheckCircle2 className="h-8 w-8 text-green-500/50 mb-2" />
                   No pending requests from vendors.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3">Shop Name</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Details</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.requests.map((req) => (
                        <tr key={req._id} className="hover:bg-muted/10">
                          <td className="px-4 py-3 font-medium">
                            {req.seller?.shopName || "Unknown Shop"}
                            <div className="text-xs text-muted-foreground">{req.seller?.phone}</div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={req.category === "Dues_Clearing" ? "default" : "secondary"}>
                               {req.category === "Dues_Clearing" ? "Cash Deposit Proof" : "Withdrawal Request"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-bold">Rs. {req.amount}</td>
                          
                          <td className="px-4 py-3">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                  {req.category === "Dues_Clearing" ? <ImageIcon className="h-3 w-3" /> : <CreditCard className="h-3 w-3" />}
                                  {req.category === "Dues_Clearing" ? "View Proof" : "Bank Info"}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Transaction Details</DialogTitle>
                                </DialogHeader>
                                
                                {req.category === "Dues_Clearing" && req.proofImage && (
                                    <img src={req.proofImage} alt="Proof" className="w-full rounded-lg" />
                                )}

                                {req.category === "Payout_Withdrawal" && (
                                    <div className="space-y-4 py-2">
                                        <div className="p-4 bg-muted rounded-lg space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Method:</span>
                                                <span className="font-bold">{req.method}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Account Title:</span>
                                                <span className="font-bold">{req.bankDetails?.accountTitle}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Number/IBAN:</span>
                                                <span className="font-mono bg-white px-2 py-0.5 rounded border select-all">
                                                    {req.bankDetails?.accountNumber}
                                                </span>
                                            </div>
                                            <div className="flex justify-between pt-2 border-t">
                                                <span className="text-muted-foreground">Amount:</span>
                                                <span className="font-bold text-green-600 text-lg">Rs. {req.amount}</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground text-center">
                                            Transfer funds to this account manually before clicking Approve.
                                        </p>
                                    </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </td>

                          <td className="px-4 py-3 text-right space-x-2">
                            <Button 
                              size="sm" 
                              variant="destructive"
                              disabled={processing === req._id}
                              onClick={() => handleInboxAction(req._id, "Reject")}
                            >
                              Reject
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              disabled={processing === req._id}
                              onClick={() => handleInboxAction(req._id, "Approve")}
                            >
                              {processing === req._id ? <Loader2 className="animate-spin h-4 w-4" /> : "Approve"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB 2: PAYABLES (Admin Initiated Payouts) --- */}
        <TabsContent value="payables" className="mt-4">
            <Card className="bg-card text-card-foreground">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wallet className="text-orange-500 h-5 w-5" />
                        Earnings Awaiting Payout
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!data?.payables?.creditors || data.payables.creditors.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground bg-muted/10 rounded-lg border border-dashed flex flex-col items-center">
                            <CheckCircle2 className="h-8 w-8 text-green-500/50 mb-2" />
                            All sellers have been paid out!
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {data.payables.creditors.map((seller) => (
                                <div key={seller._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-orange-50/10 dark:bg-orange-950/20 hover:bg-muted/50 transition-colors gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-background p-2 rounded-full border border-orange-100 shadow-sm h-12 w-12 flex items-center justify-center font-bold text-lg text-orange-600 shrink-0">
                                            {seller.shopName.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-foreground">{seller.shopName}</h4>
                                            <p className="text-sm text-muted-foreground">{seller.email}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-center gap-2 flex-col sm:flex-row">
                                        {/* Bank Details Dialog */}
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" className="gap-2">
                                                    <CreditCard className="h-4 w-4 text-orange-500" />
                                                    View Details
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>Seller Payout Details</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4 py-2">
                                                    {seller.savedPayoutDetails ? (
                                                        <div className="p-4 bg-muted rounded-lg space-y-2">
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Method:</span>
                                                                <span className="font-bold">{seller.savedPayoutDetails.method || "EasyPaisa"}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Account Title:</span>
                                                                <span className="font-bold">{seller.savedPayoutDetails.accountTitle || "N/A"}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Number/IBAN:</span>
                                                                <span className="font-mono bg-white px-2 py-0.5 rounded border select-all">
                                                                    {seller.savedPayoutDetails.accountNumber || "N/A"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-center text-muted-foreground py-4 border border-dashed rounded-lg">Seller has not provided payout details.</p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground text-center">
                                                        Transfer exactly <strong>Rs. {seller.walletBalance}</strong> to this account manually before clicking Initiate Payout.
                                                    </p>
                                                    <AlertDialog>
                                                      <AlertDialogTrigger asChild>
                                                        <Button 
                                                            className="w-full bg-orange-600 hover:bg-orange-700 mt-2" 
                                                            disabled={processing === seller._id}
                                                        >
                                                            {processing === seller._id ? <Loader2 className="animate-spin h-4 w-4" /> : "Initiate Payout Now"}
                                                        </Button>
                                                      </AlertDialogTrigger>
                                                      <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                          <AlertDialogTitle>Confirm Payout</AlertDialogTitle>
                                                          <AlertDialogDescription>
                                                            Have you already manually transferred exactly Rs. {seller.walletBalance} to {seller.shopName}'s account? This action will reset their payout balance to zero.
                                                          </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                          <AlertDialogAction onClick={() => handleLedgerAction(seller._id, "payout")} className="bg-orange-600 hover:bg-orange-700">Confirm & Reset</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                      </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </DialogContent>
                                        </Dialog>

                                        <div className="text-left sm:text-right ml-4">
                                            <div className="font-mono text-orange-600 dark:text-orange-400 font-bold text-xl">
                                                Rs. {seller.walletBalance}
                                            </div>
                                            <p className="text-xs text-muted-foreground mb-2 sm:mb-0">Payout Owed</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        {/* --- TAB 3: RECEIVABLES (Admin Initiated Collections) --- */}
        <TabsContent value="receivables" className="mt-4">
            <Card className="bg-card text-card-foreground">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="text-red-500 h-5 w-5" />
                        Outstanding Collections
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!data?.receivables?.debtors || data.receivables.debtors.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground bg-muted/10 rounded-lg border border-dashed flex flex-col items-center">
                            <CheckCircle2 className="h-8 w-8 text-green-500/50 mb-2" />
                            No sellers owe money right now.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {data.receivables.debtors.map((seller) => (
                                <div key={seller._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-red-50/10 dark:bg-red-950/20 hover:bg-muted/50 transition-colors gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-background p-2 rounded-full border border-red-100 shadow-sm h-12 w-12 flex items-center justify-center font-bold text-lg text-red-600 shrink-0">
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
                                                Rs. {Math.abs(seller.walletBalance)}
                                            </div>
                                            <p className="text-xs text-muted-foreground mb-2">Debt Owed to Us</p>
                                        </div>
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                                                disabled={processing === seller._id}
                                            >
                                                {processing === seller._id ? <Loader2 className="animate-spin h-4 w-4" /> : "Mark Paid (Cash)"}
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Confirm Cash Collection</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                Have you physically collected exactly Rs. {Math.abs(seller.walletBalance)} from {seller.shopName}? This will clear their debt.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction onClick={() => handleLedgerAction(seller._id, "collect")} className="bg-green-600 hover:bg-green-700">Confirm Collected</AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

      </Tabs>
      
    </div>
  );
}
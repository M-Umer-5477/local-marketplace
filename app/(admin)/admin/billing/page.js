
"use client";
import { useEffect, useState } from "react";
import { Loader2, Eye, CreditCard, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AdminBillingPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/billing");
      const data = await res.json();
      if (data.success) setRequests(data.requests);
    } catch (error) {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    setProcessing(id);
    try {
      const res = await fetch("/api/admin/billing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: id, action }),
      });
      
      if (res.ok) {
        toast.success(`Request ${action}d!`);
        setRequests(requests.filter(r => r._id !== id));
      } else {
        toast.error("Action failed");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Billing Requests</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals ({requests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No pending requests.</p>
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
                  {requests.map((req) => (
                    <tr key={req._id} className="hover:bg-muted/10">
                      <td className="px-4 py-3 font-medium">
                        {req.seller?.shopName || "Unknown Shop"}
                        <div className="text-xs text-muted-foreground">{req.seller?.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={req.category === "Dues_Clearing" ? "default" : "secondary"}>
                           {req.category === "Dues_Clearing" ? "Deposit" : "Withdrawal"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-bold">Rs. {req.amount}</td>
                      
                      {/* DYNAMIC DETAILS BUTTON */}
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
                            
                            {/* CASE 1: DEPOSIT PROOF */}
                            {req.category === "Dues_Clearing" && req.proofImage && (
                                <img src={req.proofImage} alt="Proof" className="w-full rounded-lg" />
                            )}

                            {/* CASE 2: WITHDRAWAL BANK INFO */}
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
                                        Please transfer funds to this account manually before clicking Approve.
                                    </p>
                                </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </td>

                      {/* ACTION BUTTONS */}
                      <td className="px-4 py-3 text-right space-x-2">
                        <Button 
                          size="sm" 
                          variant="destructive"
                          disabled={processing === req._id}
                          onClick={() => handleAction(req._id, "Reject")}
                        >
                          Reject
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          disabled={processing === req._id}
                          onClick={() => handleAction(req._id, "Approve")}
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
    </div>
  );
}
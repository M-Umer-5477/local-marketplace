"use client";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
        // Remove from list
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
                    <th className="px-4 py-3">Proof</th>
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
                           {req.category === "Dues_Clearing" ? "Deposit (Paying Dues)" : "Withdrawal"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-bold">Rs. {req.amount}</td>
                      
                      {/* VIEW PROOF BUTTON */}
                      <td className="px-4 py-3">
                        {req.proofImage ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="gap-2">
                                <Eye className="h-3 w-3" /> View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <img src={req.proofImage} alt="Proof" className="w-full rounded-lg" />
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <span className="text-muted-foreground italic">No Image</span>
                        )}
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
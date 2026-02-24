"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, RefreshCw, AlertCircle, CheckCircle, CreditCard, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Processing State
  const [selectedOrder, setSelectedOrder] = useState(null); 
  const [processingId, setProcessingId] = useState(null);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/refunds");
      const data = await res.json();
      if (data.success) {
        setRefunds(data.refunds);
      }
    } catch (error) {
      toast.error("Failed to load pending refunds");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  // 🚨 The Function that actually processes the refund
  const executeRefund = async () => {
    if (!selectedOrder) return;
    setProcessingId(selectedOrder._id);
    
    try {
      const res = await fetch("/api/admin/refunds", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: selectedOrder._id }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Refund marked as resolved!");
        // Instantly remove from UI
        setRefunds((prev) => prev.filter((r) => r._id !== selectedOrder._id));
      } else {
        toast.error(data.error || "Failed to process refund");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setProcessingId(null);
      setSelectedOrder(null); // Close the modal
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Refund Management</h1>
          <p className="text-muted-foreground mt-1">Review and process refunds for cancelled online orders.</p>
        </div>
        <Button variant="outline" onClick={fetchRefunds} size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" /> Action Required
          </CardTitle>
          <CardDescription>
            These orders were paid via Stripe but cancelled by the vendor. The customers are waiting for their money back.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : refunds.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
              <CheckCircle className="h-10 w-10 mx-auto mb-3 text-green-500 opacity-50" />
              <p className="font-medium text-lg">All caught up!</p>
              <p className="text-sm">There are no pending refunds right now.</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Shop</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Stripe Ref</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {refunds.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">#{order._id.slice(-6).toUpperCase()}</TableCell>
                      <TableCell>{order.shopId?.shopName}</TableCell>
                      <TableCell>
                        <p className="text-sm">{order.userId?.name}</p>
                        <p className="text-xs text-muted-foreground">{order.userId?.phone}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-[10px] bg-slate-100">
                          {order.stripeSessionId ? order.stripeSessionId.slice(0, 15) + "..." : "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        Rs. {order.total}
                      </TableCell>
                      <TableCell className="text-right">
                        {/* 🚨 Opens the Modal instead of triggering logic instantly */}
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <CreditCard className="h-4 w-4 mr-2" /> Issue Refund
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🚨 BEAUTIFUL CONFIRMATION MODAL */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 text-red-600 rounded-full">
                    <ShieldAlert className="h-6 w-6" />
                </div>
                <DialogTitle>Confirm Refund</DialogTitle>
            </div>
            <DialogDescription>
              You are about to issue a manual refund. Make sure you have processed the return via your Stripe dashboard.
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
              <div className="bg-muted/50 p-4 rounded-lg my-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID:</span>
                      <span className="font-medium">#{selectedOrder._id.slice(-6).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-muted-foreground">Customer:</span>
                      <span className="font-medium">{selectedOrder.userId?.name}</span>
                  </div>
                  <div className="flex justify-between text-base pt-2 border-t">
                      <span className="font-bold text-foreground">Refund Amount:</span>
                      <span className="font-bold text-primary">Rs. {selectedOrder.total}</span>
                  </div>
              </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setSelectedOrder(null)} disabled={processingId}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={executeRefund} disabled={processingId}>
              {processingId ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Confirm & Resolve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
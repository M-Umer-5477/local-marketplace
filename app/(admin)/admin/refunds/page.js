"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, RefreshCw, CreditCard, ShieldAlert, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminRefundsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modal & Processing State
  const [selectedOrder, setSelectedOrder] = useState(null); 
  const [processingId, setProcessingId] = useState(null);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/refunds`);
      const result = await res.json();
      if (result.success) {
        setData(result);
      }
    } catch (error) {
      toast.error("Failed to load refunds");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const executeRefund = async () => {
    if (!selectedOrder) return;
    setProcessingId(selectedOrder._id);
    
    try {
      const res = await fetch("/api/admin/refunds", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: selectedOrder._id }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Refund processed successfully!");
        fetchRefunds(); // Refetch perfectly moves it to approved table natively
      } else {
        toast.error(result.error || "Failed to process refund");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setProcessingId(null);
      setSelectedOrder(null);
    }
  };

  const stats = data?.stats || {};
  const pendingRefunds = data?.pendingRefunds || [];
  const approvedRefunds = data?.approvedRefunds || [];

  return (
    <div className="space-y-8">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Refund Management</h1>
          <p className="text-muted-foreground mt-1">Review and process refunds for cancelled online orders</p>
        </div>
        <Button variant="outline" onClick={fetchRefunds} size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.pending || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting resolution</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.overdueRefunds || 0}</div>
            <p className="text-xs text-muted-foreground">&gt;3 days pending</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.approved || 0}</div>
            <p className="text-xs text-muted-foreground">Processed entirely</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">Rs. {stats.totalRefundValue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">All refunds tracked</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Refund Queue
          </CardTitle>
          <CardDescription>
            Customers waiting for their Stripe refund due to cancelled/unpicked orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">Pending Action ({stats.pending || 0})</TabsTrigger>
              <TabsTrigger value="approved">Processed Refunds ({stats.approved || 0})</TabsTrigger>
            </TabsList>

            {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
                <>
                    {/* PENDING TAB */}
                    <TabsContent value="pending" className="mt-6">
                        {pendingRefunds.length === 0 ? (
                            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
                            <CheckCircle className="h-10 w-10 mx-auto mb-3 text-green-500 opacity-50" />
                            <p className="font-medium text-lg">All caught up!</p>
                            <p className="text-sm">No pending refunds.</p>
                            </div>
                        ) : (
                            <div className="border rounded-lg overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Shop</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {pendingRefunds.map((order) => (
                                    <TableRow key={order._id} className="hover:bg-muted/20">
                                    <TableCell className="font-medium">
                                        <Badge variant="outline">#{order._id.slice(-6).toUpperCase()}</Badge>
                                    </TableCell>
                                    <TableCell>{order.shopId?.shopName || "N/A"}</TableCell>
                                    <TableCell>
                                        <p className="text-sm font-medium">{order.userId?.name}</p>
                                        <p className="text-xs text-muted-foreground">{order.userId?.phone}</p>
                                    </TableCell>
                                    <TableCell className="font-bold text-primary">
                                        Rs. {order.total?.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            size="sm" 
                                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                            onClick={() => setSelectedOrder(order)}
                                        >
                                            <CreditCard className="h-4 w-4 mr-1" /> Process
                                        </Button>
                                    </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                            </div>
                        )}
                    </TabsContent>

                    {/* APPROVED TAB */}
                    <TabsContent value="approved" className="mt-6">
                        {approvedRefunds.length === 0 ? (
                            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
                            <p className="font-medium text-lg">No processed refunds found.</p>
                            </div>
                        ) : (
                            <div className="border rounded-lg overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Shop</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {approvedRefunds.map((order) => (
                                    <TableRow key={order._id} className="hover:bg-muted/20">
                                    <TableCell className="font-medium">
                                        <Badge variant="outline">#{order._id.slice(-6).toUpperCase()}</Badge>
                                    </TableCell>
                                    <TableCell>{order.shopId?.shopName || "N/A"}</TableCell>
                                    <TableCell>
                                        <p className="text-sm font-medium">{order.userId?.name}</p>
                                        <p className="text-xs text-muted-foreground">{order.userId?.phone}</p>
                                    </TableCell>
                                    <TableCell className="font-bold text-primary">
                                        Rs. {order.total?.toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-0">
                                            <CheckCircle className="h-3 w-3 mr-1" /> Approved & Refunded
                                        </Badge>
                                    </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                            </div>
                        )}
                    </TabsContent>
                </>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 text-primary rounded-full">
                    <ShieldAlert className="h-6 w-6" />
                </div>
                <DialogTitle>Process Refund</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to process this refund? This will reverse the Stripe charge and notify the customer.
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
              <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Order ID:</span>
                        <span className="font-medium font-mono">#{selectedOrder._id.slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Customer:</span>
                        <span className="font-medium">{selectedOrder.userId?.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Shop:</span>
                        <span className="font-medium">{selectedOrder.shopId?.shopName}</span>
                    </div>
                    <div className="flex justify-between text-base pt-3 border-t">
                        <span className="font-bold text-foreground">Refund Amount:</span>
                        <span className="font-bold text-primary">Rs. {selectedOrder.total?.toLocaleString()}</span>
                    </div>
                  </div>
              </div>
          )}

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setSelectedOrder(null)} disabled={!!processingId}>
              Cancel
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={executeRefund} disabled={!!processingId}>
              {processingId ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {processingId ? "Processing Stripe API..." : "Confirm & Refund via Stripe"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
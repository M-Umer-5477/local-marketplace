"use client";

import { useEffect, useState, useCallback, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Loader2,
  Users,
  Wallet,
  ArrowLeft,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSeller } from "@/app/(vendor)/SellerContext"; 
// --- Constants ---
const ITEMS_PER_PAGE = 10;

export default function KhataManagementPage() {
  const [khatas, setKhatas] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);

  // --- Search & Pagination ---
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // --- Loaders ---
  const [isLoadingKhatas, setIsLoadingKhatas] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(null); // Stores ID of order being paid

  // --- Payment States ---
  const [paymentAmounts, setPaymentAmounts] = useState({});

  // --- States for Bulk Pay & Details ---
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);
  const [bulkPaymentAmount, setBulkPaymentAmount] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);

const { user } = useSeller(); 
  const userId = user.id; 

  // --- Data Fetching ---
  const fetchKhatas = useCallback(async () => {
    setIsLoadingKhatas(true);
    try {
      const res = await fetch(`/api/vendor/khata/list`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch khatas");
      const activeKhatas = data.khatas.filter((k) => k.totalBalance > 0);
      setKhatas(activeKhatas);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoadingKhatas(false);
    }
  }, []);

  const viewDetails = useCallback(async (phone) => {
    setSelected(phone);
    setIsLoadingDetails(true);
    setOrders([]);
    setBulkPaymentAmount("");
    setExpandedOrderId(null);
    setPaymentAmounts({});
    try {
      const res = await fetch(`/api/vendor/khata/details?phone=${phone}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch details");
      setOrders(data.orders);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  // --- Memoized Calculations ---
  
  const selectedCustomerTotalBalance = useMemo(() => {
    return orders.reduce((acc, order) => acc + order.balance, 0);
  }, [orders]);

  // --- Payment Handlers ---
  const addPayment = useCallback(
    async (orderId) => {
      const amount = Number(paymentAmounts[orderId] || 0);
      if (amount <= 0) return toast.error("Enter a valid amount");

      const order = orders.find((o) => o._id === orderId);
      if (order && amount > order.balance) {
        toast.error(
          `Payment cannot exceed remaining balance of Rs ${order.balance}`
        );
        return;
      }

      setIsSubmitting(orderId); // Set ID of submitting order
      try {
        const res = await fetch(`/api/vendor/khata/add-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, amount }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Payment failed");

        toast.success("Payment recorded successfully");
        setPaymentAmounts((prev) => ({ ...prev, [orderId]: "" }));
        await Promise.all([viewDetails(selected), fetchKhatas()]);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setIsSubmitting(null); // Clear submitting ID
      }
    },
    [paymentAmounts, selected, fetchKhatas, viewDetails, orders]
  );

  const handleBulkPayment = useCallback(
    async () => {
      const amount = Number(bulkPaymentAmount);
      if (amount <= 0) return toast.error("Enter a valid amount");

      if (amount > selectedCustomerTotalBalance) {
        toast.error(
          `Payment cannot exceed total balance of Rs ${selectedCustomerTotalBalance}`
        );
        return;
      }

      if (!selected) return toast.error("No customer selected");

      setIsSubmittingBulk(true);
      try {
        const res = await fetch(`/api/vendor/khata/add-bulk-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerPhone: selected, amount }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Bulk payment failed");

        toast.success(data.message || "Bulk payment recorded!");
        setBulkPaymentAmount("");
        await Promise.all([viewDetails(selected), fetchKhatas()]);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setIsSubmittingBulk(false);
      }
    },
    [
      bulkPaymentAmount,
      selected,
      fetchKhatas,
      viewDetails,
      selectedCustomerTotalBalance,
    ]
  );

  // --- Effects & Handlers ---
  useEffect(() => {
    fetchKhatas();
  }, [fetchKhatas]);

  const handleAmountChange = (orderId, value) => {
    const order = orders.find((o) => o._id === orderId);
    if (!order) return;

    const numericValue = Number(value);

    if (value !== "" && !isNaN(numericValue) && numericValue > order.balance) {
      setPaymentAmounts((prev) => ({
        ...prev,
        [orderId]: order.balance.toString(),
      }));
    } else {
      setPaymentAmounts((prev) => ({
        ...prev,
        [orderId]: value,
      }));
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const nextPage = () => setCurrentPage((prev) => prev + 1);
  const prevPage = () => setCurrentPage((prev) => prev - 1);

  const toggleDetails = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  // --- Final Memoized Calculations for Rendering ---
  const filteredKhatas = khatas.filter((k) =>
    k.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredKhatas.length / ITEMS_PER_PAGE);

  const paginatedKhatas = filteredKhatas.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // --- Render ---
  // The 'status' check related to useSession is no longer needed since we use useSeller context
  // But we keep a loading check for the dashboard itself
  if (isLoadingKhatas && !khatas.length && !selected) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center text-foreground">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-full mx-auto">
      <div className="flex items-center gap-2 text-foreground">
        <Wallet className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Khata Management</h1>
      </div>

      {/* Card inherits bg-card and border-border */}
      <Card className="shadow-md"> 
        {!selected ? (
          // STATE 1: Khata Customers List
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground text-lg">
                <Users className="w-5 h-5 text-primary" /> Khata Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by customer name..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>

              {isLoadingKhatas ? (
                <div className="flex justify-center py-8 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
                </div>
              ) : khatas.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">
                  No active Khata records found.
                </p>
              ) : filteredKhatas.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No customers match your search.
                </p>
              ) : (
                <div className="space-y-2">
                  {paginatedKhatas.map((k) => (
                    <div
                      key={k._id}
                      className={`flex justify-between items-center p-3 border rounded-xl cursor-pointer transition-all border-border ${
                        // FIX: Active state uses theme-aware colors
                        selected === k._id
                          ? "bg-primary/20 border-primary shadow-sm"
                          : "hover:bg-accent/40" // FIX: Hover state uses accent
                      }`}
                      onClick={() => viewDetails(k._id)}
                    >
                      <div>
                        {/* FIX: Text colors */}
                        <p className="font-medium text-foreground">
                          {k.customerName}
                        </p>
                        <p className="text-xs text-muted-foreground">{k._id}</p>
                      </div>
                      {/* FIX: Balance text color uses destructive */}
                      <span className="text-destructive font-semibold text-sm">
                        Rs {k.totalBalance.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                // FIX: border-t border-border
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevPage}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </>
        ) : (
          // STATE 2: Customer Orders
          <>
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                <ArrowLeft
                  onClick={() => setSelected(null)}
                  // FIX: Text colors for back arrow
                  className="w-4 h-4 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                />
                Orders — {selected}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingDetails ? (
                <ScrollArea className="h-[60vh]">
                  <div className="space-y-3">
                    <OrderSkeleton />
                    <OrderSkeleton />
                    <OrderSkeleton />
                  </div>
                </ScrollArea>
              ) : (
                <>
                  {/* Bulk Payment Section */}
                  {/* FIX: bg-gray-50 -> bg-muted/40, border -> border-border */}
                  <div className="p-3 border border-border rounded-xl bg-muted/40 mb-4">
                    <p className="text-sm font-medium text-foreground">
                      Total Outstanding Balance
                    </p>
                    {/* FIX: Total balance uses destructive color */}
                    <p className="text-2xl font-bold text-destructive mb-2">
                      Rs {selectedCustomerTotalBalance.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Enter total payment"
                        // FIX: bg-white -> bg-background
                        className="max-w-xs bg-background" 
                        value={bulkPaymentAmount}
                        onChange={(e) => {
                          const numericValue = Number(e.target.value);
                          if (
                            e.target.value !== "" &&
                            !isNaN(numericValue) &&
                            numericValue > selectedCustomerTotalBalance
                          ) {
                            setBulkPaymentAmount(
                              selectedCustomerTotalBalance.toString()
                            );
                          } else {
                            setBulkPaymentAmount(e.target.value);
                          }
                        }}
                        disabled={isSubmittingBulk || isSubmitting !== null}
                      />
                      <Button
                        onClick={handleBulkPayment}
                        disabled={isSubmittingBulk || isSubmitting !== null}
                      >
                        {isSubmittingBulk ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Add Bulk Payment"
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {orders.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      No pending orders for this customer.
                    </p>
                  ) : (
                    <ScrollArea className="h-[50vh]">
                      <div className="space-y-3">
                        {orders.map((o) => (
                          <div
                            key={o._id}
                            // FIX: border -> border-border, shadow-sm transition-all
                            className="p-3 border border-border rounded-xl shadow-sm transition-all hover:bg-accent/20"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                {/* FIX: text-gray-600 -> text-muted-foreground */}
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-medium text-foreground">Order ID:</span>{" "}
                                  {o._id}
                                </p>
                                {/* FIX: text-gray-600 -> text-muted-foreground */}
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-medium text-foreground">Total:</span> Rs{" "}
                                  {o.total}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleDetails(o._id)}
                                // FIX: text-blue-600 -> text-primary (Themed link color)
                                className="text-xs text-primary hover:text-primary/80"
                              >
                                {expandedOrderId === o._id ? "Hide" : "Details"}
                                {expandedOrderId === o._id ? (
                                  <ChevronUp className="w-3 h-3 ml-1" />
                                ) : (
                                  <ChevronDown className="w-3 h-3 ml-1" />
                                )}
                              </Button>
                            </div>

                            {/* FIX: Remaining balance uses destructive color */}
                            <p className="text-sm text-destructive font-semibold mb-3">
                              Remaining: Rs {o.balance}
                            </p>

                            {/* Collapsible Details */}
                            {expandedOrderId === o._id && (
                              // FIX: border-t -> border-t border-border
                              <div className="mt-3 pt-3 border-t border-border">
                                <h4 className="font-medium text-sm mb-2 text-foreground">
                                  Order Items:
                                </h4>
                                {/* FIX: text-gray-600 -> text-muted-foreground */}
                                <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                                  {o.items.map((item, index) => (
                                    <li key={item.productId || index}>
                                      {item.name} ({item.quantity} x Rs{" "}
                                      {item.price}) = Rs {item.subtotal}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Per-Order Payment */}
                            {/* FIX: border-t -> border-t border-border */}
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                              <Input
                                type="number"
                                placeholder="Pay this order"
                                value={paymentAmounts[o._id] || ""}
                                onChange={(e) =>
                                  handleAmountChange(o._id, e.target.value)
                                }
                                className="w-32 text-sm"
                                disabled={
                                  isSubmitting !== null || isSubmittingBulk
                                }
                              />
                              <Button
                                size="sm"
                                onClick={() => addPayment(o._id)}
                                disabled={
                                  isSubmitting !== null || isSubmittingBulk
                                }
                              >
                                {isSubmitting === o._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  "Add Payment"
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </>
              )}
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}

// --- Skeleton Component ---
function OrderSkeleton() {
  return (
    // FIX: border -> border-border
    <div className="p-3 border border-border rounded-xl shadow-sm bg-card">
      <div className="flex justify-between items-center mb-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-4 w-28 mb-3" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}
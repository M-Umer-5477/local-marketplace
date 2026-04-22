"use client";

import { useState, useEffect, useRef } from "react";
import { useSeller } from "@/app/(vendor)/SellerContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Search, ScanLine } from "lucide-react"; 
import OrderInvoice from "@/components/seller/OrderInvoice";

export default function OfflineCheckoutPage() {
  const [barcode, setBarcode] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [khataModal, setKhataModal] = useState(false);
  const [shopDetails, setShopDetails] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    initialPayment: "",
  });

  // --- Khata Search States ---
  const [khataSearch, setKhataSearch] = useState("");
  const [khataSuggestions, setKhataSuggestions] = useState([]);
  const [isSearchingKhata, setIsSearchingKhata] = useState(false);

  const barcodeInputRef = useRef(null);

  const { user } = useSeller();
  const shopId = user?.id;

  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  const fetchShopDetails = async () => {
    try {
      const res = await fetch("/api/vendor/shop-details");
      const data = await res.json();
      if (data.success) {
        setShopDetails(data.shop);
      }
    } catch {
      // Keep POS flow unaffected if shop meta fetch fails.
    }
  };

  useEffect(() => {
    fetchShopDetails();
  }, []);

  // Fetch product search suggestions
  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.length < 1) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      if (!shopId) return;
      try {
        const res = await fetch(
          `/api/vendor/products/suggestions?name=${searchTerm}&shopId=${shopId}`
        );
        const data = await res.json().catch(() => ({}));
        if (res.ok && Array.isArray(data.products)) setSuggestions(data.products);
        else setSuggestions([]);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, shopId]);

  // Fetch Khata Customer suggestions
  useEffect(() => {
    if (!khataSearch.trim() || khataSearch.length < 1) {
      setKhataSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      if (!shopId) return;
      setIsSearchingKhata(true);
      try {
        const res = await fetch(
          `/api/vendor/khata/search?q=${khataSearch}&shopId=${shopId}`
        );
        const data = await res.json().catch(() => ({}));
        if (res.ok && Array.isArray(data.customers)) {
          setKhataSuggestions(data.customers);
        } else {
          setKhataSuggestions([]);
        }
      } catch {
        setKhataSuggestions([]);
      } finally {
        setIsSearchingKhata(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [khataSearch, shopId]);

  // --- Cart Handlers ---
  const updateTotal = (items) => {
    setTotal(items.reduce((acc, i) => acc + i.subtotal, 0));
  };

  const handleSearch = async (selectedProduct) => {
    if (!barcode.trim() && !searchTerm.trim() && !selectedProduct) {
      toast.error("Enter barcode or product name first");
      return;
    }
    if (isAdding) return;
    setIsAdding(true);
    try {
      let product = selectedProduct;
      if (!product) {
        const query = (barcode || searchTerm).trim();
        const apiUrl = `/api/vendor/products/search?q=${query}&shopId=${shopId}`;
        const res = await fetch(apiUrl);
        const data = await res.json();
        if (!res.ok || !Array.isArray(data.products) || data.products.length === 0) {
          toast.error("Product not found");
          setIsAdding(false);
          return;
        }
        product = data.products[0];
      }
      if (!product?._id || !product?.name || typeof product?.price !== 'number') {
        toast.error("Invalid product data received");
        setIsAdding(false);
        return;
      }
      setCart((prev) => {
        const existing = prev.find((i) => i._id === product._id);
        let updated;
        if (existing) {
          updated = prev.map((i) =>
            i._id === product._id
              ? {
                ...i,
                quantity: i.quantity + 1,
                subtotal: (i.quantity + 1) * i.price,
              }
              : i
          );
        } else {
          updated = [...prev, { ...product, quantity: 1, subtotal: product.price }];
        }
        updateTotal(updated);
        return updated;
      });
      setBarcode("");
      setSearchTerm("");
      setSuggestions([]);
    } catch (err) {
      console.error("Search error:", err);
      toast.error("Failed to add product");
    } finally {
      setIsAdding(false);
      barcodeInputRef.current?.focus();
    }
  };

  const handleQuantityChange = (id, qty) => {
    let newQty = Number(qty);
    if (isNaN(newQty) || newQty < 1) {
      newQty = 1;
    }
    const updated = cart.map((i) =>
      i._id === id ? { ...i, quantity: newQty, subtotal: newQty * i.price } : i
    );
    setCart(updated);
    updateTotal(updated);
  };

  const handleQuantityAdjust = (id, amount) => {
    const item = cart.find(i => i._id === id);
    if (!item) return;
    const newQty = item.quantity + amount;
    handleQuantityChange(id, newQty);
  };

  const handleRemove = (id) => {
    const updated = cart.filter((i) => i._id !== id);
    setCart(updated);
    updateTotal(updated);
  };

  // --- Checkout Handlers ---
  const handlePaidCheckout = async () => {
    if (!cart.length) return toast.error("Cart is empty");
    if (isSubmitting) return;
    setIsSubmitting(true);
    const payload = {
      shopId,
      items: cart.map((p) => ({
        productId: p._id,
        name: p.name,
        quantity: p.quantity,
        price: p.price,
        subtotal: p.subtotal,
        barcode: p.barcode,
      })),
      total,
      paymentMethod: "cash",
      initialPayment: total,
    };
    try {
      const res = await fetch("/api/vendor/orders/offline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const createdOrder = await res.json();
        toast.success("Order completed!");
        setCart([]);
        setTotal(0);
        setInvoiceOrder(createdOrder);
      } else {
        const err = await res.json().catch(() => ({ error: "Failed to create order" }));
        toast.error(err.error);
      }
    } catch {
      toast.error("Error processing order");
    } finally {
      setIsSubmitting(false);
      barcodeInputRef.current?.focus();
    }
  };

  const openKhataModal = () => {
    setKhataSearch("");
    setKhataSuggestions([]);
    setKhataModal(true);
  };

  const handleKhataSelect = (cust) => {
    setCustomer({
      ...customer,
      name: cust.customerName,
      phone: cust._id,
    });
    setKhataSearch("");
    setKhataSuggestions([]);
  };

  const handleSaveKhata = async () => {
    if (!cart.length) return toast.error("Cart is empty");
    if (!customer.name.trim()) return toast.error("Customer name required");
    if (!customer.phone.trim()) return toast.error("Phone number required");
    if (isSubmitting) return;
    setIsSubmitting(true);
    const payload = {
      shopId,
      items: cart.map((p) => ({
        productId: p._id,
        name: p.name,
        quantity: p.quantity,
        price: p.price,
        subtotal: p.subtotal,
        barcode: p.barcode,
      })),
      total,
      paymentMethod: "khata",
      initialPayment: Number(customer.initialPayment || 0),
      customerName: customer.name.trim(),
      customerPhone: customer.phone.trim(),
    };
    try {
      const res = await fetch("/api/vendor/orders/offline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const createdOrder = await res.json();
        toast.success("Saved to Khata!");
        setKhataModal(false);
        setCart([]);
        setTotal(0);
        setCustomer({ name: "", phone: "", initialPayment: "" });
        setInvoiceOrder(createdOrder);
      } else {
        const err = await res.json().catch(() => ({ error: "Failed to save to Khata" }));
        toast.error(err.error);
      }
    } catch {
      toast.error("Error saving to Khata");
    } finally {
      setIsSubmitting(false);
      barcodeInputRef.current?.focus();
    }
  };

  // --- Render ---
  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-4 relative space-y-4">

      {/* --- Page Title --- */}
      <div className="flex items-center gap-2 text-foreground">
        <ScanLine className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Offline Checkout</h1>
      </div>
      {/* ----------------------- */}

      {/* Card inherits bg-card and text-card-foreground */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          {/* 🔍 Search */}
          <div className="flex flex-col gap-2 relative">
            <div className="flex flex-col md:flex-row gap-2">
              <Input
                placeholder="Scan Barcode"
                ref={barcodeInputRef}
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="md:w-56"
              />
              <div className="relative w-full min-w-0">
                <Input
                  placeholder="Search by Name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {suggestions.length > 0 && (
                  // FIX: bg-white -> bg-popover (Modal/Overlay Background)
                  // FIX: border -> border-border
                  <ul className="absolute z-10 bg-popover border border-border rounded-md mt-1 w-full max-h-40 overflow-y-auto shadow-md">
                    {suggestions.map((prod) => (
                      <li
                        key={prod._id}
                        // FIX: hover:bg-gray-100 -> hover:bg-accent/50 (Themed hover)
                        className="p-2 hover:bg-accent/50 cursor-pointer text-sm"
                        onClick={() => handleSearch(prod)}
                      >
                        {prod.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Button onClick={() => handleSearch()} disabled={isAdding} className="w-full md:w-auto">
                {isAdding ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> "Adding..."</> : "Add"}
              </Button>
            </div>
          </div>

          {/* 🛒 Cart Table */}
          <div className="overflow-x-auto border border-border rounded-md">
            <table className="w-full text-sm border-collapse">
              {/* FIX: thead bg-muted */}
              <thead className="bg-muted text-muted-foreground border-b border-border">
                <tr>
                  <th className="text-left p-2">Product</th>
                  <th className="text-center p-2">Qty</th>
                  <th className="text-center p-2">Price</th>
                  <th className="text-center p-2">Subtotal</th>
                  <th className="text-center p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.length === 0 && (
                  <tr className="border-b border-border">
                    <td colSpan={5} className="text-center p-4 text-muted-foreground">
                      Cart is empty
                    </td>
                  </tr>
                )}
                {cart.map((item) => (
                  // FIX: border-b -> border-b border-border
                  <tr key={item._id} className="border-b border-border hover:bg-accent/20 transition-colors">
                    <td className="p-2 font-medium">{item.name}</td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleQuantityAdjust(item._id, -1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(item._id, e.target.value)
                          }
                          onKeyDown={(e) =>
                            ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()
                          }
                          className="w-16 h-8 text-center"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleQuantityAdjust(item._id, 1)}
                        >
                          +
                        </Button>
                      </div>
                    </td>
                    <td className="p-2 text-center text-muted-foreground">Rs. {item.price}</td>
                    <td className="p-2 text-center font-semibold">Rs. {item.subtotal}</td>
                    <td className="p-2 text-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemove(item._id)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 💰 Totals */}
          {/* FIX: border-t -> border-t border-border */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-t border-border pt-4">
            <h3 className="text-lg font-semibold">Total: Rs. {total.toLocaleString()}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full sm:w-auto">
              <Button
                onClick={handlePaidCheckout}
                disabled={!cart.length || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> "Processing..."</> : "Checkout (Paid)"}
              </Button>
              <Button
                variant="secondary"
                onClick={openKhataModal}
                disabled={!cart.length || isSubmitting}
                className="w-full"
              >
                Save to Khata
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 📒 Khata Modal */}
      {/* Dialog Content inherits bg-background/bg-card and text-foreground/card-foreground */}
      <Dialog open={khataModal} onOpenChange={setKhataModal}>
        <DialogContent className="w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save to Khata</DialogTitle>
          </DialogHeader>
          {/* Main content wrapper */}
          <div className="space-y-4">
            {/* Khata Search Section */}
            <div className="mt-4 relative">
              <Label>Search Existing Customer</Label>
              <div className="relative mt-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or phone..."
                  className="pl-8"
                  value={khataSearch}
                  onChange={(e) => setKhataSearch(e.target.value)}
                />
                {isSearchingKhata && (
                  <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-primary" />
                )}
              </div>
              {khataSuggestions.length > 0 && (
                // FIX: bg-white -> bg-popover (Overlay/Modal Background)
                // FIX: border -> border-border
                <ul className="absolute z-50 bg-popover border border-border rounded-md mt-1 w-full max-h-32 overflow-y-auto shadow-md">
                  {khataSuggestions.map((cust) => (
                    <li
                      key={cust._id}
                      // FIX: hover:bg-gray-100 -> hover:bg-accent/50 (Themed hover)
                      className="p-2 hover:bg-accent/50 cursor-pointer text-sm"
                      onClick={() => handleKhataSelect(cust)}
                    >
                      {cust.customerName} ({cust._id})
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Divider */}
            {/* FIX: border-b -> border-b border-border, bg-background text-muted-foreground */}
            <div className="relative border-b border-border my-6">
              <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-xs text-muted-foreground">
                OR ADD NEW
              </span>
            </div>

            {/* Add New Section */}
            <div className="space-y-4 mt-1.5">
              <div>
                <Label>Name</Label>
                <Input
                  placeholder="Customer Name"
                  value={customer.name}
                  onChange={(e) =>
                    setCustomer({ ...customer, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  placeholder="Customer Phone"
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer({ ...customer, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Initial Payment (Optional)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={customer.initialPayment}
                  onKeyDown={(e) =>
                    ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()
                  }
                  onChange={(e) => {
                    const numericValue = Number(e.target.value);
                    if (
                      e.target.value !== "" &&
                      !isNaN(numericValue) &&
                      numericValue > total
                    ) {
                      setCustomer({
                        ...customer,
                        initialPayment: total.toString(),
                      });
                    } else {
                      setCustomer({
                        ...customer,
                        initialPayment: e.target.value,
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSaveKhata}
              disabled={isSubmitting}
            >
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> "Saving..."</> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {invoiceOrder && shopDetails && (
        <OrderInvoice
          order={invoiceOrder}
          shopDetails={shopDetails}
          onPrintComplete={() => setInvoiceOrder(null)}
        />
      )}
    </div>
  );
}

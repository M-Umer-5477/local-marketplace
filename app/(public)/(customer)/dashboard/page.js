"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCart } from "@/context/cartContext";
import { useAddress } from "@/context/addressContext";
import { toast } from "sonner";

import {
  Loader2, ShoppingBag, MapPin, User, Clock, TrendingUp,
  ChevronRight, Home, Briefcase, Plus, ArrowRight, Package,
  CheckCircle2, AlertCircle, Home as HomeIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import AddressSelector from "@/components/AddressSelector";

export default function CustomerDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { cartCount } = useCart();
  const { selectedAddress, addresses } = useAddress();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch orders
  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/customer/order");
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error("Failed to load orders:", error);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [status]);

  if (!mounted || status === "loading") {
    return <DashboardSkeleton />;
  }

  if (status !== "authenticated" || !session?.user) {
    return null;
  }

  // Calculate stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o =>
    ["Pending", "Confirmed", "Preparing", "Out_for_Delivery", "Ready_for_Pickup"].includes(o.orderStatus)
  ).length;
  const completedOrders = orders.filter(o =>
    ["Delivered", "Picked_Up"].includes(o.orderStatus)
  ).length;
  const cancelledOrders = orders.filter(o => o.orderStatus === "Cancelled").length;

  const recentOrders = orders.slice(0, 3);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-yellow-500 hover:bg-yellow-600";
      case "Confirmed": return "bg-blue-500 hover:bg-blue-600";
      case "Preparing": return "bg-orange-500 hover:bg-orange-600";
      case "Ready_for_Pickup": return "bg-orange-600 hover:bg-orange-700";
      case "Out_for_Delivery": return "bg-purple-500 hover:bg-purple-600";
      case "Delivered": return "bg-green-600 hover:bg-green-700";
      case "Picked_Up": return "bg-green-600 hover:bg-green-700";
      case "Cancelled": return "bg-red-500 hover:bg-red-600";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* ===== HEADER SECTION ===== */}
      <div className="bg-linear-to-br from-primary/10 via-primary/5 to-transparent border-b border-primary/10 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Welcome back, {session.user.name?.split(" ")[0]}! 👋
              </h1>
              <p className="text-muted-foreground mt-2">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            <Link href="/shops">
              <Button size="lg" className="gap-2 shadow-lg">
                <ShoppingBag className="h-5 w-5" />
                Browse Shops
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="container mx-auto px-4 py-8 space-y-8">

        {/* ===== SECTION 1: STATS ROW ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Orders */}
          <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Orders</p>
                  <p className="text-3xl font-bold mt-1">{totalOrders}</p>
                </div>
                <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Orders */}
          <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Pending</p>
                  <p className="text-3xl font-bold mt-1">{pendingOrders}</p>
                </div>
                <div className="h-12 w-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completed Orders */}
          <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Completed</p>
                  <p className="text-3xl font-bold mt-1">{completedOrders}</p>
                </div>
                <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cart Items */}
          <Card className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">In Cart</p>
                  <p className="text-3xl font-bold mt-1">{cartCount}</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ===== SECTION 2: QUICK ACCESS GRID ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* RECENT ORDERS CARD */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Recent Orders
                </CardTitle>
                {orders.length > 0 && (
                  <Link href="/orders">
                    <Button variant="ghost" size="sm" className="gap-1 text-primary hover:bg-primary/5">
                      View All <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loadingOrders ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map(order => (
                    <Link key={order._id} href={`/orders/${order._id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">
                            {order.shopId?.shopName || "Unknown Shop"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={`${getStatusColor(order.orderStatus)} text-xs`}>
                            {order.orderStatus.replace(/_/g, " ")}
                          </Badge>
                          <p className="text-sm font-bold text-foreground">Rs. {order.total}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No orders yet</p>
                  <Link href="/shops">
                    <Button variant="link" className="text-xs mt-2">Start shopping</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SAVED ADDRESSES CARD */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Delivery Addresses
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {addresses.length > 0 ? (
                <div className="space-y-3">
                  {/* Active Address Highlight */}
                  {selectedAddress && (
                    <div className="p-3 rounded-lg border-2 border-primary/30 bg-primary/5">
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 bg-primary/20 rounded-full mt-0.5">
                          {selectedAddress.label === "Home" && <HomeIcon className="h-4 w-4 text-primary" />}
                          {selectedAddress.label === "Work" && <Briefcase className="h-4 w-4 text-primary" />}
                          {selectedAddress.label === "Other" && <MapPin className="h-4 w-4 text-primary" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground">{selectedAddress.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {selectedAddress.address}, {selectedAddress.city}
                          </p>
                          <Badge className="mt-2 bg-primary/20 text-primary hover:bg-primary/30 text-xs border-0">
                            Active
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Other Addresses */}
                  {addresses.filter(a => a._id !== selectedAddress?._id).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Other Addresses</p>
                      <div className="space-y-2">
                        {addresses.filter(a => a._id !== selectedAddress?._id).map(addr => (
                          <div key={addr._id} className="p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                            <p className="font-medium text-xs text-foreground">{addr.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {addr.address}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Address Button */}
                  <div className="pt-2 border-t border-border">
                    <AddressSelector>
                      <Button variant="outline" className="w-full gap-2 h-10 text-sm">
                        <Plus className="h-4 w-4" />
                        Add New Address
                      </Button>
                    </AddressSelector>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MapPin className="h-10 w-10 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No addresses saved yet</p>
                  <AddressSelector>
                    <Button variant="link" className="text-xs mt-2">Add your first address</Button>
                  </AddressSelector>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ===== SECTION 3: ACCOUNT & CART ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* PROFILE INFO CARD */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Name</p>
                    <p className="text-sm font-medium text-foreground mt-1">{session.user.name}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Email</p>
                    <p className="text-sm font-medium text-foreground mt-1 break-all">{session.user.email}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <Button variant="outline" className="w-full" disabled>
                    Edit Profile (Coming Soon)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CART & CHECKOUT CARD */}
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Your Cart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Items in Cart</p>
                  <p className="text-4xl font-bold text-primary">{cartCount}</p>
                </div>

                <div className="text-sm text-muted-foreground space-y-2">
                  <p>✓ Free shipping on orders above Rs. 500</p>
                  <p>✓ Real-time order tracking</p>
                  <p>✓ Easy returns & refunds</p>
                </div>

                <div className="flex gap-2 pt-2">
                  {cartCount > 0 ? (
                    <>
                      <Link href="/cart" className="flex-1">
                        <Button variant="outline" className="w-full">
                          View Cart
                        </Button>
                      </Link>
                      <Link href="/checkout" className="flex-1">
                        <Button className="w-full gap-2">
                          Checkout <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <Link href="/shops" className="w-full">
                      <Button className="w-full gap-2">
                        Start Shopping <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ===== SECTION 4: ORDER HISTORY & STATS ===== */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Order Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingOrders ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
              </div>
            ) : (
              <>
                {/* Status Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">All Orders</p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">{totalOrders}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Pending</p>
                    <p className="text-2xl font-bold text-orange-600 mt-2">{pendingOrders}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Delivered</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">{completedOrders}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Cancelled</p>
                    <p className="text-2xl font-bold text-red-600 mt-2">{cancelledOrders}</p>
                  </div>
                </div>

                {/* Full Order History */}
                {orders.length > 0 ? (
                  <div>
                    <Tabs defaultValue="all" className="w-full">
                      <TabsList>
                        <TabsTrigger value="all">All Orders ({orders.length})</TabsTrigger>
                        <TabsTrigger value="active">Active ({pendingOrders})</TabsTrigger>
                        <TabsTrigger value="completed">Completed ({completedOrders})</TabsTrigger>
                      </TabsList>

                      <TabsContent value="all" className="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
                        {orders.map(order => (
                          <OrderRow key={order._id} order={order} getStatusColor={getStatusColor} />
                        ))}
                      </TabsContent>

                      <TabsContent value="active" className="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
                        {orders.filter(o => ["Pending", "Confirmed", "Preparing", "Out_for_Delivery", "Ready_for_Pickup"].includes(o.orderStatus)).map(order => (
                          <OrderRow key={order._id} order={order} getStatusColor={getStatusColor} />
                        ))}
                      </TabsContent>

                      <TabsContent value="completed" className="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
                        {orders.filter(o => ["Delivered", "Picked_Up"].includes(o.orderStatus)).map(order => (
                          <OrderRow key={order._id} order={order} getStatusColor={getStatusColor} />
                        ))}
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Package className="h-12 w-12 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">You haven't placed any orders yet</p>
                    <Link href="/shops">
                      <Button variant="link" className="mt-3">Start shopping now</Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

// ===== HELPER COMPONENTS =====
function OrderRow({ order, getStatusColor }) {
  return (
    <Link href={`/orders/${order._id}`}>
      <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm text-foreground truncate">
              {order.shopId?.shopName || "Unknown Shop"}
            </p>
            <Badge className={`${getStatusColor(order.orderStatus)} text-xs shrink-0`}>
              {order.orderStatus.replace(/_/g, " ")}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="text-right ml-2">
          <p className="text-sm font-bold text-foreground">Rs. {order.total}</p>
          <p className="text-xs text-muted-foreground">#{order._id.slice(-6).toUpperCase()}</p>
        </div>
      </div>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-linear-to-br from-primary/10 via-primary/5 to-transparent border-b border-primary/10">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-3" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => <Skeleton key={i} className="h-96 w-full rounded-lg" />)}
        </div>
      </div>
    </div>
  );
}

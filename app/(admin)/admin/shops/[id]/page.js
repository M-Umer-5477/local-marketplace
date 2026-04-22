"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  ExternalLink,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  Store,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminShopReviewPage() {
  const params = useParams();
  const shopId = params?.id;

  const [loading, setLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [productToModerate, setProductToModerate] = useState(null);
  const [moderationAction, setModerationAction] = useState("delist");

  const fetchShopData = useCallback(async () => {
    if (!shopId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/shops/${shopId}`);
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to load shop data");
      }

      setShop(result.shop || null);
      setProducts(result.products || []);
    } catch (error) {
      toast.error(error.message || "Unable to load shop review page");
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    fetchShopData();
  }, [fetchShopData]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) => {
      return (
        product.name?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query) ||
        product.barcode?.toLowerCase().includes(query)
      );
    });
  }, [products, search]);

  const listedProducts = filteredProducts.filter((product) => !product.isDelistedByAdmin);
  const delistedProducts = filteredProducts.filter((product) => product.isDelistedByAdmin);

  const openModerationDialog = (product, action) => {
    setProductToModerate(product);
    setModerationAction(action);
    setDialogOpen(true);
  };

  const handleModerationAction = async () => {
    if (!productToModerate || !shopId) return;

    setIsMutating(true);
    try {
      let res = await fetch(`/api/admin/shops/${shopId}/products/${productToModerate._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: moderationAction }),
      });

      // Fallback for environments where PATCH can be blocked or proxied oddly.
      if (res.status === 404 || res.status === 405) {
        res = await fetch(`/api/admin/shops/${shopId}/products/${productToModerate._id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: moderationAction }),
        });
      }

      const result = await res.json();
      if (!res.ok) {
        if (res.status === 404) {
          await fetchShopData();
        }
        throw new Error(result.error || "Action failed");
      }

      setProducts((prev) =>
        prev.map((product) =>
          product._id === productToModerate._id
            ? {
                ...product,
                isDelistedByAdmin: moderationAction === "delist",
                adminDelistedAt: moderationAction === "delist" ? new Date().toISOString() : null,
              }
            : product
        )
      );

      toast.success(
        moderationAction === "delist"
          ? `Product "${productToModerate.name}" delisted.`
          : `Product "${productToModerate.name}" relisted.`
      );
    } catch (error) {
      toast.error(error.message || "Unable to update product status");
    } finally {
      setIsMutating(false);
      setDialogOpen(false);
      setProductToModerate(null);
    }
  };

  if (loading) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="space-y-4">
        <Link href="/admin/shops">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Shops
          </Button>
        </Link>
        <Card>
          <CardContent className="py-14 text-center text-muted-foreground">
            This shop could not be found.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <Link href="/admin/shops">
            <Button variant="ghost" className="px-0 h-8 gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to Shop Management
            </Button>
          </Link>

          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 border bg-muted">
              <AvatarImage src={shop.shopLogo} />
              <AvatarFallback className="font-semibold">{shop.shopName?.charAt(0) || "S"}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">{shop.shopName}</h2>
              <p className="text-sm text-muted-foreground">Product compliance review and moderation controls.</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant={shop.isActive ? "outline" : "destructive"}>
                  {shop.isActive ? "Seller Active" : "Seller Suspended"}
                </Badge>
                <Badge variant={shop.isShopOpen ? "secondary" : "outline"}>
                  {shop.isShopOpen ? "Shop Open" : "Shop Closed"}
                </Badge>
                {shop.shopType ? <Badge variant="outline">{shop.shopType}</Badge> : null}
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
          <Link href={`/shops/${shopId}`} target="_blank" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full gap-2">
              <ExternalLink className="h-4 w-4" /> Open Customer View
            </Button>
          </Link>
          <Button variant="outline" size="icon" onClick={fetchShopData} className="self-start sm:self-auto">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
            <ShieldAlert className="h-5 w-5" /> Moderation Guidelines
          </CardTitle>
          <CardDescription>
            Delist items that violate platform policies. Delisted items are immediately hidden from customers.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" /> Product Inventory
          </CardTitle>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              placeholder="Search by name, category, barcode"
            />
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <Tabs defaultValue="listed" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="listed">Listed ({listedProducts.length})</TabsTrigger>
              <TabsTrigger value="delisted">Delisted ({delistedProducts.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="listed">
              <ProductTable products={listedProducts} actionLabel="Delist" onAction={openModerationDialog} />
            </TabsContent>

            <TabsContent value="delisted">
              <ProductTable products={delistedProducts} actionLabel="Relist" onAction={openModerationDialog} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle
              className={
                moderationAction === "delist"
                  ? "text-destructive flex items-center gap-2"
                  : "text-green-600 flex items-center gap-2"
              }
            >
              {moderationAction === "delist" ? <Ban className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
              {moderationAction === "delist" ? "Delist product" : "Relist product"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {moderationAction === "delist"
                ? `This will hide "${productToModerate?.name}" from customer storefronts immediately.`
                : `This will make "${productToModerate?.name}" visible to customers again.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMutating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleModerationAction}
              disabled={isMutating}
              className={
                moderationAction === "delist"
                  ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }
            >
              {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {moderationAction === "delist" ? "Confirm Delist" : "Confirm Relist"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ProductTable({ products, actionLabel, onAction }) {
  if (!products.length) {
    return (
      <div className="mt-4 rounded-xl border-2 border-dashed p-12 text-center text-muted-foreground">
        No products found in this list.
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-lg border bg-card shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[300px]">Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product._id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <img
                    src={product.imageUrl || "https://placehold.co/56x56/e2e8f0/e2e8f0"}
                    alt={product.name}
                    className="h-12 w-12 rounded-md border object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{product.name}</p>
                    <p className="truncate text-xs text-muted-foreground">Barcode: {product.barcode}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell className="font-medium">Rs. {product.price?.toLocaleString?.() || 0}</TableCell>
              <TableCell>
                {product.stock > 0 ? `${product.stock} ${product.unit}` : <span className="text-red-600">Out of stock</span>}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {product.isDelistedByAdmin ? (
                    <Badge variant="destructive">Delisted by Admin</Badge>
                  ) : (
                    <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400">
                      Compliant
                    </Badge>
                  )}

                  {!product.isActive ? <Badge variant="secondary">Hidden by Seller</Badge> : null}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant={actionLabel === "Delist" ? "destructive" : "outline"}
                  size="sm"
                  className={actionLabel === "Relist" ? "text-green-700 border-green-200 hover:bg-green-50" : ""}
                  onClick={() => onAction(product, actionLabel === "Delist" ? "delist" : "relist")}
                >
                  {actionLabel === "Delist" ? <Ban className="h-4 w-4 mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                  {actionLabel}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
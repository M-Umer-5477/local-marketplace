"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Loader2, 
  MoreVertical, 
  Store, 
  Ban, 
  ExternalLink, 
  ShieldAlert,
  Search,
  CheckCircle,
  RefreshCw,
  RefreshCcw 
} from "lucide-react";
import { toast } from "sonner";

// ShadCN UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ActiveShopsPage() {
  const [data, setData] = useState({ activeShops: [], suspendedShops: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // State for Confirm Dialogs
  const [shopToActOn, setShopToActOn] = useState(null);
  const [dialogAction, setDialogAction] = useState(""); // "Suspended" or "Restored"
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 1. Fetch Data
  const fetchShops = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/active-shops");
      const result = await res.json();
      if (result.success) {
          setData({ 
              activeShops: result.activeShops || [], 
              suspendedShops: result.suspendedShops || [] 
          });
      }
    } catch (error) {
      toast.error("Failed to load shops");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  // 2. Open the Action Dialog
  const initiateAction = (shop, actionType) => {
    setShopToActOn(shop);
    setDialogAction(actionType);
    setIsDialogOpen(true);
  };

  // 3. Execute the Action (API Call)
  const executeAction = async () => {
    if (!shopToActOn) return;
    
    try {
      // Re-using the verify-seller API to set isActive state
      const res = await fetch("/api/admin/verify-seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            sellerId: shopToActOn._id, 
            action: dialogAction // "Suspended" or "Restored"
        }), 
      });

      if (res.ok) {
        toast.success(dialogAction === "Suspended" ? `🚫 ${shopToActOn.shopName} suspended.` : `✅ ${shopToActOn.shopName} restored.`);
        fetchShops(); // Refresh data natively
      } else {
        toast.error(`Failed to execute ${dialogAction}.`);
      }
    } catch (error) {
      toast.error("Network Error");
    } finally {
      setIsDialogOpen(false);
      setShopToActOn(null);
    }
  };

  // Shared Table component to prevent redundancy
  const ShopTable = ({ shopsArray }) => {
      const filteredShops = shopsArray.filter(s => s.shopName.toLowerCase().includes(search.toLowerCase()));

      if (filteredShops.length === 0) {
          return (
            <div className="p-12 text-center flex flex-col items-center text-muted-foreground bg-muted/20 border-2 border-dashed rounded-xl mt-4">
                <Store className="h-10 w-10 mb-2 opacity-20" />
                <p>No shops found.</p>
            </div>
          );
      }

      return (
        <div className="border rounded-lg bg-card shadow-sm mt-4 overflow-hidden">
            <Table>
            <TableHeader className="bg-muted/50">
                <TableRow>
                <TableHead className="w-[300px]">Shop Info</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredShops.map((shop) => (
                <TableRow key={shop._id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar className={`h-10 w-10 border bg-muted ${!shop.isActive && "opacity-50 grayscale"}`}>
                        <AvatarImage src={shop.shopLogo} />
                        <AvatarFallback className="font-bold text-foreground">{shop.shopName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-bold text-foreground">{shop.shopName}</span>
                            <span className="text-xs text-muted-foreground">ID: {shop._id.substring(0, 8)}...</span>
                        </div>
                    </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col">
                            <span className="font-medium text-foreground">{shop.fullName}</span>
                            <span className="text-xs text-muted-foreground">{shop.phone}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                    <div className="flex flex-col gap-1">
                        {!shop.isActive ? (
                            <Badge variant="destructive" className="w-fit text-[10px]">Suspended</Badge>
                        ) : shop.isShopOpen ? (
                            <Badge variant="outline" className="w-fit text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">Open for Biz</Badge>
                        ) : (
                            <Badge variant="secondary" className="w-fit">Closed by Owner</Badge>
                        )}
                        {/* Safety Flag */}
                        {shop.walletBalance < -5000 && (
                            <Badge variant="destructive" className="w-fit text-[10px] px-1 py-0 h-5">High Debt</Badge>
                        )}
                    </div>
                    </TableCell>
                    <TableCell className="font-mono font-medium">
                        <span className={shop.walletBalance < 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}>
                            Rs. {shop.walletBalance.toLocaleString()}
                        </span>
                    </TableCell>
                    <TableCell className="text-right">
                    
                    {/* PROFESSIONAL DROPDOWN MENU */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Manage Shop</DropdownMenuLabel>
                        
                        {/* 1. View Shop */}
                        <Link href={`/shops/${shop._id}`} target="_blank">
                            <DropdownMenuItem className="cursor-pointer">
                                <ExternalLink className="mr-2 h-4 w-4" /> Visit Storefront
                            </DropdownMenuItem>
                        </Link>
                        
                        <DropdownMenuSeparator />
                        
                        {/* 3. The Nuclear Actions */}
                        {shop.isActive ? (
                            <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 cursor-pointer focus:bg-red-50 dark:focus:bg-red-950/20"
                                onClick={() => initiateAction(shop, "Suspended")}
                            >
                                <ShieldAlert className="mr-2 h-4 w-4" /> Suspend Account
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem 
                                className="text-green-600 focus:text-green-600 dark:text-green-400 dark:focus:text-green-400 cursor-pointer focus:bg-green-50 dark:focus:bg-green-950/20"
                                onClick={() => initiateAction(shop, "Restored")}
                            >
                                <RefreshCcw className="mr-2 h-4 w-4" /> Restore Account
                            </DropdownMenuItem>
                        )}

                        </DropdownMenuContent>
                    </DropdownMenu>

                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold tracking-tight text-foreground">Shop Management</h2>
           <p className="text-muted-foreground">Oversee active vendors and ensure platform compliance.</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search shops..." 
                className="pl-9 bg-background" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            </div>
            <Button variant="outline" size="icon" onClick={fetchShops}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
        </div>
      </div>

      <Card>
          <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" /> Vendor Hub
              </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="active">Active Shops ({data.activeShops.length})</TabsTrigger>
                    <TabsTrigger value="suspended">Suspended Brands ({data.suspendedShops.length})</TabsTrigger>
                </TabsList>
                
                {loading ? (
                    <div className="flex h-[40vh] items-center justify-center"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>
                ) : (
                    <>
                        <TabsContent value="active">
                            <ShopTable shopsArray={data.activeShops} />
                        </TabsContent>
                        <TabsContent value="suspended">
                            <ShopTable shopsArray={data.suspendedShops} />
                        </TabsContent>
                    </>
                )}
            </Tabs>
          </CardContent>
      </Card>

      {/* --- THE SHADCN ALERT DIALOG --- */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={dialogAction === "Suspended" ? "text-destructive flex flex-col gap-1" : "text-green-600 flex flex-col gap-1"}>
                {dialogAction === "Suspended" ? (
                    <>
                    <div className="flex items-center gap-2"><Ban className="h-5 w-5" /> Suspend "{shopToActOn?.shopName}"?</div>
                    </>
                ) : (
                    <>
                    <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5" /> Restore "{shopToActOn?.shopName}"?</div>
                    </>
                )}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-muted-foreground mt-4">
              {dialogAction === "Suspended" ? (
                <>
                    <p>Are you sure you want to suspend this vendor? This action will:</p>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                        <li>Immediately take their shop offline.</li>
                        <li>Send a permanent suspension warning email to the owner.</li>
                    </ul>
                    <p className="mt-2 text-foreground font-semibold">Use this for illegal products, fraud, or intentional debt evasion.</p>
                </>
              ) : (
                <>
                    <p>Good news! Are you ready to restore this vendor's privileges?</p>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                        <li>Their shop will become visible to customers immediately.</li>
                        <li>An email will be dispatched alerting them of their restored status.</li>
                    </ul>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
                onClick={executeAction}
                className={dialogAction === "Suspended" ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : "bg-green-600 hover:bg-green-700 text-white"}
            >
                {dialogAction === "Suspended" ? "Yes, Suspend Shop" : "Yes, Restore Privileges"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
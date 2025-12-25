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
  Search
} from "lucide-react";
import { toast } from "sonner";

// ShadCN UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // State for the Ban Confirmation Dialog
  const [shopToBlock, setShopToBlock] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 1. Fetch Data
  const fetchShops = async () => {
    try {
      const res = await fetch("/api/admin/active-shops");
      const data = await res.json();
      if (data.success) setShops(data.sellers);
    } catch (error) {
      toast.error("Failed to load shops");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  // 2. Open the "Red" Dialog
  const initiateBlock = (shop) => {
    setShopToBlock(shop);
    setIsDialogOpen(true);
  };

  // 3. Execute the Block (API Call)
  const executeBlock = async () => {
    if (!shopToBlock) return;
    
    try {
      // Re-using the verify-seller API to set isActive: false
      const res = await fetch("/api/admin/verify-seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            sellerId: shopToBlock._id, 
            action: "Rejected" // This maps to isActive=false in your API
        }), 
      });

      if (res.ok) {
        toast.success(`🚫 ${shopToBlock.shopName} has been suspended.`);
        // Remove from list immediately
        setShops(prev => prev.filter(s => s._id !== shopToBlock._id));
      } else {
        toast.error("Failed to suspend shop.");
      }
    } catch (error) {
      toast.error("Network Error");
    } finally {
      setIsDialogOpen(false);
      setShopToBlock(null);
    }
  };

  const filteredShops = shops.filter(s => s.shopName.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold tracking-tight text-foreground">Shop Management</h2>
           <p className="text-muted-foreground">Oversee active vendors and ensure platform compliance.</p>
        </div>
        <div className="relative w-full md:w-72">
           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
           <Input 
             placeholder="Search active shops..." 
             className="pl-9 bg-background" 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
        </div>
      </div>

      <div className="border rounded-lg bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-muted/50">
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
                    <Avatar className="h-10 w-10 border bg-muted">
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
                      {shop.isShopOpen ? (
                        <Badge variant="outline" className="w-fit text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">Open for Biz</Badge>
                      ) : (
                        <Badge variant="secondary" className="w-fit">Closed</Badge>
                      )}
                      {/* Safety Flag */}
                      {shop.walletBalance < -5000 && (
                          <Badge variant="destructive" className="w-fit text-[10px] px-1 py-0 h-5">High Debt</Badge>
                      )}
                   </div>
                </TableCell>
                <TableCell className="font-mono font-medium">
                    <span className={shop.walletBalance < 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}>
                        Rs. 0
                        {/* {shop.walletBalance.toLocaleString()} */}
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
                      
                      {/* 1. View Shop (To check for illegal items) */}
                      <Link href={`/shops/${shop._id}`} target="_blank">
                        <DropdownMenuItem className="cursor-pointer">
                            <ExternalLink className="mr-2 h-4 w-4" /> Visit Storefront
                        </DropdownMenuItem>
                      </Link>
                      
                      <DropdownMenuSeparator />
                      
                      {/* 2. Contact (Future Feature) */}
                      <DropdownMenuItem disabled>
                        <Store className="mr-2 h-4 w-4" /> Contact Owner
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      {/* 3. The "Nuclear" Option */}
                      <DropdownMenuItem 
                        className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 cursor-pointer focus:bg-red-50 dark:focus:bg-red-950/20"
                        onClick={() => initiateBlock(shop)}
                      >
                        <ShieldAlert className="mr-2 h-4 w-4" /> Suspend Account
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredShops.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center text-muted-foreground">
                <Store className="h-10 w-10 mb-2 opacity-20" />
                <p>No active shops found.</p>
            </div>
        )}
      </div>

      {/* --- THE SHADCN ALERT DIALOG --- */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <Ban className="h-5 w-5" /> Suspend "{shopToBlock?.shopName}"?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-muted-foreground">
              <p>
                Are you sure you want to suspend this vendor? This action will:
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Immediately take their shop offline.</li>
                  <li>Cancel any active orders (if logic exists).</li>
                  <li>Send a notification email to the owner.</li>
              </ul>
              <p className="mt-2 text-foreground font-semibold">
                Use this for illegal products, fraud, or non-payment.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
                onClick={executeBlock}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
                Yes, Suspend Shop
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
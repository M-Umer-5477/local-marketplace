"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Search, MapPin, Star, Clock, ShoppingBag, Plus, Minus, AlertTriangle, Navigation, Lock, Store } from "lucide-react"; 
import { toast } from "sonner"; 
import Link from "next/link";


import { useCart } from "@/context/cartContext";
import { useAddress } from "@/context/addressContext";
import { checkIsShopOpen } from "@/lib/shopUtils";
import { calculateDistance } from "@/lib/geo";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";


export default function SingleShopPage() {
  const params = useParams(); 
  const { cart: globalCart, addToCart, updateQuantity } = useCart();
  const { selectedAddress } = useAddress(); // ✅ PULL ADDRESS FROM CONTEXT
  
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  
  // --- STATE: Status & Location ---
  const [isOpen, setIsOpen] = useState(false); 
  const [distance, setDistance] = useState(null);
  const [isDeliverable, setIsDeliverable] = useState(true);

  // Filters
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // --- 1. Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/customer/shops/${params.id}`);
        const data = await res.json();
        
        if (data.success) {
          setShop(data.shop);
          setProducts(data.products);
          setCategories(["All", ...data.categories]);
          setIsOpen(checkIsShopOpen(data.shop));
          if (data.recentReviews) setRecentReviews(data.recentReviews);
        }
      } catch (error) {
        console.error("Error fetching shop:", error);
        toast.error("Failed to load shop.");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchData();
  }, [params.id]);

  // --- 2. GLOBAL RADAR LOGIC ---
  useEffect(() => {
    if (!shop || !shop.shopLocation) return;

    // If the user has an address set, calculate distance from that address
    if (selectedAddress && selectedAddress.location?.coordinates) {
        const userLat = selectedAddress.location.coordinates[1];
        const userLng = selectedAddress.location.coordinates[0];
        const shopLat = shop.shopLocation.coordinates[1];
        const shopLng = shop.shopLocation.coordinates[0];
        
        const dist = parseFloat(calculateDistance(userLat, userLng, shopLat, shopLng)?.toFixed(1));

        setDistance(dist);
        const radius = shop.deliveryRadius || 5; 
        setIsDeliverable(dist <= radius);
    } else {
        // If guest has no address set, reset distance states
        setDistance(null);
        setIsDeliverable(true);
    }
  }, [shop, selectedAddress]);

  // -- Filters --
  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getItemQuantity = (productId) => {
    if (globalCart.shopId && globalCart.shopId !== params.id) return 0;
    const item = globalCart.items.find((i) => i.productId === productId);
    return item ? item.quantity : 0;
  };

  const totalItems = globalCart.shopId === params.id 
    ? globalCart.items.reduce((a, b) => a + b.quantity, 0)
    : 0;

  if (loading) return <ShopSkeleton />;
  if (!shop) return <div className="text-center py-20 font-bold">Shop not found.</div>;

  return (
    <div className="min-h-screen bg-background pb-24">
      
      {/* --- SECTION 1: Hero Banner --- */}
      <div className="relative w-full">
        {/* Banner Image */}
        <div className="relative h-40 sm:h-52 md:h-64 w-full overflow-hidden">
          <img 
            src={shop.shopBanner || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80"} 
            alt="Cover" 
            className={`w-full h-full object-cover ${!isOpen ? "grayscale" : ""}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        {/* Shop Info Card - overlaps the banner */}
        <div className="relative container mx-auto px-4 -mt-16 sm:-mt-20 z-10">
          <div className="bg-card border border-border rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
              
              {/* LEFT: Logo + Shop Identity */}
              <div className="flex gap-4 sm:gap-5 flex-1 min-w-0">
                {/* Logo */}
                <div className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-xl sm:rounded-2xl border-2 border-border bg-white shadow-md overflow-hidden shrink-0">
                  <img 
                    src={shop.shopLogo || "https://placehold.co/150/f97316/white?text=Shop"} 
                    alt="Logo" 
                    className={`w-full h-full object-cover ${!isOpen ? "grayscale" : ""}`}
                  />
                </div>

                {/* Shop Details */}
                <div className="flex-1 min-w-0">
                  {/* Row 1: Name + Status Badge */}
                  <div className="flex items-start gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground tracking-tight leading-tight truncate">
                      {shop.shopName}
                    </h1>
                    <Badge className={`shrink-0 mt-0.5 sm:mt-1 ${isOpen ? "bg-green-600 hover:bg-green-600" : "bg-destructive"}`}>
                      {isOpen ? "Open" : "Closed"}
                    </Badge>
                  </div>

                  {/* Row 2: Meta info pills */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 sm:mt-3 text-sm text-muted-foreground">
                    {/* Rating */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                          <Star className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
                          <span className="font-semibold text-foreground">{shop.averageRating ? shop.averageRating.toFixed(1) : "New"}</span>
                          {shop.totalReviews > 0 && <span className="text-primary text-xs">({shop.totalReviews})</span>}
                        </button>
                      </DialogTrigger>
                      <DialogContent aria-describedby={undefined} className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Customer Reviews</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="max-h-[60vh] pr-4">
                          <div className="space-y-4 mt-4">
                            {recentReviews.length > 0 ? (
                              recentReviews.map((review, i) => (
                                <div key={i} className="p-4 bg-muted/30 border border-border rounded-xl">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary text-xs">
                                        {review.userId?.name?.charAt(0) || "U"}
                                      </div>
                                      <div>
                                        <p className="font-bold text-sm text-foreground">{review.userId?.name || "Customer"}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                                      </div>
                                    </div>
                                    <div className="flex gap-0.5">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className={`h-3 w-3 ${star <= review.rating ? "text-orange-500 fill-orange-500" : "text-muted"}`} />
                                      ))}
                                    </div>
                                  </div>
                                  {review.feedback && <p className="text-sm mt-1 text-foreground/80 font-medium">"{review.feedback}"</p>}
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-12 text-muted-foreground">
                                <Star className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                                <p className="font-medium">No reviews yet.</p>
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>

                    <span className="text-border hidden sm:inline">•</span>

                    {/* Time */}
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{isOpen ? `Closes ${shop.closingTime}` : `Opens ${shop.openingTime}`}</span>
                    </div>

                    <span className="text-border hidden sm:inline">•</span>

                    {/* Distance / Delivery */}
                    {distance !== null ? (
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${isDeliverable ? "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400" : "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400"}`}>
                        <Navigation className="h-3 w-3" />
                        <span>{distance} km</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs">
                        <MapPin className="h-3 w-3" />
                        <span>Set address for delivery info</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT: Quick Info Stats (visible on md+) */}
              <div className="hidden md:flex items-center gap-3 shrink-0">
                {/* Delivery Radius */}
                <div className="flex flex-col items-center justify-center bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 min-w-[90px]">
                  <Navigation className="h-4 w-4 text-primary mb-1" />
                  <span className="text-lg font-bold text-foreground">{shop.deliveryRadius || 5} km</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Delivery</span>
                </div>

                {/* Min Order */}
                {shop.minimumOrderAmount > 0 && (
                  <div className="flex flex-col items-center justify-center bg-orange-500/5 border border-orange-500/10 rounded-xl px-4 py-3 min-w-[90px]">
                    <ShoppingBag className="h-4 w-4 text-orange-500 mb-1" />
                    <span className="text-lg font-bold text-foreground">Rs. {shop.minimumOrderAmount}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Min Order</span>
                  </div>
                )}

                {/* Shop Type */}
                {shop.shopType && (
                  <div className="flex flex-col items-center justify-center bg-muted/50 border border-border rounded-xl px-4 py-3 min-w-[90px]">
                    <Store className="h-4 w-4 text-muted-foreground mb-1" />
                    <span className="text-sm font-bold text-foreground capitalize">{shop.shopType}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Category</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* --- ALERTS SECTION --- */}
      <div className="space-y-1 mt-4">
          {/* 1. CLOSED WARNING */}
          {!isOpen && (
            <div className="bg-destructive/10 border-y border-destructive/20 p-4 animate-in slide-in-from-top-2">
                <div className="container mx-auto flex items-center gap-3 text-destructive font-medium">
                    <Lock className="h-5 w-5" />
                    <div>
                        <p>This shop is currently closed.</p>
                        <p className="text-xs opacity-80">You cannot place orders right now. Please come back at {shop.openingTime}.</p>
                    </div>
                </div>
            </div>
          )}

          {/* 2. RADAR WARNING (Only show if open, user has address, and out of range) */}
          {isOpen && distance !== null && !isDeliverable && (
            <div className="bg-red-50 border-y border-red-100 p-4">
                <div className="container mx-auto flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-red-700 text-sm">Delivery Not Available to Your Saved Address</h3>
                        <p className="text-xs text-red-600 mt-1">
                            You are <strong>{distance} km</strong> away (limit: {shop.deliveryRadius} km). 
                            You can still add items for <strong>Store Pickup</strong>.
                        </p>
                    </div>
                </div>
            </div>
          )}
      </div>

      {/* --- MENU & CONTENT --- */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <ScrollArea className="w-full md:w-auto max-w-[70vw] whitespace-nowrap">
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeCategory === cat 
                      ? "bg-primary text-primary-foreground shadow-md scale-105" 
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="hidden" />
          </ScrollArea>
          
          <div className="relative w-full md:w-64 hidden md:block">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input 
               placeholder="Search in shop..." 
               className="pl-9 h-9 rounded-full bg-muted/50 focus:bg-background" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
        </div>
      </div>

      {/* --- PRODUCTS GRID --- */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Sidebar Menu */}
          <div className="hidden md:block col-span-3 lg:col-span-2 space-y-1 sticky top-24 h-fit">
             <h3 className="font-bold text-lg mb-4 px-2">Menu</h3>
             {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                     activeCategory === cat 
                       ? "bg-primary/10 text-primary font-bold border-l-4 border-primary" 
                       : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {cat}
                </button>
             ))}
          </div>

          <div className="col-span-1 md:col-span-9 lg:col-span-10">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-xl font-bold">{activeCategory} Items</h2>
               <Badge variant="outline">{filteredProducts.length} items</Badge>
             </div>

             {filteredProducts.length > 0 ? (
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${!isOpen ? "opacity-60 pointer-events-none" : ""}`}>
                  {filteredProducts.map((product) => (
                    <ProductCard 
                      key={product._id} 
                      product={product} 
                      quantity={getItemQuantity(product._id)}
                      isShopOpen={isOpen}
                      isDeliverable={isDeliverable}
                      onAdd={() => {
                          if (!isOpen) return;
                          // If out of range, allow adding but warn about pickup
                          if (distance !== null && !isDeliverable) toast.warning("Added to cart. Remember, this is too far for delivery. You will need to select Pickup at checkout.");
                          addToCart(product, shop);
                      }}
                      onRemove={() => updateQuantity(product._id, -1)}
                    />
                  ))}
                </div>
             ) : (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                   <ShoppingBag className="h-10 w-10 mb-2 opacity-50" />
                   <p>No items found.</p>
                </div>
             )}
          </div>
        </div>
      </div>
      
      {/* --- FLOATING CART --- */}
      {isOpen && totalItems > 0 && (
         <div className="fixed bottom-6 left-0 right-0 px-4 z-50 flex justify-center">
            <Link href="/checkout" className="w-full max-w-md">
                <Button size="lg" className="w-full shadow-2xl rounded-full h-14 flex justify-between px-6">
                   <div className="flex items-center gap-3">
                      <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm">
                        {totalItems}
                      </div>
                      <span className="font-medium">View Cart</span>
                   </div>
                   <span className="font-bold">Checkout</span>
                </Button>
            </Link>
         </div>
      )}

    </div>
  );
}

// --- PRODUCT CARD with SMOOTH EXPANSION ---
function ProductCard({ product, quantity, onAdd, onRemove, isShopOpen }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const imageSrc = product.image || product.imageUrl || "https://placehold.co/400?text=No+Image";
  
  // Stock checks
  const isOutOfStock = !product.stock || product.stock <= 0;
  const stockRemaining = product.stock ? Math.max(0, product.stock - quantity) : 0;
  const canAddMore = !isOutOfStock && quantity < product.stock;

  return (
    <div 
      className="group relative"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* CARD - Natural height, expands on hover */}
      <div 
        className={`bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col cursor-pointer ${isExpanded ? "ring-2 ring-primary/30" : ""} ${isOutOfStock ? "opacity-70" : ""}`}
      >
        {/* IMAGE SECTION */}
        <div className="relative h-40 w-full bg-white overflow-hidden shrink-0">
          <img 
            src={imageSrc} 
            alt={product.name} 
            className={`w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 ${!isShopOpen ? "grayscale" : ""} ${isOutOfStock ? "grayscale" : ""}`}
          />
          {quantity > 0 && (
             <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full shadow-md z-10">
               x{quantity}
             </div>
          )}
          
          {/* OUT OF STOCK BADGE */}
          {isOutOfStock && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
               <span className="text-white font-bold text-sm">Out of Stock</span>
             </div>
          )}
        </div>

        {/* MAIN CONTENT */}
        <div className="p-4 flex flex-col">
          
          {/* TITLE & DESCRIPTION */}
          <div>
             <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
             <p className={`text-xs text-muted-foreground mt-1 transition-all duration-300 ${isExpanded ? "line-clamp-6" : "line-clamp-2"}`}>
               {product.description || "Fresh and best quality product."}
             </p>
          </div>

          {/* EXPANDED SECTION - Shows on Hover */}
          <div 
            className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-40 opacity-100 mt-3" : "max-h-0 opacity-0"}`}
          >
            <div className="space-y-2.5">
              
              {/* CATEGORY & STOCK */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground font-medium">Category</p>
                  <p className="text-foreground font-semibold">{product.category || "General"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium">Stock</p>
                  <p className={`font-semibold ${isOutOfStock ? "text-red-600" : stockRemaining <= 5 ? "text-orange-600" : "text-foreground"}`}>
                    {isOutOfStock ? "Out of Stock" : stockRemaining <= 0 ? "Out of Stock" : stockRemaining === 1 ? "1 left" : `${stockRemaining} left`}
                  </p>
                </div>
              </div>

              {/* ORIGINAL PRICE */}
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs line-through text-muted-foreground">
                    Rs. {product.originalPrice}
                  </span>
                  <Badge variant="secondary" className="text-xs h-5">
                    Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </Badge>
                </div>
              )}
            </div>
          </div>
          
          {/* PRICE & ACTION BUTTONS */}
          <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
             <p className="font-bold text-lg text-foreground">Rs. {product.price}</p>
             
             {quantity === 0 ? (
               <Button 
                 size="sm" 
                 disabled={!isShopOpen || isOutOfStock} 
                 className={`h-8 rounded-full border-primary/50 text-primary hover:bg-primary hover:text-white transition-colors ${isOutOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
                 variant="outline"
                 onClick={() => {
                   if (isOutOfStock) {
                     toast.error("This item is out of stock.");
                     return;
                   }
                   if (!isShopOpen) return;
                   onAdd();
                 }}
               >
                 {!isShopOpen ? "Closed" : isOutOfStock ? "Out of Stock" : "Add"}
               </Button>
             ) : (
               <div className="flex items-center gap-2 bg-primary/10 rounded-full p-1 border border-primary/20">
                  <button 
                    onClick={onRemove}
                    disabled={!isShopOpen}
                    className="h-6 w-6 rounded-full bg-background text-primary flex items-center justify-center shadow-sm disabled:opacity-50 hover:bg-primary hover:text-white transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-sm font-bold w-4 text-center tabular-nums">{quantity}</span>
                  <button 
                    onClick={() => {
                      if (!canAddMore) {
                        toast.error(`Only ${product.stock} available in stock.`);
                        return;
                      }
                      onAdd();
                    }}
                    disabled={!isShopOpen || !canAddMore}
                    className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm disabled:opacity-50 hover:bg-primary/80 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ShopSkeleton() {
  return (
    <div className="space-y-6 container mx-auto px-4 py-8">
       <Skeleton className="h-64 w-full rounded-xl" />
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
         {[1,2,3,4].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
       </div>
    </div>
  )
}

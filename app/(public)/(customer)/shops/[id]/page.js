"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Search, MapPin, Star, Clock, ShoppingBag, Plus, Minus, AlertTriangle, Navigation, Lock } from "lucide-react"; 
import { toast } from "sonner"; 
import Link from "next/link";

import { useCart } from "@/context/cartContext";
import { useAddress } from "@/context/addressContext"; // ✅ IMPORT GLOBAL ADDRESS

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// --- HELPER: ROBUST Time Check Logic ---
const checkIsShopOpen = (shop) => {
  if (!shop) return false;
  if (shop.isShopOpen === false) return false; 
  if (!shop.openingTime || !shop.closingTime) return true; 

  try {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [openH, openM] = shop.openingTime.split(":").map(Number);
    const [closeH, closeM] = shop.closingTime.split(":").map(Number);

    if (isNaN(openH) || isNaN(closeH)) return true; // Safe fallback

    const startMinutes = openH * 60 + (openM || 0);
    const endMinutes = closeH * 60 + (closeM || 0);

    if (endMinutes > startMinutes) {
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } else {
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }
  } catch (error) {
    return true; // Safe fallback
  }
};

export default function SingleShopPage() {
  const params = useParams(); 
  const { cart: globalCart, addToCart, updateQuantity } = useCart();
  const { selectedAddress } = useAddress(); // ✅ PULL ADDRESS FROM CONTEXT
  
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
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

    // ✅ If the user has an address set, calculate distance from that address
    if (selectedAddress && selectedAddress.location?.coordinates) {
        const userLat = selectedAddress.location.coordinates[1];
        const userLng = selectedAddress.location.coordinates[0];
        const shopLat = shop.shopLocation.coordinates[1];
        const shopLng = shop.shopLocation.coordinates[0];
        
        const R = 6371; 
        const dLat = (shopLat - userLat) * (Math.PI / 180);
        const dLon = (shopLng - userLng) * (Math.PI / 180);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(userLat * (Math.PI/180)) * Math.cos(shopLat * (Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const dist = parseFloat((R * c).toFixed(1));

        setDistance(dist);
        const radius = shop.deliveryRadius || 5; 
        setIsDeliverable(dist <= radius);
    } else {
        // If guest has no address set, reset distance states
        setDistance(null);
        setIsDeliverable(true);
    }
  }, [shop, selectedAddress]); // ✅ Re-run if they change address in the header

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
      
      {/* --- SECTION 1: Header --- */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={shop.shopBanner || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80"} 
            alt="Cover" 
            className={`w-full h-full object-cover ${!isOpen ? "grayscale" : ""}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-6">
          <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
            
            <div className="h-24 w-24 md:h-32 md:w-32 rounded-2xl border-4 border-background bg-white shadow-xl overflow-hidden shrink-0">
               <img 
                 src={shop.shopLogo || "https://via.placeholder.com/150"} 
                 alt="Logo" 
                 className={`w-full h-full object-cover ${!isOpen ? "grayscale" : ""}`}
               />
            </div>

            <div className="flex-1 space-y-2 mb-1">
              <div className="flex items-center gap-3">
                 <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight drop-shadow-sm">
                   {shop.shopName}
                 </h1>
                 <Badge className={isOpen ? "bg-green-600 hover:bg-green-600" : "bg-destructive"}>
                   {isOpen ? "Open Now" : "Closed"}
                 </Badge>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base font-medium text-foreground/90">
                 <div className="flex items-center gap-1">
                   <Star className="h-4 w-4 text-orange-500 fill-orange-500" />
                   <span>4.8</span>
                 </div>
                 
                 {/* Open/Close Time Info */}
                 <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{isOpen ? `Closes ${shop.closingTime}` : `Opens ${shop.openingTime}`}</span>
                 </div>

                 {/* Radar Info */}
                 {distance !== null ? (
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${isDeliverable ? "bg-green-500/10 border-green-500/20 text-green-700" : "bg-red-500/10 border-red-500/20 text-red-700"}`}>
                        <Navigation className="h-3 w-3" />
                        <span>{distance} km away</span>
                    </div>
                 ) : (
                    <div className="flex items-center gap-1 bg-secondary px-2 py-0.5 rounded-full">
                        <MapPin className="h-3 w-3" />
                        <span className="text-xs">Select address to view delivery range</span>
                    </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- ALERTS SECTION --- */}
      <div className="space-y-1">
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

// --- PRODUCT CARD ---
function ProductCard({ product, quantity, onAdd, onRemove, isShopOpen }) {
  const imageSrc = product.image || product.imageUrl || "https://placehold.co/400?text=No+Image";

  return (
    <div className="group bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
      <div className="relative h-40 w-full bg-white overflow-hidden">
        <img 
          src={imageSrc} 
          alt={product.name} 
          className={`w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 ${!isShopOpen ? "grayscale" : ""}`}
        />
        {quantity > 0 && (
           <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
             x{quantity}
           </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
           <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
           <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
             {product.description || "Fresh and best quality product."}
           </p>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
           <p className="font-bold text-lg text-foreground">Rs. {product.price}</p>
           
           {quantity === 0 ? (
             <Button 
               size="sm" 
               variant="outline" 
               disabled={!isShopOpen} 
               className="h-8 rounded-full border-primary/50 text-primary hover:bg-primary hover:text-white transition-colors"
               onClick={onAdd}
             >
               {isShopOpen ? "Add" : "Closed"}
             </Button>
           ) : (
             <div className="flex items-center gap-2 bg-primary/10 rounded-full p-1 border border-primary/20">
                <button 
                  onClick={onRemove}
                  disabled={!isShopOpen}
                  className="h-6 w-6 rounded-full bg-background text-primary flex items-center justify-center shadow-sm disabled:opacity-50"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="text-sm font-bold w-4 text-center tabular-nums">{quantity}</span>
                <button 
                  onClick={onAdd}
                  disabled={!isShopOpen}
                  className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm disabled:opacity-50"
                >
                  <Plus className="h-3 w-3" />
                </button>
             </div>
           )}
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
// "use client";
// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import { Search, MapPin, Star, Clock, ShoppingBag, Plus, Minus, AlertTriangle, Navigation, Lock } from "lucide-react"; 
// import { toast } from "sonner"; 
// import Link from "next/link";

// import { useCart } from "@/context/cartContext";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// // --- HELPER: Time Check Logic ---
// const checkIsShopOpen = (shop) => {
//   if (!shop) return false;
//   // 1. Manual Toggle Check
//   if (!shop.isShopOpen) return false;

//   // 2. Time Check
//   if (!shop.openingTime || !shop.closingTime) return true;

//   const now = new Date();
//   const currentMinutes = now.getHours() * 60 + now.getMinutes();

//   const [openH, openM] = shop.openingTime.split(":").map(Number);
//   const [closeH, closeM] = shop.closingTime.split(":").map(Number);

//   const startMinutes = openH * 60 + openM;
//   const endMinutes = closeH * 60 + closeM;

//   if (endMinutes > startMinutes) {
//     return currentMinutes >= startMinutes && currentMinutes < endMinutes;
//   } else {
//     // Overnight handling (e.g. 6PM to 2AM)
//     return currentMinutes >= startMinutes || currentMinutes < endMinutes;
//   }
// };

// export default function SingleShopPage() {
//   const params = useParams(); 
//   const { cart: globalCart, addToCart, updateQuantity } = useCart();
  
//   const [loading, setLoading] = useState(true);
//   const [shop, setShop] = useState(null);
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
  
//   // --- STATE: Status & Location ---
//   const [isOpen, setIsOpen] = useState(false); // Calculated Open Status
//   const [userLocation, setUserLocation] = useState(null);
//   const [distance, setDistance] = useState(null);
//   const [isDeliverable, setIsDeliverable] = useState(true);

//   // Filters
//   const [activeCategory, setActiveCategory] = useState("All");
//   const [searchQuery, setSearchQuery] = useState("");

//   // --- 1. Fetch Data ---
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await fetch(`/api/customer/shops/${params.id}`);
//         const data = await res.json();
        
//         if (data.success) {
//           setShop(data.shop);
//           setProducts(data.products);
//           setCategories(["All", ...data.categories]);
          
//           // Calculate Open Status immediately
//           setIsOpen(checkIsShopOpen(data.shop));
//         }
//       } catch (error) {
//         console.error("Error fetching shop:", error);
//         toast.error("Failed to load shop.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (params.id) fetchData();
//   }, [params.id]);

//   // --- 2. RADAR LOGIC ---
//   useEffect(() => {
//     if (!shop || !shop.shopLocation) return;

//     if ("geolocation" in navigator) {
//        navigator.geolocation.getCurrentPosition((position) => {
//           const userLat = position.coords.latitude;
//           const userLng = position.coords.longitude;
//           setUserLocation({ lat: userLat, lng: userLng });

//           const shopLat = shop.shopLocation.coordinates[1];
//           const shopLng = shop.shopLocation.coordinates[0];
          
//           const R = 6371; 
//           const dLat = (shopLat - userLat) * (Math.PI / 180);
//           const dLon = (shopLng - userLng) * (Math.PI / 180);
//           const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
//                     Math.cos(userLat * (Math.PI/180)) * Math.cos(shopLat * (Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2);
//           const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//           const dist = parseFloat((R * c).toFixed(1));

//           setDistance(dist);
//           const radius = shop.deliveryRadius || 5; 
//           setIsDeliverable(dist <= radius);

//        }, (err) => console.log("Location denied:", err));
//     }
//   }, [shop]);

//   // -- Filters --
//   const filteredProducts = products.filter((p) => {
//     const matchesCategory = activeCategory === "All" || p.category === activeCategory;
//     const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });

//   const getItemQuantity = (productId) => {
//     if (globalCart.shopId && globalCart.shopId !== params.id) return 0;
//     const item = globalCart.items.find((i) => i.productId === productId);
//     return item ? item.quantity : 0;
//   };

//   const totalItems = globalCart.shopId === params.id 
//     ? globalCart.items.reduce((a, b) => a + b.quantity, 0)
//     : 0;

//   if (loading) return <ShopSkeleton />;
//   if (!shop) return <div className="text-center py-20 font-bold">Shop not found.</div>;

//   return (
//     <div className="min-h-screen bg-background pb-24">
      
//       {/* --- SECTION 1: Header --- */}
//       <div className="relative h-64 md:h-80 w-full overflow-hidden">
//         <div className="absolute inset-0">
//           <img 
//             src={shop.shopBanner || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80"} 
//             alt="Cover" 
//             className={`w-full h-full object-cover ${!isOpen ? "grayscale" : ""}`}
//           />
//           <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
//         </div>

//         <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-6">
//           <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
            
//             <div className="h-24 w-24 md:h-32 md:w-32 rounded-2xl border-4 border-background bg-white shadow-xl overflow-hidden shrink-0">
//                <img 
//                  src={shop.shopLogo || "https://via.placeholder.com/150"} 
//                  alt="Logo" 
//                  className={`w-full h-full object-cover ${!isOpen ? "grayscale" : ""}`}
//                />
//             </div>

//             <div className="flex-1 space-y-2 mb-1">
//               <div className="flex items-center gap-3">
//                  <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight drop-shadow-sm">
//                    {shop.shopName}
//                  </h1>
//                  <Badge className={isOpen ? "bg-green-600 hover:bg-green-600" : "bg-destructive"}>
//                    {isOpen ? "Open Now" : "Closed"}
//                  </Badge>
//               </div>
              
//               <div className="flex flex-wrap items-center gap-4 text-sm md:text-base font-medium text-foreground/90">
//                  <div className="flex items-center gap-1">
//                    <Star className="h-4 w-4 text-orange-500 fill-orange-500" />
//                    <span>4.8</span>
//                  </div>
                 
//                  {/* Open/Close Time Info */}
//                  <div className="flex items-center gap-1">
//                     <Clock className="h-4 w-4" />
//                     <span>{isOpen ? `Closes ${shop.closingTime}` : `Opens ${shop.openingTime}`}</span>
//                  </div>

//                  {/* Radar Info */}
//                  {distance !== null ? (
//                     <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${isDeliverable ? "bg-green-500/10 border-green-500/20 text-green-700" : "bg-red-500/10 border-red-500/20 text-red-700"}`}>
//                         <Navigation className="h-3 w-3" />
//                         <span>{distance} km away</span>
//                     </div>
//                  ) : (
//                     <div className="flex items-center gap-1">
//                         <MapPin className="h-4 w-4" />
//                         <span>{shop.deliveryRadius}km delivery</span>
//                     </div>
//                  )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* --- ALERTS SECTION --- */}
//       <div className="space-y-1">
//           {/* 1. CLOSED WARNING */}
//           {!isOpen && (
//             <div className="bg-destructive/10 border-y border-destructive/20 p-4 animate-in slide-in-from-top-2">
//                 <div className="container mx-auto flex items-center gap-3 text-destructive font-medium">
//                     <Lock className="h-5 w-5" />
//                     <div>
//                         <p>This shop is currently closed.</p>
//                         <p className="text-xs opacity-80">You cannot place orders right now. Please come back at {shop.openingTime}.</p>
//                     </div>
//                 </div>
//             </div>
//           )}

//           {/* 2. RADAR WARNING (Only show if open, otherwise 'Closed' is more important) */}
//           {isOpen && !isDeliverable && distance && (
//             <div className="bg-red-50 border-y border-red-100 p-4">
//                 <div className="container mx-auto flex items-start gap-3">
//                     <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
//                     <div>
//                         <h3 className="font-bold text-red-700 text-sm">Delivery Not Available</h3>
//                         <p className="text-xs text-red-600 mt-1">
//                             You are <strong>{distance} km</strong> away (limit: {shop.deliveryRadius} km). 
//                             Pickup available.
//                         </p>
//                     </div>
//                 </div>
//             </div>
//           )}
//       </div>

//       {/* --- MENU & CONTENT --- */}
//       {/* ... (Sticky Menu code remains the same) ... */}
//       <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
//         <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
//           <ScrollArea className="w-full md:w-auto max-w-[70vw] whitespace-nowrap">
//             <div className="flex gap-2">
//               {categories.map((cat) => (
//                 <button
//                   key={cat}
//                   onClick={() => setActiveCategory(cat)}
//                   className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
//                     activeCategory === cat 
//                       ? "bg-primary text-primary-foreground shadow-md scale-105" 
//                       : "bg-muted text-muted-foreground hover:bg-muted/80"
//                   }`}
//                 >
//                   {cat}
//                 </button>
//               ))}
//             </div>
//             <ScrollBar orientation="horizontal" className="hidden" />
//           </ScrollArea>
          
//           {/* Search Bar Code... */}
//           <div className="relative w-full md:w-64 hidden md:block">
//              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//              <Input 
//                placeholder="Search in shop..." 
//                className="pl-9 h-9 rounded-full bg-muted/50 focus:bg-background" 
//                value={searchQuery}
//                onChange={(e) => setSearchQuery(e.target.value)}
//              />
//           </div>
//         </div>
//       </div>

//       {/* --- PRODUCTS GRID --- */}
//       <div className="container mx-auto px-4 py-8">
//         <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
//           {/* Sidebar Menu (Unchanged) */}
//           <div className="hidden md:block col-span-3 lg:col-span-2 space-y-1 sticky top-24 h-fit">
//              <h3 className="font-bold text-lg mb-4 px-2">Menu</h3>
//              {categories.map((cat) => (
//                 <button
//                   key={cat}
//                   onClick={() => setActiveCategory(cat)}
//                   className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
//                      activeCategory === cat 
//                        ? "bg-primary/10 text-primary font-bold border-l-4 border-primary" 
//                        : "text-muted-foreground hover:bg-muted"
//                   }`}
//                 >
//                   {cat}
//                 </button>
//              ))}
//           </div>

//           <div className="col-span-1 md:col-span-9 lg:col-span-10">
//              <div className="flex items-center justify-between mb-6">
//                <h2 className="text-xl font-bold">{activeCategory} Items</h2>
//                <Badge variant="outline">{filteredProducts.length} items</Badge>
//              </div>

//              {filteredProducts.length > 0 ? (
//                 <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${!isOpen ? "opacity-60 pointer-events-none" : ""}`}>
//                   {filteredProducts.map((product) => (
//                     <ProductCard 
//                       key={product._id} 
//                       product={product} 
//                       quantity={getItemQuantity(product._id)}
//                       // Lock interaction if closed
//                       isShopOpen={isOpen}
//                       isDeliverable={isDeliverable}
                      
//                       onAdd={() => {
//                           if (!isOpen) return; // Double protection
//                           if (!isDeliverable) toast.warning("Pickup only (Too far for delivery)");
//                           addToCart(product, shop);
//                       }}
//                       onRemove={() => updateQuantity(product._id, -1)}
//                     />
//                   ))}
//                 </div>
//              ) : (
//                 <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
//                    <ShoppingBag className="h-10 w-10 mb-2 opacity-50" />
//                    <p>No items found.</p>
//                 </div>
//              )}
//           </div>
//         </div>
//       </div>
      
//       {/* --- FLOATING CART (Only if open and items exist) --- */}
//       {isOpen && totalItems > 0 && (
//          <div className="fixed bottom-6 left-0 right-0 px-4 z-50 flex justify-center">
//             <Link href="/checkout" className="w-full max-w-md">
//                 <Button size="lg" className="w-full shadow-2xl rounded-full h-14 flex justify-between px-6">
//                    <div className="flex items-center gap-3">
//                       <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm">
//                         {totalItems}
//                       </div>
//                       <span className="font-medium">View Cart</span>
//                    </div>
//                    <span className="font-bold">Checkout</span>
//                 </Button>
//             </Link>
//          </div>
//       )}

//     </div>
//   );
// }

// // --- PRODUCT CARD (Handles Disabled State) ---
// function ProductCard({ product, quantity, onAdd, onRemove, isShopOpen }) {
//   const imageSrc = product.image || product.imageUrl || "https://placehold.co/400?text=No+Image";

//   return (
//     <div className="group bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
//       <div className="relative h-40 w-full bg-white overflow-hidden">
//         <img 
//           src={imageSrc} 
//           alt={product.name} 
//           className={`w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 ${!isShopOpen ? "grayscale" : ""}`}
//         />
//         {quantity > 0 && (
//            <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
//              x{quantity}
//            </div>
//         )}
//       </div>

//       <div className="p-4 flex flex-col flex-1">
//         <div className="flex-1">
//            <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
//            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
//              {product.description || "Fresh and best quality product."}
//            </p>
//         </div>
        
//         <div className="mt-4 flex items-center justify-between">
//            <p className="font-bold text-lg text-foreground">Rs. {product.price}</p>
           
//            {/* DISABLE BUTTONS IF CLOSED */}
//            {quantity === 0 ? (
//              <Button 
//                size="sm" 
//                variant="outline" 
//                disabled={!isShopOpen} // <--- LOCKED
//                className="h-8 rounded-full border-primary/50 text-primary hover:bg-primary hover:text-white transition-colors"
//                onClick={onAdd}
//              >
//                {isShopOpen ? "Add" : "Closed"}
//              </Button>
//            ) : (
//              <div className="flex items-center gap-2 bg-primary/10 rounded-full p-1 border border-primary/20">
//                 <button 
//                   onClick={onRemove}
//                   disabled={!isShopOpen}
//                   className="h-6 w-6 rounded-full bg-background text-primary flex items-center justify-center shadow-sm disabled:opacity-50"
//                 >
//                   <Minus className="h-3 w-3" />
//                 </button>
//                 <span className="text-sm font-bold w-4 text-center tabular-nums">{quantity}</span>
//                 <button 
//                   onClick={onAdd}
//                   disabled={!isShopOpen}
//                   className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm disabled:opacity-50"
//                 >
//                   <Plus className="h-3 w-3" />
//                 </button>
//              </div>
//            )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function ShopSkeleton() {
//   return (
//     <div className="space-y-6 container mx-auto px-4 py-8">
//        <Skeleton className="h-64 w-full rounded-xl" />
//        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
//          {[1,2,3,4].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
//        </div>
//     </div>
//   )
// }
// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { Search, MapPin, Filter, Store, Star } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// export default function ShopsListingPage() {
//   const [shops, setShops] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [location, setLocation] = useState(null); // { lat, lng }
//   const [filter, setFilter] = useState({ search: "", category: "All" });

//   // 1. Get User Location on Mount (Browser API - No Google Maps Key needed)
//   useEffect(() => {
//     if ("geolocation" in navigator) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setLocation({
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           });
//         },
//         (error) => {
//           console.log("Location permission denied, showing default sort.");
//           setLoading(false); // Trigger fetch without location
//         }
//       );
//     } else {
//       setLoading(false);
//     }
//   }, []);

//   // 2. Fetch Shops when Location or Filters change
//   useEffect(() => {
//     const fetchShops = async () => {
//       setLoading(true);
//       try {
//         const params = new URLSearchParams();
//         if (location) {
//           params.append("lat", location.lat);
//           params.append("lng", location.lng);
//         }
//         if (filter.category !== "All") params.append("category", filter.category);
//         if (filter.search) params.append("search", filter.search);

//         const res = await fetch(`/api/customer/shops?${params.toString()}`);
//         const data = await res.json();
        
//         if (data.success) {
//           setShops(data.shops);
//         }
//       } catch (error) {
//         console.error("Error fetching shops:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     // If we have location or if loading was set to false (permission denied), fetch data
//     if (location || !loading) {
//       fetchShops();
//     }
//   }, [location, filter]); // Re-run when location or user filters change

//   return (
//     <div className="min-h-screen bg-background">
      
//       {/* --- Sticky Header / Filter Bar --- */}
//       <div className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            
//             {/* Title & Location Indicator */}
//             <div className="flex items-center gap-2 self-start md:self-auto">
//               <div className="p-2 bg-primary/10 rounded-lg">
//                 <Store className="h-6 w-6 text-primary" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold leading-none">Browse Shops</h1>
//                 <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
//                   <MapPin className="h-3 w-3" /> 
//                   {location ? "Sorted by distance" : "Showing all locations"}
//                 </p>
//               </div>
//             </div>

//             {/* Search & Filters */}
//             <div className="flex w-full md:w-auto gap-2">
//               <div className="relative w-full md:w-80">
//                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   placeholder="Search stores..."
//                   className="pl-9"
//                   value={filter.search}
//                   onChange={(e) => setFilter({ ...filter, search: e.target.value })}
//                 />
//               </div>
//               <Select 
//                 onValueChange={(val) => setFilter({ ...filter, category: val })} 
//                 defaultValue="All"
//               >
//                 <SelectTrigger className="w-[140px]">
//                   <SelectValue placeholder="Category" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="All">All Categories</SelectItem>
//                   <SelectItem value="Grocery">Grocery</SelectItem>
//                   <SelectItem value="Pharmacy">Pharmacy</SelectItem>
//                   <SelectItem value="General">General</SelectItem>
//                   <SelectItem value="Bakery">Bakery</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* --- Main Grid Content --- */}
//       <div className="container mx-auto px-4 py-8">
//         {loading ? (
//           // Skeleton Loading State
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//             {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
//               <div key={i} className="flex flex-col space-y-3">
//                 <Skeleton className="h-48 w-full rounded-xl" />
//                 <div className="space-y-2">
//                   <Skeleton className="h-4 w-[250px]" />
//                   <Skeleton className="h-4 w-[200px]" />
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : shops.length > 0 ? (
//           // Actual Shops Grid
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
//             {shops.map((shop) => (
//               <ShopCard key={shop._id} shop={shop} />
//             ))}
//           </div>
//         ) : (
//           // Empty State
//           <div className="flex flex-col items-center justify-center py-20 text-center">
//              <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-4">
//                <Store className="h-10 w-10 text-muted-foreground" />
//              </div>
//              <h2 className="text-2xl font-bold text-foreground">No shops found</h2>
//              <p className="text-muted-foreground max-w-sm mt-2">
//                We couldn't find any shops matching your criteria. Try changing your search or category.
//              </p>
//              <Button 
//                variant="outline" 
//                className="mt-6"
//                onClick={() => setFilter({ search: "", category: "All" })}
//              >
//                Clear Filters
//              </Button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // --- 3. The High-End Shop Card Component ---
// function ShopCard({ shop }) {
//   // Use fallbacks for images if user hasn't uploaded any
//   const coverImage = shop.shopBanner || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800";
//   const logoImage = shop.shopLogo || "https://via.placeholder.com/100?text=Shop";

//   return (
//     <Link href={`/shops/${shop._id}`} className="block h-full">
//       <div className="group relative h-full bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        
//         {/* Cover Image Area */}
//         <div className="relative h-40 overflow-hidden">
//           {/* Status Badge */}
//           <div className="absolute top-3 left-3 z-20">
//              <Badge className={shop.isShopOpen ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"}>
//                {shop.isShopOpen ? "Open Now" : "Closed"}
//              </Badge>
//           </div>
          
//           {/* Dark Overlay for text contrast on hover */}
//           <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors z-10" />
          
//           <img 
//             src={coverImage} 
//             alt={shop.shopName} 
//             className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
//           />
//         </div>

//         {/* Content Area */}
//         <div className="p-4 pt-10 relative">
//             {/* Floating Logo (Instagram Style) */}
//             <div className="absolute -top-8 left-4 p-1 bg-card rounded-full shadow-md z-20">
//                 <img 
//                     src={logoImage} 
//                     alt="Logo" 
//                     className="h-14 w-14 rounded-full object-cover border border-border"
//                 />
//             </div>

//             {/* Shop Details */}
//             <div className="space-y-1">
//                 <div className="flex justify-between items-start">
//                     <h3 className="font-bold text-lg text-card-foreground line-clamp-1 group-hover:text-primary transition-colors">
//                         {shop.shopName}
//                     </h3>
//                     {/* Rating Pill */}
//                     <div className="flex items-center gap-1 text-xs font-semibold bg-secondary px-2 py-1 rounded">
//                         <Star className="h-3 w-3 text-orange-400 fill-orange-400" />
//                         <span>4.8</span>
//                     </div>
//                 </div>

//                 <p className="text-sm text-muted-foreground font-medium">
//                     {shop.shopType}
//                 </p>
//                 <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5em]">
//                     {shop.shopDescription || "No description provided."}
//                 </p>

//                 {/* Footer Info */}
//                 <div className="pt-4 mt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
//                     <div className="flex items-center gap-1">
//                         <MapPin className="h-3 w-3" />
//                         <span>{shop.deliveryRadius}km Delivery</span>
//                     </div>
//                     <div>
//                         Min Order: Rs. 0
//                     </div>
//                 </div>
//             </div>
//         </div>
//       </div>
//     </Link>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, MapPin, Filter, Store, Star, Navigation } from "lucide-react"; // Added Navigation icon
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ShopsListingPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null); // { lat, lng }
  const [filter, setFilter] = useState({ search: "", category: "All" });

  // --- 1. RADAR MATH (Haversine Formula) ---
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Returns distance in KM
  };

  // --- 2. Get User Location on Mount ---
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Location permission denied, showing default sort.");
          setLoading(false); 
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  // --- 3. Fetch & PROCESS Shops ---
  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filter.category !== "All") params.append("category", filter.category);
        if (filter.search) params.append("search", filter.search);
        // Note: We are doing the sorting on frontend now, so we might not need to send lat/lng to API 
        // unless your API does pre-filtering.

        const res = await fetch(`/api/customer/shops?${params.toString()}`);
        const data = await res.json();
        
        if (data.success) {
          let processedShops = data.shops;

          // --- RADAR LOGIC START ---
          if (location) {
            processedShops = processedShops.map(shop => {
                // MongoDB GeoJSON is [lng, lat]
                const shopLat = shop.shopLocation?.coordinates?.[1];
                const shopLng = shop.shopLocation?.coordinates?.[0];
                
                const dist = calculateDistance(location.lat, location.lng, shopLat, shopLng);
                return { ...shop, distance: dist }; // Add distance to shop object
            });

            // OPTIONAL: Filter out shops that don't deliver to this distance
            // processedShops = processedShops.filter(s => s.distance <= (s.deliveryRadius || 10));

            // SORT: Nearest First
            processedShops.sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
          }
          // --- RADAR LOGIC END ---

          setShops(processedShops);
        }
      } catch (error) {
        console.error("Error fetching shops:", error);
      } finally {
        setLoading(false);
      }
    };

    if (location || !loading) {
      fetchShops();
    }
  }, [location, filter]); 

  return (
    <div className="min-h-screen bg-background">
      
      {/* --- Sticky Header / Filter Bar --- */}
      <div className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            
            {/* Title & Location Indicator */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold leading-none">Browse Shops</h1>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" /> 
                  {location ? "Sorted by nearest distance" : "Showing all locations"}
                </p>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="flex w-full md:w-auto gap-2">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search stores..."
                  className="pl-9"
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                />
              </div>
              <Select 
                onValueChange={(val) => setFilter({ ...filter, category: val })} 
                defaultValue="All"
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="Grocery">Grocery</SelectItem>
                  <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Bakery">Bakery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Grid Content --- */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          // Skeleton Loading State
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-48 w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : shops.length > 0 ? (
          // Actual Shops Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {shops.map((shop) => (
              <ShopCard key={shop._id} shop={shop} userHasLocation={!!location} />
            ))}
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-4">
               <Store className="h-10 w-10 text-muted-foreground" />
             </div>
             <h2 className="text-2xl font-bold text-foreground">No shops found</h2>
             <p className="text-muted-foreground max-w-sm mt-2">
               We couldn't find any shops matching your criteria. Try changing your search or category.
             </p>
             <Button 
               variant="outline" 
               className="mt-6"
               onClick={() => setFilter({ search: "", category: "All" })}
             >
               Clear Filters
             </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- HELPER: Check if Shop is Open based on Time ---
const checkIsShopOpen = (shop) => {
  // 1. If the "Master Switch" (Manual Toggle) is Off, it's Closed.
  if (!shop.isShopOpen) return false;

  // 2. If no times are set, assume Open (or handle as you prefer)
  if (!shop.openingTime || !shop.closingTime) return true;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [openH, openM] = shop.openingTime.split(":").map(Number);
  const [closeH, closeM] = shop.closingTime.split(":").map(Number);

  const startMinutes = openH * 60 + openM;
  const endMinutes = closeH * 60 + closeM;

  // Case A: Standard Day (e.g. 09:00 to 22:00)
  if (endMinutes > startMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } 
  // Case B: Overnight Shop (e.g. 18:00 to 02:00)
  else {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
};

// --- 3. The High-End Shop Card Component (Fixed Logic) ---
function ShopCard({ shop, userHasLocation }) {
  const coverImage = shop.shopBanner || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800";
  const logoImage = shop.shopLogo || "https://via.placeholder.com/100?text=Shop";

  // --- FIX: Calculate Status Dynamically ---
  const isOpen = checkIsShopOpen(shop);

  // Radar Logic
  const distance = shop.distance ? shop.distance.toFixed(1) : null;
  const isDeliverable = distance && distance <= (shop.deliveryRadius || 100); 

  return (
    <Link href={`/shops/${shop._id}`} className="block h-full">
      <div className={`group relative h-full bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${!isOpen ? "opacity-80 grayscale-[0.5] hover:grayscale-0" : ""}`}>
        
        {/* Cover Image Area */}
        <div className="relative h-40 overflow-hidden">
          
          {/* --- STATUS BADGE (UPDATED) --- */}
          <div className="absolute top-3 left-3 z-20">
             <Badge className={isOpen ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"}>
               {isOpen ? "Open Now" : "Closed"}
             </Badge>
          </div>

          {/* Distance Badge */}
          {userHasLocation && distance && (
             <div className="absolute top-3 right-3 z-20">
                <Badge variant="secondary" className="backdrop-blur-md bg-black/60 text-white hover:bg-black/70 border-0 flex items-center gap-1">
                   <Navigation className="w-3 h-3 text-sky-400" /> {distance} km
                </Badge>
             </div>
          )}
          
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors z-10" />
          
          <img 
            src={coverImage} 
            alt={shop.shopName} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
          />
        </div>

        {/* Content Area */}
        <div className="p-4 pt-10 relative">
            <div className="absolute -top-8 left-4 p-1 bg-card rounded-full shadow-md z-20">
                <img 
                    src={logoImage} 
                    alt="Logo" 
                    className={`h-14 w-14 rounded-full object-cover border border-border ${!isOpen ? "grayscale" : ""}`}
                />
            </div>

            <div className="space-y-1">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-card-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {shop.shopName}
                    </h3>
                    <div className="flex items-center gap-1 text-xs font-semibold bg-secondary px-2 py-1 rounded">
                        <Star className="h-3 w-3 text-orange-400 fill-orange-400" />
                        <span>4.8</span>
                    </div>
                </div>

                <p className="text-sm text-muted-foreground font-medium">
                    {shop.shopType} 
                    {/* Optional: Show closing time if open */}
                    {isOpen && <span className="text-[10px] ml-2 text-green-600 font-normal">• Closes {shop.closingTime}</span>}
                    {!isOpen && <span className="text-[10px] ml-2 text-red-500 font-normal">• Opens {shop.openingTime}</span>}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5em]">
                    {shop.shopDescription || "No description provided."}
                </p>

                <div className="pt-4 mt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        {userHasLocation && distance ? (
                            isDeliverable ? (
                                <span className="text-green-600 font-bold flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> Delivers to you
                                </span>
                            ) : (
                                <span className="text-red-500 font-medium flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> Too far
                                </span>
                            )
                        ) : (
                            <>
                               <MapPin className="h-3 w-3" />
                               <span>{shop.deliveryRadius}km Radius</span>
                            </>
                        )}
                    </div>
                    <div>
                        Min Order: Rs. 0
                    </div>
                </div>
            </div>
        </div>
      </div>
    </Link>
  );
}
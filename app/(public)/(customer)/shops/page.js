"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAddress } from "@/context/addressContext"; // ✅ IMPORT CONTEXT
import { Search, MapPin, Store, Star, Navigation, Map, Loader2 } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AddressSelector from "@/components/AddressSelector"; // Reusing your existing modal trigger if needed

export default function ShopsListingPage() {
  const { selectedAddress, loading: addressLoading } = useAddress(); 
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ search: "", category: "All" });

  useEffect(() => {
    if (addressLoading) return;

    if (!selectedAddress) {
        setShops([]);
        setLoading(false);
        return;
    }

    const fetchShops = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filter.category !== "All") params.append("category", filter.category);
        if (filter.search) params.append("search", filter.search);
        
        if (selectedAddress?.location?.coordinates) {
            params.append("lng", selectedAddress.location.coordinates[0]);
            params.append("lat", selectedAddress.location.coordinates[1]);
        }

        const res = await fetch(`/api/customer/shops?${params.toString()}`);
        const data = await res.json();
        
        if (data.success) {
          setShops(data.shops); 
        }
      } catch (error) {
        console.error("Error fetching shops:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, [selectedAddress, filter, addressLoading]); 

  return (
    <div className="min-h-screen bg-background pb-20">
      
      {/* --- Sticky Header / Filter Bar --- */}
      <div className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            
            <div className="flex items-center gap-3 self-start md:self-auto w-full md:w-auto">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold leading-none tracking-tight">Browse Shops</h1>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1.5 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> 
                  {selectedAddress ? (
                      <span className="truncate max-w-[200px] md:max-w-xs">{selectedAddress.label} - {selectedAddress.address}</span>
                  ) : (
                      <span>Location not set</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex w-full md:w-auto gap-2">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search stores..."
                  className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background"
                  value={filter.search}
                  disabled={!selectedAddress} // Disable if no address
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                />
              </div>
              <Select onValueChange={(val) => setFilter({ ...filter, category: val })} defaultValue="All" disabled={!selectedAddress}>
                <SelectTrigger className="w-[140px] bg-muted/50 border-transparent focus:bg-background">
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
        {addressLoading || (selectedAddress && loading) ? (
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
        ) : !selectedAddress ? (
          
          /* 🚨 UX UPGRADE: BEAUTIFUL GUEST ONBOARDING STATE */
          <div className="flex flex-col items-center justify-center py-12 md:py-24">
             <Card className="w-full max-w-md shadow-xl border-primary/20 bg-background/50 backdrop-blur-xl">
                 <CardHeader className="text-center pb-2">
                     <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                         <Map className="h-8 w-8 text-primary" />
                     </div>
                     <CardTitle className="text-2xl font-bold">Where are you?</CardTitle>
                     <CardDescription className="text-base mt-2">
                         To show you the best shops that can deliver hot and fresh to your door, we need your delivery location.
                     </CardDescription>
                 </CardHeader>
                 <CardContent className="pt-6 pb-8 flex justify-center">
                     {/* We reuse the exact AddressSelector component from your Header, but render it as a giant, high-conversion button here! */}
                     <div className="w-full flex justify-center scale-110 origin-top mt-2">
                         <AddressSelector />
                     </div>
                 </CardContent>
             </Card>
          </div>

        ) : shops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {shops.map((shop) => (
              <ShopCard key={shop._id} shop={shop} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-4">
               <Store className="h-10 w-10 text-muted-foreground" />
             </div>
             <h2 className="text-2xl font-bold text-foreground">No shops found</h2>
             <p className="text-muted-foreground max-w-sm mt-2">
               There are no shops currently delivering to this specific address. Try changing your location or expanding your search!
             </p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- HELPER: Check if Shop is Open based on Time ---
const checkIsShopOpen = (shop) => {
  if (shop.isShopOpen === false) return false;
  if (!shop.openingTime || !shop.closingTime) return true;

  try {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const [openH, openM] = shop.openingTime.split(":").map(Number);
      const [closeH, closeM] = shop.closingTime.split(":").map(Number);

      if(isNaN(openH) || isNaN(closeH)) return true;

      const startMinutes = openH * 60 + openM;
      const endMinutes = closeH * 60 + closeM;

      if (endMinutes > startMinutes) {
        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
      } else {
        return currentMinutes >= startMinutes || currentMinutes < endMinutes;
      }
  } catch (e) {
      return true;
  }
};

// --- 3. The Shop Card Component ---
function ShopCard({ shop }) {
  const coverImage = shop.shopBanner || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800";
  const logoImage = shop.shopLogo || "https://via.placeholder.com/100?text=Shop";
  const isOpen = checkIsShopOpen(shop);

  const distance = shop.distance ? shop.distance.toFixed(1) : null;

  return (
    <Link href={`/shops/${shop._id}`} className="block h-full">
      <div className={`group relative h-full bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${!isOpen ? "opacity-80 grayscale-[0.5] hover:grayscale-0" : ""}`}>
        
        <div className="relative h-40 overflow-hidden">
          <div className="absolute top-3 left-3 z-20">
             <Badge className={isOpen ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"}>
               {isOpen ? "Open Now" : "Closed"}
             </Badge>
          </div>

          {distance && (
             <div className="absolute top-3 right-3 z-20">
                <Badge variant="secondary" className="backdrop-blur-md bg-black/60 text-white hover:bg-black/70 border-0 flex items-center gap-1 shadow-md">
                   <Navigation className="w-3 h-3 text-sky-400" /> {distance} km
                </Badge>
             </div>
          )}
          
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors z-10" />
          <img src={coverImage} alt={shop.shopName} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
        </div>

        <div className="p-4 pt-10 relative flex flex-col flex-1">
            <div className="absolute -top-8 left-4 p-1 bg-card rounded-full shadow-md z-20">
                <img src={logoImage} alt="Logo" className={`h-14 w-14 rounded-full object-cover border border-border ${!isOpen ? "grayscale" : ""}`} />
            </div>

            <div className="space-y-1 flex-1">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-card-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {shop.shopName}
                    </h3>
                    <div className="flex items-center gap-1 text-xs font-semibold bg-secondary px-2 py-1 rounded shadow-sm">
                        <Star className="h-3 w-3 text-orange-400 fill-orange-400" />
                        <span>4.8</span>
                    </div>
                </div>

                <p className="text-sm text-muted-foreground font-medium">
                    {shop.shopType} 
                    {isOpen && <span className="text-[10px] ml-2 text-green-600 font-normal">• Closes {shop.closingTime}</span>}
                    {!isOpen && <span className="text-[10px] ml-2 text-red-500 font-normal">• Opens {shop.openingTime}</span>}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5em] mt-2">
                    {shop.shopDescription || "No description provided."}
                </p>
            </div>
            
            <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                    {distance ? (
                       <span className="text-green-600 font-bold flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                           <MapPin className="h-3 w-3" /> Delivers to you
                       </span>
                    ) : (
                       <span className="flex items-center gap-1">
                           <MapPin className="h-3 w-3" />
                           {shop.deliveryRadius}km Radius
                       </span>
                    )}
                </div>
                <div className="font-medium text-foreground">Min: Rs. 0</div>
            </div>
        </div>
      </div>
    </Link>
  );
}
// "use client";
// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useAddress } from "@/context/addressContext"; // ✅ IMPORT CONTEXT
// import { Search, MapPin, Store, Star, Navigation } from "lucide-react"; 
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// export default function ShopsListingPage() {
//   const { selectedAddress, loading: addressLoading } = useAddress(); // ✅ GET ACTIVE ADDRESS
//   const [shops, setShops] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState({ search: "", category: "All" });

//   // --- Fetch Shops whenever filters or active address changes ---
//   useEffect(() => {
//     // Don't fetch until we know the address state
//     if (addressLoading) return;

//     // 🚨 NEW RULE: Do not fetch shops if no address is selected!
//     if (!selectedAddress) {
//         setShops([]);
//         setLoading(false);
//         return;
//     }

//     const fetchShops = async () => {
//       setLoading(true);
//       try {
//         const params = new URLSearchParams();
//         if (filter.category !== "All") params.append("category", filter.category);
//         if (filter.search) params.append("search", filter.search);
        
//         // ✅ Send exact coordinates to backend for strict filtering
//         if (selectedAddress?.location?.coordinates) {
//             params.append("lng", selectedAddress.location.coordinates[0]);
//             params.append("lat", selectedAddress.location.coordinates[1]);
//         }

//         const res = await fetch(`/api/customer/shops?${params.toString()}`);
//         const data = await res.json();
        
//         if (data.success) {
//           setShops(data.shops); // Backend already calculated distances and removed out-of-range shops!
//         }
//       } catch (error) {
//         console.error("Error fetching shops:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchShops();
//   }, [selectedAddress, filter, addressLoading]); 

//   return (
//     <div className="min-h-screen bg-background">
      
//       {/* --- Sticky Header / Filter Bar --- */}
//       <div className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            
//             <div className="flex items-center gap-2 self-start md:self-auto">
//               <div className="p-2 bg-primary/10 rounded-lg">
//                 <Store className="h-6 w-6 text-primary" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold leading-none">Browse Shops</h1>
//                 <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
//                   <MapPin className="h-3 w-3" /> 
//                   {selectedAddress ? `Delivering to: ${selectedAddress.label}` : "Showing all locations (Set address to filter)"}
//                 </p>
//               </div>
//             </div>

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
//               <Select onValueChange={(val) => setFilter({ ...filter, category: val })} defaultValue="All">
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
//         {loading || addressLoading ? (
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
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
//             {shops.map((shop) => (
//               <ShopCard key={shop._id} shop={shop} />
//             ))}
//           </div>
//         ) : (
//           <div className="flex flex-col items-center justify-center py-20 text-center">
//              <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-4">
//                {/* Swapped icon to MapPin for the location prompt */}
//                {selectedAddress ? <Store className="h-10 w-10 text-muted-foreground" /> : <MapPin className="h-10 w-10 text-muted-foreground" />}
//              </div>
             
//              {/* 🚨 NEW RULE: Dynamic Header based on address state */}
//              <h2 className="text-2xl font-bold text-foreground">
//                 {selectedAddress ? "No shops found" : "Where are you located?"}
//              </h2>
             
//              {/* 🚨 NEW RULE: Dynamic Text based on address state */}
//              <p className="text-muted-foreground max-w-sm mt-2">
//                {selectedAddress 
//                  ? "There are no shops currently delivering to this specific address. Try changing your location!" 
//                  : "Please select your delivery address from the top bar to see shops delivering to your area."}
//              </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // --- HELPER: Check if Shop is Open based on Time ---
// const checkIsShopOpen = (shop) => {
//   if (!shop.isShopOpen) return false;
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
//     return currentMinutes >= startMinutes || currentMinutes < endMinutes;
//   }
// };

// // --- 3. The Shop Card Component ---
// function ShopCard({ shop }) {
//   const coverImage = shop.shopBanner || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800";
//   const logoImage = shop.shopLogo || "https://via.placeholder.com/100?text=Shop";
//   const isOpen = checkIsShopOpen(shop);

//   // Because the backend filtered them, ALL shops passed here are deliverable!
//   const distance = shop.distance ? shop.distance.toFixed(1) : null;

//   return (
//     <Link href={`/shops/${shop._id}`} className="block h-full">
//       <div className={`group relative h-full bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${!isOpen ? "opacity-80 grayscale-[0.5] hover:grayscale-0" : ""}`}>
        
//         <div className="relative h-40 overflow-hidden">
//           <div className="absolute top-3 left-3 z-20">
//              <Badge className={isOpen ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"}>
//                {isOpen ? "Open Now" : "Closed"}
//              </Badge>
//           </div>

//           {distance && (
//              <div className="absolute top-3 right-3 z-20">
//                 <Badge variant="secondary" className="backdrop-blur-md bg-black/60 text-white hover:bg-black/70 border-0 flex items-center gap-1">
//                    <Navigation className="w-3 h-3 text-sky-400" /> {distance} km
//                 </Badge>
//              </div>
//           )}
          
//           <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors z-10" />
//           <img src={coverImage} alt={shop.shopName} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
//         </div>

//         <div className="p-4 pt-10 relative">
//             <div className="absolute -top-8 left-4 p-1 bg-card rounded-full shadow-md z-20">
//                 <img src={logoImage} alt="Logo" className={`h-14 w-14 rounded-full object-cover border border-border ${!isOpen ? "grayscale" : ""}`} />
//             </div>

//             <div className="space-y-1">
//                 <div className="flex justify-between items-start">
//                     <h3 className="font-bold text-lg text-card-foreground line-clamp-1 group-hover:text-primary transition-colors">
//                         {shop.shopName}
//                     </h3>
//                     <div className="flex items-center gap-1 text-xs font-semibold bg-secondary px-2 py-1 rounded">
//                         <Star className="h-3 w-3 text-orange-400 fill-orange-400" />
//                         <span>4.8</span>
//                     </div>
//                 </div>

//                 <p className="text-sm text-muted-foreground font-medium">
//                     {shop.shopType} 
//                     {isOpen && <span className="text-[10px] ml-2 text-green-600 font-normal">• Closes {shop.closingTime}</span>}
//                     {!isOpen && <span className="text-[10px] ml-2 text-red-500 font-normal">• Opens {shop.openingTime}</span>}
//                 </p>
//                 <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5em]">
//                     {shop.shopDescription || "No description provided."}
//                 </p>

//                 <div className="pt-4 mt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
//                     <div className="flex items-center gap-1">
//                         {distance ? (
//                            <span className="text-green-600 font-bold flex items-center gap-1">
//                                <MapPin className="h-3 w-3" /> Delivers to you
//                            </span>
//                         ) : (
//                            <>
//                                <MapPin className="h-3 w-3" />
//                                <span>{shop.deliveryRadius}km Radius</span>
//                            </>
//                         )}
//                     </div>
//                     <div>Min Order: Rs. 0</div>
//                 </div>
//             </div>
//         </div>
//       </div>
//     </Link>
//   );
// }
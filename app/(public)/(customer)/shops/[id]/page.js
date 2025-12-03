"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Search, MapPin, Star, Clock, ShoppingBag, Plus, Minus } from "lucide-react";
import { toast } from "sonner"; // For notifications
import Link from "next/link";

// 1. IMPORT GLOBAL CART CONTEXT
import { useCart } from "@/context/cartContext";

// ShadCN UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function SingleShopPage() {
  const params = useParams(); // Get shop ID from URL
  
  // 2. USE GLOBAL CART HOOK (Replaces local state)
  const { cart: globalCart, addToCart, updateQuantity } = useCart();
  
  // -- State Management --
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Filters
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // -- 1. Fetch Data --
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/customer/shops/${params.id}`);
        const data = await res.json();
        
        if (data.success) {
          setShop(data.shop);
          setProducts(data.products);
          setCategories(["All", ...data.categories]);
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

  // -- 2. Filtering Logic --
  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // 3. HELPER: Get Quantity from Global Cart
  const getItemQuantity = (productId) => {
    // If the cart belongs to a different shop, the quantity for this shop is 0
    if (globalCart.shopId && globalCart.shopId !== params.id) return 0;
    
    const item = globalCart.items.find((i) => i.productId === productId);
    return item ? item.quantity : 0;
  };

  // 4. Calculate Total Items (Using Global Cart)
  const totalItems = globalCart.shopId === params.id 
    ? globalCart.items.reduce((a, b) => a + b.quantity, 0)
    : 0;

  // -- Render Loading State --
  if (loading) return <ShopSkeleton />;
  if (!shop) return <div className="text-center py-20 font-bold">Shop not found.</div>;

  return (
    <div className="min-h-screen bg-background pb-24">
      
      {/* --- SECTION 1: Immersive Header --- */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        {/* Background Cover Image */}
        <div className="absolute inset-0">
          <img 
            src={shop.shopBanner || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80"} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay for Text Readability */}
          {/* Fixed typo: bg-linear-to-t -> bg-gradient-to-t */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        {/* Shop Info Card */}
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-6">
          <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
            
            {/* Logo */}
            <div className="h-24 w-24 md:h-32 md:w-32 rounded-2xl border-4 border-background bg-white shadow-xl overflow-hidden shrink-0">
               <img 
                 src={shop.shopLogo || "https://via.placeholder.com/150"} 
                 alt="Logo" 
                 className="w-full h-full object-cover" 
               />
            </div>

            {/* Text Details */}
            <div className="flex-1 space-y-2 mb-1">
              <div className="flex items-center gap-3">
                 <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight drop-shadow-sm">
                   {shop.shopName}
                 </h1>
                 <Badge className={shop.isShopOpen ? "bg-green-600 hover:bg-green-600" : "bg-destructive"}>
                   {shop.isShopOpen ? "Open Now" : "Closed"}
                 </Badge>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base font-medium text-foreground/90">
                 <div className="flex items-center gap-1">
                   <Star className="h-4 w-4 text-orange-500 fill-orange-500" />
                   <span>4.8 (120+ ratings)</span>
                 </div>
                 <div className="flex items-center gap-1">
                   <Clock className="h-4 w-4" />
                   <span>15-25 min</span>
                 </div>
                 <div className="flex items-center gap-1">
                   <MapPin className="h-4 w-4" />
                   <span>{shop.deliveryRadius}km delivery</span>
                 </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1 max-w-2xl">
                {shop.shopDescription || "No description provided."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION 2: Sticky Menu Bar --- */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          
          {/* Categories (Horizontal Scroll) */}
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

          {/* Desktop Search Bar */}
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

      {/* --- SECTION 3: Products Grid --- */}
      <div className="container mx-auto px-4 py-8">
        
        {/* Mobile Search Input */}
        <div className="md:hidden mb-6 relative">
             <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
             <Input 
               placeholder="Search items..." 
               className="pl-9 bg-muted/50 rounded-lg" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left Sidebar (Desktop Menu) */}
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

          {/* Main Content Area */}
          <div className="col-span-1 md:col-span-9 lg:col-span-10">
             
             {/* Section Heading */}
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-xl font-bold">{activeCategory} Items</h2>
               <Badge variant="outline">{filteredProducts.length} items</Badge>
             </div>

             {/* Products List */}
             {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard 
                      key={product._id} 
                      product={product} 
                      
                      // 5. Connect Global Actions
                      quantity={getItemQuantity(product._id)}
                      onAdd={() => addToCart(product, shop)} // Pass 'shop' object!
                      onRemove={() => updateQuantity(product._id, -1)}
                    />
                  ))}
                </div>
             ) : (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                   <ShoppingBag className="h-10 w-10 mb-2 opacity-50" />
                   <p>No items found in this category.</p>
                </div>
             )}
          </div>
        </div>
      </div>
      
      {/* --- SECTION 4: Floating Cart Button --- */}
      {/* Only visible if cart has items */}
      {totalItems > 0 && (
         <div className="fixed bottom-6 left-0 right-0 px-4 z-50 flex justify-center animate-in slide-in-from-bottom-10 fade-in duration-500">
            <Link href="/checkout" className="w-full max-w-md">
                <Button 
                  size="lg" 
                  className="w-full shadow-2xl rounded-full h-14 text-base flex justify-between px-6 bg-primary hover:bg-primary/90 text-primary-foreground transform hover:scale-[1.02] transition-transform"
                >
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

// --- SUB-COMPONENT: Product Card ---
function ProductCard({ product, quantity, onAdd, onRemove }) {
  // Safe Image Fallback
  const imageSrc = product.image || product.imageUrl || "https://placehold.co/400x300/f1f5f9/94a3b8?text=No+Image";

  return (
    <div className="group bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
      {/* Image Area */}
      <div className="relative h-40 w-full bg-muted overflow-hidden">
        <img 
          src={imageSrc} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Quantity Badge on Image */}
        {quantity > 0 && (
           <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
             x{quantity}
           </div>
        )}
      </div>

      {/* Details Area */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
           <div className="flex justify-between items-start">
              <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
           </div>
           <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
             {product.description || "Fresh and best quality product."}
           </p>
        </div>
        
        {/* Price & Action */}
        <div className="mt-4 flex items-center justify-between">
           <p className="font-bold text-lg text-foreground">Rs. {product.price}</p>
           
           {/* Add Button OR Counter */}
           {quantity === 0 ? (
             <Button 
               size="sm" 
               variant="outline" 
               className="h-8 rounded-full border-primary/50 text-primary hover:bg-primary hover:text-white transition-colors"
               onClick={onAdd}
             >
               Add
             </Button>
           ) : (
             <div className="flex items-center gap-2 bg-primary/10 rounded-full p-1 border border-primary/20">
                <button 
                  onClick={onRemove}
                  className="h-6 w-6 rounded-full bg-background text-primary flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="text-sm font-bold w-4 text-center tabular-nums">{quantity}</span>
                <button 
                  onClick={onAdd}
                  className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
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

// --- SUB-COMPONENT: Loading Skeleton ---
function ShopSkeleton() {
  return (
    <div className="space-y-6 container mx-auto px-4 py-8">
       {/* Banner Skeleton */}
       <Skeleton className="h-64 w-full rounded-xl" />
       
       {/* Info Skeleton */}
       <div className="flex gap-4">
         <Skeleton className="h-32 w-32 rounded-xl shrink-0" />
         <div className="space-y-2 flex-1 pt-8">
           <Skeleton className="h-8 w-1/2" />
           <Skeleton className="h-4 w-1/3" />
         </div>
       </div>

       {/* Grid Skeleton */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
         {[1,2,3,4,5,6].map(i => (
            <div key={i} className="space-y-2">
               <Skeleton className="h-40 w-full rounded-xl" />
               <Skeleton className="h-4 w-3/4" />
               <Skeleton className="h-4 w-1/2" />
            </div>
         ))}
       </div>
    </div>
  )
}
// "use client";
// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import { Search, MapPin, Star, Clock, ShoppingBag, Plus, Minus } from "lucide-react";
// import { toast } from "sonner"; // For notifications
// import Link from "next/link";
// // ShadCN UI Components
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// export default function SingleShopPage() {
//   const params = useParams(); // Get shop ID from URL
  
//   // -- State Management --
//   const [loading, setLoading] = useState(true);
//   const [shop, setShop] = useState(null);
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
  
//   // Filters
//   const [activeCategory, setActiveCategory] = useState("All");
//   const [searchQuery, setSearchQuery] = useState("");

//   // Cart: Stores { "product_id_123": 2, "product_id_456": 1 }
//   const [cart, setCart] = useState({}); 

//   // -- 1. Fetch Data --
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await fetch(`/api/customer/shops/${params.id}`);
//         const data = await res.json();
        
//         if (data.success) {
//           setShop(data.shop);
//           setProducts(data.products);
//           setCategories(["All", ...data.categories]);
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

//   // -- 2. Filtering Logic --
//   const filteredProducts = products.filter((p) => {
//     const matchesCategory = activeCategory === "All" || p.category === activeCategory;
//     const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });

//   // -- 3. Cart Handlers --
//   const addToCart = (product) => {
//     setCart((prev) => ({
//       ...prev,
//       [product._id]: (prev[product._id] || 0) + 1,
//     }));
//     toast.success(`Added ${product.name}`);
//   };

//   const removeFromCart = (productId) => {
//     setCart((prev) => {
//       const currentQty = prev[productId] || 0;
//       if (currentQty <= 1) {
//         // Remove item completely if qty reaches 0
//         const newState = { ...prev };
//         delete newState[productId];
//         return newState;
//       }
//       return { ...prev, [productId]: currentQty - 1 };
//     });
//   };

//   // Calculate Cart Totals
//   const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

//   // -- Render Loading State --
//   if (loading) return <ShopSkeleton />;
//   if (!shop) return <div className="text-center py-20 font-bold">Shop not found.</div>;

//   return (
//     <div className="min-h-screen bg-background pb-24">
      
//       {/* --- SECTION 1: Immersive Header --- */}
//       <div className="relative h-64 md:h-80 w-full overflow-hidden">
//         {/* Background Cover Image */}
//         <div className="absolute inset-0">
//           <img 
//             src={shop.shopBanner || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80"} 
//             alt="Cover" 
//             className="w-full h-full object-cover"
//           />
//           {/* Gradient Overlay for Text Readability */}
//           <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
//         </div>

//         {/* Shop Info Card */}
//         <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-6">
//           <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
            
//             {/* Logo */}
//             <div className="h-24 w-24 md:h-32 md:w-32 rounded-2xl border-4 border-background bg-white shadow-xl overflow-hidden shrink-0">
//                <img 
//                  src={shop.shopLogo || "https://via.placeholder.com/150"} 
//                  alt="Logo" 
//                  className="w-full h-full object-cover" 
//                />
//             </div>

//             {/* Text Details */}
//             <div className="flex-1 space-y-2 mb-1">
//               <div className="flex items-center gap-3">
//                  <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight drop-shadow-sm">
//                    {shop.shopName}
//                  </h1>
//                  <Badge className={shop.isShopOpen ? "bg-green-600 hover:bg-green-600" : "bg-destructive"}>
//                    {shop.isShopOpen ? "Open Now" : "Closed"}
//                  </Badge>
//               </div>
              
//               <div className="flex flex-wrap items-center gap-4 text-sm md:text-base font-medium text-foreground/90">
//                  <div className="flex items-center gap-1">
//                    <Star className="h-4 w-4 text-orange-500 fill-orange-500" />
//                    <span>4.8 (120+ ratings)</span>
//                  </div>
//                  <div className="flex items-center gap-1">
//                    <Clock className="h-4 w-4" />
//                    <span>15-25 min</span>
//                  </div>
//                  <div className="flex items-center gap-1">
//                    <MapPin className="h-4 w-4" />
//                    <span>{shop.deliveryRadius}km delivery</span>
//                  </div>
//               </div>
//               <p className="text-sm text-muted-foreground line-clamp-1 max-w-2xl">
//                 {shop.shopDescription || "No description provided."}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* --- SECTION 2: Sticky Menu Bar --- */}
//       <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
//         <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          
//           {/* Categories (Horizontal Scroll) */}
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

//           {/* Desktop Search Bar */}
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

//       {/* --- SECTION 3: Products Grid --- */}
//       <div className="container mx-auto px-4 py-8">
        
//         {/* Mobile Search Input */}
//         <div className="md:hidden mb-6 relative">
//              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//              <Input 
//                placeholder="Search items..." 
//                className="pl-9 bg-muted/50 rounded-lg" 
//                value={searchQuery}
//                onChange={(e) => setSearchQuery(e.target.value)}
//              />
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
//           {/* Left Sidebar (Desktop Menu) */}
//           <div className="hidden md:block col-span-3 lg:col-span-2 space-y-1 sticky top-24 h-fit">
//              <h3 className="font-bold text-lg mb-4 px-2">Menu</h3>
//              {categories.map((cat) => (
//                 <button
//                   key={cat}
//                   onClick={() => setActiveCategory(cat)}
//                   className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
//                      activeCategory === cat 
//                       ? "bg-primary/10 text-primary font-bold border-l-4 border-primary" 
//                       : "text-muted-foreground hover:bg-muted"
//                   }`}
//                 >
//                   {cat}
//                 </button>
//              ))}
//           </div>

//           {/* Main Content Area */}
//           <div className="col-span-1 md:col-span-9 lg:col-span-10">
             
//              {/* Section Heading */}
//              <div className="flex items-center justify-between mb-6">
//                <h2 className="text-xl font-bold">{activeCategory} Items</h2>
//                <Badge variant="outline">{filteredProducts.length} items</Badge>
//              </div>

//              {/* Products List */}
//              {filteredProducts.length > 0 ? (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                   {filteredProducts.map((product) => (
//                     <ProductCard 
//                       key={product._id} 
//                       product={product} 
//                       quantity={cart[product._id] || 0}
//                       onAdd={() => addToCart(product)}
//                       onRemove={() => removeFromCart(product._id)}
//                     />
//                   ))}
//                 </div>
//              ) : (
//                 <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-xl">
//                    <ShoppingBag className="h-10 w-10 mb-2 opacity-50" />
//                    <p>No items found in this category.</p>
//                 </div>
//              )}
//           </div>
//         </div>
//       </div>
      
//       {/* --- SECTION 4: Floating Cart Button --- */}
//       {/* Only visible if cart has items */}
//      {totalItems > 0 && (
//          <div className="fixed bottom-6 left-0 right-0 px-4 z-50 flex justify-center animate-in slide-in-from-bottom-10 fade-in duration-500">
//             {/* INTEGRATION: Wrapped in Link to Navigate to Checkout */}
//             <Link href="/checkout" className="w-full max-w-md">
//                 <Button 
//                   size="lg" 
//                   className="w-full shadow-2xl rounded-full h-14 text-base flex justify-between px-6 bg-primary hover:bg-primary/90 text-primary-foreground transform hover:scale-[1.02] transition-transform"
//                 >
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

// // --- SUB-COMPONENT: Product Card ---
// function ProductCard({ product, quantity, onAdd, onRemove }) {
//   // Safe Image Fallback
//   const imageSrc = product.image && product.image.length > 0 
//     ? product.image 
//     : "https://placehold.co/400x300/f1f5f9/94a3b8?text=No+Image";

//   return (
//     <div className="group bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
//       {/* Image Area */}
//       <div className="relative h-40 w-full bg-muted overflow-hidden">
//         <img 
//           src={imageSrc} 
//           alt={product.name} 
//           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//         />
//         {/* Quantity Badge on Image */}
//         {quantity > 0 && (
//            <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
//              x{quantity}
//            </div>
//         )}
//       </div>

//       {/* Details Area */}
//       <div className="p-4 flex flex-col flex-1">
//         <div className="flex-1">
//            <div className="flex justify-between items-start">
//               <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
//            </div>
//            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
//              {product.description || "Fresh and best quality product."}
//            </p>
//         </div>
        
//         {/* Price & Action */}
//         <div className="mt-4 flex items-center justify-between">
//            <p className="font-bold text-lg text-foreground">Rs. {product.price}</p>
           
//            {/* Add Button OR Counter */}
//            {quantity === 0 ? (
//              <Button 
//                size="sm" 
//                variant="outline" 
//                className="h-8 rounded-full border-primary/50 text-primary hover:bg-primary hover:text-white transition-colors"
//                onClick={onAdd}
//              >
//                Add
//              </Button>
//            ) : (
//              <div className="flex items-center gap-2 bg-primary/10 rounded-full p-1 border border-primary/20">
//                 <button 
//                   onClick={onRemove}
//                   className="h-6 w-6 rounded-full bg-background text-primary flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
//                 >
//                   <Minus className="h-3 w-3" />
//                 </button>
//                 <span className="text-sm font-bold w-4 text-center tabular-nums">{quantity}</span>
//                 <button 
//                   onClick={onAdd}
//                   className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
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

// // --- SUB-COMPONENT: Loading Skeleton ---
// function ShopSkeleton() {
//   return (
//     <div className="space-y-6 container mx-auto px-4 py-8">
//        {/* Banner Skeleton */}
//        <Skeleton className="h-64 w-full rounded-xl" />
       
//        {/* Info Skeleton */}
//        <div className="flex gap-4">
//          <Skeleton className="h-32 w-32 rounded-xl shrink-0" />
//          <div className="space-y-2 flex-1 pt-8">
//            <Skeleton className="h-8 w-1/2" />
//            <Skeleton className="h-4 w-1/3" />
//          </div>
//        </div>

//        {/* Grid Skeleton */}
//        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
//          {[1,2,3,4,5,6].map(i => (
//             <div key={i} className="space-y-2">
//                <Skeleton className="h-40 w-full rounded-xl" />
//                <Skeleton className="h-4 w-3/4" />
//                <Skeleton className="h-4 w-1/2" />
//             </div>
//          ))}
//        </div>
//     </div>
//   )
// }
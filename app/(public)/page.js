// "use client";
// import Image from "next/image";
// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { 
//   Store, BookText, ShoppingCart, Search, CreditCard, History,
//   ArrowRight, CheckCircle2, Zap, LayoutDashboard, Loader2, MapPin
// } from 'lucide-react'; 
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge'; 
// import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

// // --- Main App Component ---
// export default function LandingPage() {
//   return (
//     <div className="font-sans antialiased text-foreground bg-background flex flex-col min-h-screen selection:bg-primary/20 selection:text-primary">
//       <main className="grow">
//         <HeroSection />
//         <StatsSection />
//         <FeaturesSection />
//         <ExploreStoresSection />
//         <TestimonialsSection />
//         <CallToActionSection />
//       </main>
//     </div>
//   );
// }

// // --- 1. Hero Section (Links Updated) ---
// function HeroSection() {
//   return (
//     <section className="relative pt-20 pb-32 md:pt-8 md:pb-24 overflow-hidden">
//       {/* Background Pattern */}
//       <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-slate-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px]">
//         <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
//       </div>

//       <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
//         <div className="flex flex-col lg:flex-row items-center gap-12 text-center lg:text-left">
          
//           {/* Text Content */}
//           <div className="lg:w-1/2 space-y-8 animate-in slide-in-from-bottom-5 duration-700 fade-in">
//              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
//                 <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
//                 The #1 Marketplace for Locals
//              </div>
             
//             <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
//               Digitize Your <br />
//               <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-purple-500 to-pink-500">
//                 Local Business.
//               </span>
//             </h1>
            
//             <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
//               Accept orders, manage your <strong>Khata</strong>, and run your <strong>POS</strong>—all from one dashboard. Connect with your neighborhood like never before.
//             </p>

//             <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
//               <Button asChild size="lg" className="h-12 px-8 text-lg shadow-lg shadow-primary/25 transition-transform hover:scale-105" >
//                 <Link href="/seller/register">Start Selling Now</Link>
//               </Button>
//               <Button asChild size="lg" variant="outline" className="h-12 px-8 text-lg border-primary/20 bg-background/50 backdrop-blur-sm hover:bg-primary/5">
//                 <Link href="/shops">Find Nearby Stores</Link>
//               </Button>
//             </div>
            
//             <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground">
//                 <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Free 14-day trial</div>
//                 <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> No credit card required</div>
//             </div>
//           </div>

//           {/* Visual Element */}
//           {/* Visual Element */}
//           <div className="lg:w-1/2 relative animate-in slide-in-from-right-10 duration-1000 fade-in">
//              <div className="relative mx-auto w-full max-w-[500px]">
//                 {/* Background Blobs */}
//                 <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob"></div>
//                 <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob animation-delay-2000"></div>
                
//                 {/* Main Card Container */}
//                 <div className="relative rounded-2xl border bg-background/50 backdrop-blur-xl shadow-2xl overflow-hidden transform rotate-2 hover:rotate-0 transition-all duration-500">
                   
//                    {/* FIXES APPLIED:
//                       1. Removed the <div className="h-[300px]..."> wrapper which caused the empty space.
//                       2. Used <Image /> component for optimization.
//                       3. Used "w-full h-auto" to make it fit perfectly without gaps.
//                    */}
//                    <Image 
//                       src="/assets/dashboard-pic2.png" 
//                       alt="ShopSync Dashboard Preview" 
//                       width={600} 
//                       height={400} 
//                       className="w-full h-auto object-cover"
//                       priority // Loads immediately since it's above the fold
//                    />
                   
//                    {/* Floating Badges */}
//                    <div className="absolute -left-6 top-10 bg-card p-3 rounded-lg shadow-xl border border-border flex items-center gap-3 animate-bounce duration-3000">
//                       <div className="bg-green-100 p-2 rounded-full"><Zap className="h-5 w-5 text-green-600" /></div>
//                       <div><p className="text-xs text-muted-foreground font-bold">New Order</p><p className="text-sm font-bold text-foreground">Rs. 1,250</p></div>
//                    </div>
//                    <div className="absolute -right-6 bottom-10 bg-card p-3 rounded-lg shadow-xl border border-border flex items-center gap-3 animate-bounce duration-4000">
//                       <div className="bg-blue-100 p-2 rounded-full"><LayoutDashboard className="h-5 w-5 text-blue-600" /></div>
//                       <div><p className="text-xs text-muted-foreground font-bold">Khata Updated</p><p className="text-sm font-bold text-foreground">Balance: 0</p></div>
//                    </div>
//                 </div>
//              </div>
//           </div>
          

//         </div>
//       </div>
//     </section>
//   );
// }

// // --- 2. Stats Section ---
// function StatsSection() {
//     return (
//         <section className="border-y border-border bg-muted/30 py-10">
//             <div className="container mx-auto px-4">
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
//                     {[
//                         { label: "Active Vendors", value: "500+" },
//                         { label: "Daily Orders", value: "2.5k" },
//                         { label: "Cities Covered", value: "12" },
//                         { label: "Happy Customers", value: "10k+" },
//                     ].map((stat, i) => (
//                         <div key={i} className="space-y-1">
//                             <h3 className="text-3xl md:text-4xl font-bold text-foreground">{stat.value}</h3>
//                             <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </section>
//     )
// }

// // --- 3. Features Section ---
// function FeaturesSection() {
//   const [activeTab, setActiveTab] = useState('sellers');

//   const sellerFeatures = [
//     { icon: <Store className="h-6 w-6 text-white" />, color: "bg-blue-500", title: "Digital Storefront", description: "Create a beautiful online store in minutes. No coding required." },
//     { icon: <BookText className="h-6 w-6 text-white" />, color: "bg-purple-500", title: "Khata Management", description: "Ditch the paper. Track all your customer credit (udhaar) digitally." },
//     { icon: <ShoppingCart className="h-6 w-6 text-white" />, color: "bg-pink-500", title: "Offline POS", description: "Manage your in-store sales and inventory with our simple checkout system." }
//   ];

//   const customerFeatures = [
//     { icon: <Search className="h-6 w-6 text-white" />, color: "bg-indigo-500", title: "Discover Local", description: "Find and shop from your favorite neighborhood stores online." },
//     { icon: <CreditCard className="h-6 w-6 text-white" />, color: "bg-emerald-500", title: "Easy Payments", description: "Pay securely with cash, card, or browse products from home." },
//     { icon: <History className="h-6 w-6 text-white" />, color: "bg-orange-500", title: "Order History", description: "Keep track of all your purchases from local stores, all in one place." }
//   ];

//   return (
//     <section className="py-24 bg-background relative">
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="text-center max-w-3xl mx-auto mb-16">
//             <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
//             One Platform. <br/> <span className="text-primary">Infinite Possibilities.</span>
//             </h2>
//             <p className="text-lg text-muted-foreground">
//             Whether you are buying groceries or selling electronics, we have built the tools to make it seamless.
//             </p>
//         </div>
        
//         <div className="flex justify-center mb-12">
//             <div className="inline-flex p-1 bg-muted rounded-xl border border-border">
//                 {['sellers', 'customers'].map((tab) => (
//                     <button
//                         key={tab}
//                         onClick={() => setActiveTab(tab)}
//                         className={`px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-300 capitalize ${
//                             activeTab === tab 
//                             ? 'bg-background text-foreground shadow-md scale-105' 
//                             : 'text-muted-foreground hover:text-foreground'
//                         }`}
//                     >
//                         For {tab}
//                     </button>
//                 ))}
//             </div>
//         </div>

//         <div className="grid md:grid-cols-3 gap-8">
//           {(activeTab === 'sellers' ? sellerFeatures : customerFeatures).map((feature, i) => (
//             <div key={i} className="group relative bg-card hover:bg-muted/50 p-8 rounded-2xl border border-border transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
//               <div className={`h-14 w-14 ${feature.color} rounded-xl flex items-center justify-center mb-6 shadow-lg transform group-hover:rotate-6 transition-transform`}>
//                 {feature.icon}
//               </div>
//               <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
//               <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// // --- 4. Explore Stores (FULL STACK INTEGRATION) ---
// function ExploreStoresSection() {
//   const [shops, setShops] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchShops = async () => {
//         try {
//             const res = await fetch('/api/public/featured-shops');
//             const data = await res.json();
//             if (data.success) {
//                 setShops(data.shops);
//             }
//         } catch (error) {
//             console.error("Failed to load featured shops");
//         } finally {
//             setLoading(false);
//         }
//     };
//     fetchShops();
//   }, []);

//   return (
//     <section className="pt-10 pb-10 bg-secondary/20">
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex flex-col md:flex-row justify-between items-end mb-12">
//             <div>
//                 <h2 className="text-3xl font-bold text-foreground">Featured Shops</h2>
//                 <p className="text-muted-foreground mt-2">Support local businesses in your area.</p>
//             </div>
//             <Link href="/shops">
//                 <Button variant="ghost" className="text-primary gap-2 mt-4 md:mt-0">
//                     View All Shops <ArrowRight className="h-4 w-4" />
//                 </Button>
//             </Link>
//         </div>
        
//         {loading ? (
//             <div className="flex justify-center items-center py-20">
//                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
//             </div>
//         ) : shops.length === 0 ? (
//             <div className="text-center py-10 text-muted-foreground">
//                 No shops available yet. Be the first to join!
//             </div>
//         ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//             {shops.map((store, i) => (
//                 <div 
//                     key={i} 
//                     onClick={() => router.push(`/shops/${store._id}`)}
//                     className="group bg-card rounded-xl border border-border shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
//                 >
//                 <div className="relative h-48 overflow-hidden bg-muted flex items-center justify-center">
//                     <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
//                     {store.shopLogo ? (
//                         <img 
//                             src={store.shopLogo} 
//                             alt={store.shopName} 
//                             className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
//                         />
//                     ) : (
//                         <Store className="h-16 w-16 text-muted-foreground/50" />
//                     )}
//                     <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-black shadow-sm">
//                         Verified
//                     </div>
//                 </div>
//                 <div className="p-5">
//                     <h3 className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors line-clamp-1">{store.shopName}</h3>
//                     <p className="text-sm text-muted-foreground font-medium mb-4">{store.shopType}</p>
//                     <div className="w-full h-px bg-border mb-4" />
//                     <div className="flex items-center justify-between text-sm">
//                         <span className="text-green-600 font-medium">Open Now</span>
//                         <div className="flex items-center gap-1 text-muted-foreground">
//                             <MapPin className="h-3 w-3" />
//                             <span className="truncate max-w-[100px]">{store.shopAddress}</span>
//                         </div>
//                     </div>
//                 </div>
//                 </div>
//             ))}
//             </div>
//         )}
//       </div>
//     </section>
//   );
// }

// // --- 5. Testimonials Section ---
// function TestimonialsSection() {
//   const testimonials = [
//     { quote: "Managing my khata book online has saved me hours every week.", name: "Ali Ahmed", role: "Owner, Fresh Grocers" },
//     { quote: "The offline checkout is fast and my inventory is always up to date.", name: "Usman Butt", role: "Owner, City Electronics" },
//     { quote: "As a customer, I love that I can check my balance anytime.", name: "Fatima Khan", role: "Local Shopper" },
//   ];

//   return (
//     <section className="py-24 bg-background">
//       <div className="container mx-auto px-4 text-center">
//         <h2 className="text-3xl font-bold mb-16">What our Community says</h2>
//         <div className="grid md:grid-cols-3 gap-8">
//           {testimonials.map((item, i) => (
//             <div key={i} className="relative bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
//               <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground h-12 w-12 flex items-center justify-center rounded-full text-2xl shadow-lg">
//                 ❝
//               </div>
//               <p className="text-muted-foreground italic mb-6 mt-4">"{item.quote}"</p>
//               <h4 className="font-bold text-foreground">{item.name}</h4>
//               <p className="text-xs text-muted-foreground uppercase tracking-wide">{item.role}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// // --- 6. CTA Section (Links Updated) ---
// function CallToActionSection() {
//   return (
//     <section className="py-20 relative overflow-hidden bg-primary">
//         {/* Background Gradients */}
//         <div className="absolute inset-0 bg-linear-to-br from-primary via-purple-700 to-blue-700 -z-10" />
//         <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
//         <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-black/10 rounded-full blur-3xl" />

//       <div className="container mx-auto px-4 text-center text-primary-foreground relative z-10">
//         <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
//           Ready to Grow Your Business?
//         </h2>
//         <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-10">
//           Join thousands of local businesses and customers building a stronger community economy today.
//         </p>
//         <div className="flex flex-col sm:flex-row justify-center gap-4">
//           <Button asChild size="lg" variant="secondary" className="h-14 px-8 text-lg font-bold shadow-2xl text-primary hover:bg-white/40">
//             <Link href="/vendor/register">Get Started as Vendor</Link>
//           </Button>
          
//           <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg bg-transparent border-white/40 text-white hover:bg-white/20 hover:text-white">
//             <Link href="/shops">Start Shopping</Link>
//           </Button>
//         </div>
//       </div>
//     </section>
//   );
// }
"use client";
import Image from "next/image";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Store, BookText, ShoppingCart, Search, CreditCard, History,
  ArrowRight, CheckCircle2, Zap, LayoutDashboard, MapPin, Navigation
} from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; 
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

// --- Main App Component ---
export default function LandingPage() {
  return (
    <div className="font-sans antialiased text-foreground bg-background flex flex-col min-h-screen selection:bg-primary/20 selection:text-primary">
      <main className="grow">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <ExploreStoresSection />
        <TestimonialsSection />
        <CallToActionSection />
      </main>
    </div>
  );
}

// --- 1. Hero Section ---
function HeroSection() {
  return (
    <section className="relative pt-20 pb-32 md:pt-8 md:pb-24 overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-slate-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col lg:flex-row items-center gap-12 text-center lg:text-left">
          
          {/* Text Content */}
          <div className="lg:w-1/2 space-y-8 animate-in slide-in-from-bottom-5 duration-700 fade-in">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
                 <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                 The #1 Marketplace for Locals
              </div>
              
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Digitize Your <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-purple-500 to-pink-500">
                Local Business.
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Accept orders, manage your <strong>Khata</strong>, and run your <strong>POS</strong>—all from one dashboard. Connect with your neighborhood like never before.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Button asChild size="lg" className="h-12 px-8 text-lg shadow-lg shadow-primary/25 transition-transform hover:scale-105" >
                <Link href="/seller/register">Start Selling Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 text-lg border-primary/20 bg-background/50 backdrop-blur-sm hover:bg-primary/5">
                <Link href="/shops">Find Nearby Stores</Link>
              </Button>
            </div>
            
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Free 14-day trial</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> No credit card required</div>
            </div>
          </div>

          {/* Visual Element */}
          <div className="lg:w-1/2 relative animate-in slide-in-from-right-10 duration-1000 fade-in">
              <div className="relative mx-auto w-full max-w-[500px]">
                <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob"></div>
                <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob animation-delay-2000"></div>
                
                <div className="relative rounded-2xl border bg-background/50 backdrop-blur-xl shadow-2xl overflow-hidden transform rotate-2 hover:rotate-0 transition-all duration-500">
                   <Image 
                      src="/assets/dashboard-pic2.png" 
                      alt="ShopSync Dashboard Preview" 
                      width={600} 
                      height={400} 
                      className="w-full h-auto object-cover"
                      priority 
                   />
                   
                   {/* Floating Badges */}
                   <div className="absolute -left-6 top-10 bg-card p-3 rounded-lg shadow-xl border border-border flex items-center gap-3 animate-bounce duration-3000">
                      <div className="bg-green-100 p-2 rounded-full"><Zap className="h-5 w-5 text-green-600" /></div>
                      <div><p className="text-xs text-muted-foreground font-bold">New Order</p><p className="text-sm font-bold text-foreground">Rs. 1,250</p></div>
                   </div>
                   <div className="absolute -right-6 bottom-10 bg-card p-3 rounded-lg shadow-xl border border-border flex items-center gap-3 animate-bounce duration-4000">
                      <div className="bg-blue-100 p-2 rounded-full"><LayoutDashboard className="h-5 w-5 text-blue-600" /></div>
                      <div><p className="text-xs text-muted-foreground font-bold">Khata Updated</p><p className="text-sm font-bold text-foreground">Balance: 0</p></div>
                   </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- 2. Stats Section ---
function StatsSection() {
    return (
        <section className="border-y border-border bg-muted/30 py-10">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { label: "Active Vendors", value: "500+" },
                        { label: "Daily Orders", value: "2.5k" },
                        { label: "Cities Covered", value: "12" },
                        { label: "Happy Customers", value: "10k+" },
                    ].map((stat, i) => (
                        <div key={i} className="space-y-1">
                            <h3 className="text-3xl md:text-4xl font-bold text-foreground">{stat.value}</h3>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// --- 3. Features Section ---
function FeaturesSection() {
  const [activeTab, setActiveTab] = useState('sellers');

  const sellerFeatures = [
    { icon: <Store className="h-6 w-6 text-white" />, color: "bg-blue-500", title: "Digital Storefront", description: "Create a beautiful online store in minutes. No coding required." },
    { icon: <BookText className="h-6 w-6 text-white" />, color: "bg-purple-500", title: "Khata Management", description: "Ditch the paper. Track all your customer credit (udhaar) digitally." },
    { icon: <ShoppingCart className="h-6 w-6 text-white" />, color: "bg-pink-500", title: "Offline POS", description: "Manage your in-store sales and inventory with our simple checkout system." }
  ];

  const customerFeatures = [
    { icon: <Search className="h-6 w-6 text-white" />, color: "bg-indigo-500", title: "Discover Local", description: "Find and shop from your favorite neighborhood stores online." },
    { icon: <CreditCard className="h-6 w-6 text-white" />, color: "bg-emerald-500", title: "Easy Payments", description: "Pay securely with cash, card, or browse products from home." },
    { icon: <History className="h-6 w-6 text-white" />, color: "bg-orange-500", title: "Order History", description: "Keep track of all your purchases from local stores, all in one place." }
  ];

  return (
    <section className="py-24 bg-background relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            One Platform. <br/> <span className="text-primary">Infinite Possibilities.</span>
            </h2>
            <p className="text-lg text-muted-foreground">
            Whether you are buying groceries or selling electronics, we have built the tools to make it seamless.
            </p>
        </div>
        
        <div className="flex justify-center mb-12">
            <div className="inline-flex p-1 bg-muted rounded-xl border border-border">
                {['sellers', 'customers'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-300 capitalize ${
                            activeTab === tab 
                            ? 'bg-background text-foreground shadow-md scale-105' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        For {tab}
                    </button>
                ))}
            </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {(activeTab === 'sellers' ? sellerFeatures : customerFeatures).map((feature, i) => (
            <div key={i} className="group relative bg-card hover:bg-muted/50 p-8 rounded-2xl border border-border transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className={`h-14 w-14 ${feature.color} rounded-xl flex items-center justify-center mb-6 shadow-lg transform group-hover:rotate-6 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- 4. Explore Stores (UPDATED WITH MAPS & SKELETON) ---
// --- 4. Explore Stores (Smart & Beautiful) ---
function ExploreStoresSection() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const router = useRouter();

  // --- A. Helper: Time Check Logic ---
  const checkIsShopOpen = (shop) => {
    if (!shop.isShopOpen) return false; // Manual override
    if (!shop.openingTime || !shop.closingTime) return true; // No time set = Open

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [openH, openM] = shop.openingTime.split(":").map(Number);
    const [closeH, closeM] = shop.closingTime.split(":").map(Number);

    const startMinutes = openH * 60 + openM;
    const endMinutes = closeH * 60 + closeM;

    if (endMinutes > startMinutes) {
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } else {
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }
  };

  // --- B. Helper: Distance Calculation ---
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  };

  // --- C. Get Location ---
  useEffect(() => {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => console.log("Location denied")
        );
    }
  }, []);

  // --- D. Fetch, Process & Sort ---
  useEffect(() => {
    const fetchShops = async () => {
        try {
            const res = await fetch('/api/public/featured-shops');
            const data = await res.json();
            
            if (data.success) {
                let processedShops = data.shops.map(shop => {
                    // 1. Calculate Open Status
                    const isOpen = checkIsShopOpen(shop);
                    
                    // 2. Calculate Distance (if loc exists)
                    let dist = null;
                    if (userLocation && shop.shopLocation?.coordinates) {
                        const shopLat = shop.shopLocation.coordinates[1];
                        const shopLng = shop.shopLocation.coordinates[0];
                        dist = calculateDistance(userLocation.lat, userLocation.lng, shopLat, shopLng);
                    }

                    return { ...shop, isOpen, distance: dist };
                });

                // 3. Sort: Open shops first, then by distance
                processedShops.sort((a, b) => {
                    if (a.isOpen === b.isOpen) {
                        return (a.distance || 9999) - (b.distance || 9999);
                    }
                    return b.isOpen - a.isOpen; // Open shops first
                });

                setShops(processedShops);
            }
        } catch (error) {
            console.error("Failed to load featured shops");
        } finally {
            setLoading(false);
        }
    };
    fetchShops();
  }, [userLocation]); 

  return (
    <section className="pt-16 pb-24 bg-secondary/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Featured Shops</h2>
                <p className="text-muted-foreground mt-2 text-lg">
                    {userLocation ? "Top rated stores near you" : "Support local businesses in your area."}
                </p>
            </div>
            <Link href="/shops">
                <Button variant="ghost" className="text-primary gap-2 mt-4 md:mt-0 group hover:bg-primary/5">
                    View All Shops <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
            </Link>
        </div>
        
        {loading ? (
            // --- SKELETON UI ---
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden h-80">
                        <Skeleton className="h-40 w-full" />
                        <div className="p-5 space-y-3">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <div className="pt-4 flex justify-between">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-4 w-1/4" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : shops.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-2xl bg-card">
                No shops available right now.
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Slice Top 4 Items */}
            {shops.slice(0, 4).map((store, i) => (
                <div 
                    key={i} 
                    onClick={() => router.push(`/shops/${store._id}`)}
                    className={`group bg-card rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer flex flex-col h-full ${!store.isOpen ? "opacity-90" : ""}`}
                >
                {/* Image Header */}
                <div className="relative h-40 overflow-hidden bg-muted flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 z-20">
                        <Badge className={`${store.isOpen ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"} shadow-lg border-0`}>
                            {store.isOpen ? "Open" : "Closed"}
                        </Badge>
                    </div>

                    {/* Distance Badge */}
                    {store.distance && (
                        <div className="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                            <Navigation className="h-3 w-3 text-sky-400" /> {store.distance.toFixed(1)} km
                        </div>
                    )}

                    {store.shopLogo ? (
                        <img 
                            src={store.shopLogo} 
                            alt={store.shopName} 
                            className={`w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ${!store.isOpen ? "grayscale-[0.5]" : ""}`} 
                        />
                    ) : (
                        <Store className="h-16 w-16 text-muted-foreground/50" />
                    )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
                            {store.shopName}
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium">{store.shopType}</p>
                    </div>
                    
                    <div className="w-full h-px bg-border my-4" />
                    
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            <span className="truncate max-w-[140px] text-xs font-medium">{store.shopAddress || "Local Store"}</span>
                        </div>
                        {!store.isOpen && (
                            <span className="text-xs text-red-500 font-semibold">Opens {store.openingTime}</span>
                        )}
                    </div>
                </div>
                </div>
            ))}
            </div>
        )}
      </div>
    </section>
  );
}

// --- 5. Testimonials Section ---
function TestimonialsSection() {
  const testimonials = [
    { quote: "Managing my khata book online has saved me hours every week.", name: "Ali Ahmed", role: "Owner, Fresh Grocers" },
    { quote: "The offline checkout is fast and my inventory is always up to date.", name: "Usman Butt", role: "Owner, City Electronics" },
    { quote: "As a customer, I love that I can check my balance anytime.", name: "Fatima Khan", role: "Local Shopper" },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-16">What our Community says</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, i) => (
            <div key={i} className="relative bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground h-12 w-12 flex items-center justify-center rounded-full text-2xl shadow-lg">
                ❝
              </div>
              <p className="text-muted-foreground italic mb-6 mt-4">"{item.quote}"</p>
              <h4 className="font-bold text-foreground">{item.name}</h4>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{item.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- 6. CTA Section ---
function CallToActionSection() {
  return (
    <section className="py-20 relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-linear-to-br from-primary via-purple-700 to-blue-700 -z-10" />
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-black/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 text-center text-primary-foreground relative z-10">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
          Ready to Grow Your Business?
        </h2>
        <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-10">
          Join thousands of local businesses and customers building a stronger community economy today.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" variant="secondary" className="h-14 px-8 text-lg font-bold shadow-2xl text-primary hover:bg-white/40">
            <Link href="/vendor/register">Get Started as Vendor</Link>
          </Button>
          
          <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg bg-transparent border-white/40 text-white hover:bg-white/20 hover:text-white">
            <Link href="/shops">Start Shopping</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
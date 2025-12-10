"use client";
import Image from "next/image";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Store, BookText, ShoppingCart, Search, CreditCard, History,
  ArrowRight, CheckCircle2, Zap, LayoutDashboard, Loader2, MapPin
} from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; 
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

// --- 1. Hero Section (Links Updated) ---
function HeroSection() {
  return (
    <section className="relative pt-20 pb-32 md:pt-8 md:pb-24 overflow-hidden">
      {/* Background Pattern */}
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
          {/* Visual Element */}
          <div className="lg:w-1/2 relative animate-in slide-in-from-right-10 duration-1000 fade-in">
             <div className="relative mx-auto w-full max-w-[500px]">
                {/* Background Blobs */}
                <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob"></div>
                <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob animation-delay-2000"></div>
                
                {/* Main Card Container */}
                <div className="relative rounded-2xl border bg-background/50 backdrop-blur-xl shadow-2xl overflow-hidden transform rotate-2 hover:rotate-0 transition-all duration-500">
                   
                   {/* FIXES APPLIED:
                      1. Removed the <div className="h-[300px]..."> wrapper which caused the empty space.
                      2. Used <Image /> component for optimization.
                      3. Used "w-full h-auto" to make it fit perfectly without gaps.
                   */}
                   <Image 
                      src="/assets/dashboard-pic2.png" 
                      alt="ShopSync Dashboard Preview" 
                      width={600} 
                      height={400} 
                      className="w-full h-auto object-cover"
                      priority // Loads immediately since it's above the fold
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

// --- 4. Explore Stores (FULL STACK INTEGRATION) ---
function ExploreStoresSection() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchShops = async () => {
        try {
            const res = await fetch('/api/public/featured-shops');
            const data = await res.json();
            if (data.success) {
                setShops(data.shops);
            }
        } catch (error) {
            console.error("Failed to load featured shops");
        } finally {
            setLoading(false);
        }
    };
    fetchShops();
  }, []);

  return (
    <section className="pt-10 pb-10 bg-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
                <h2 className="text-3xl font-bold text-foreground">Featured Shops</h2>
                <p className="text-muted-foreground mt-2">Support local businesses in your area.</p>
            </div>
            <Link href="/shops">
                <Button variant="ghost" className="text-primary gap-2 mt-4 md:mt-0">
                    View All Shops <ArrowRight className="h-4 w-4" />
                </Button>
            </Link>
        </div>
        
        {loading ? (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : shops.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
                No shops available yet. Be the first to join!
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {shops.map((store, i) => (
                <div 
                    key={i} 
                    onClick={() => router.push(`/shops/${store._id}`)}
                    className="group bg-card rounded-xl border border-border shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
                >
                <div className="relative h-48 overflow-hidden bg-muted flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
                    {store.shopLogo ? (
                        <img 
                            src={store.shopLogo} 
                            alt={store.shopName} 
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
                        />
                    ) : (
                        <Store className="h-16 w-16 text-muted-foreground/50" />
                    )}
                    <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-black shadow-sm">
                        Verified
                    </div>
                </div>
                <div className="p-5">
                    <h3 className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors line-clamp-1">{store.shopName}</h3>
                    <p className="text-sm text-muted-foreground font-medium mb-4">{store.shopType}</p>
                    <div className="w-full h-px bg-border mb-4" />
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-green-600 font-medium">Open Now</span>
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate max-w-[100px]">{store.shopAddress}</span>
                        </div>
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

// --- 6. CTA Section (Links Updated) ---
function CallToActionSection() {
  return (
    <section className="py-20 relative overflow-hidden bg-primary">
        {/* Background Gradients */}
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
// // 
// "use client";

// import React, { useState } from 'react';
// import Link from 'next/link';
// import { 
//   Store,
//   BookText, 
//   ShoppingCart, 
//   Search, 
//   CreditCard, 
//   History,
//   Star,
//   ArrowRight,
//   CheckCircle2,
//   Zap,
//   LayoutDashboard
// } from 'lucide-react'; 
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge'; // Assuming you have ShadCN Badge

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

// // --- 1. Upgraded Hero Section with Grid Background ---
// function HeroSection() {
//   return (
//     <section className="relative pt-20 pb-32 md:pt-8 md:pb-24 overflow-hidden">
      
//       {/* BACKGROUND PATTERN: The "Fancy" Engineering Look */}
//       <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-slate-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px]">
//         <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
//       </div>

//       <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
//         <div className="flex flex-col lg:flex-row items-center gap-12 text-center lg:text-left">
          
//           {/* Left: Text Content */}
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
//                 <Link href="/vendor/register">
//                   Start Selling Now
//                 </Link>
//               </Button>
//               <Button size="lg" variant="outline" className="h-12 px-8 text-lg border-primary/20 bg-background/50 backdrop-blur-sm hover:bg-primary/5">
//                 Find Nearby Stores
//               </Button>
//             </div>
            
//             <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground">
//                 <div className="flex items-center gap-2">
//                     <CheckCircle2 className="h-4 w-4 text-green-500" /> Free 14-day trial
//                 </div>
//                 <div className="flex items-center gap-2">
//                     <CheckCircle2 className="h-4 w-4 text-green-500" /> No credit card required
//                 </div>
//             </div>
//           </div>

//           {/* Right: Visual Element (Floating Mockup) */}
//           <div className="lg:w-1/2 relative animate-in slide-in-from-right-10 duration-1000 fade-in">
//              <div className="relative mx-auto w-full max-w-[500px]">
//                 {/* Background Blob for depth */}
//                 <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob"></div>
//                 <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob animation-delay-2000"></div>
                
//                 {/* Main Card Image */}
//                 <div className="relative rounded-2xl border bg-background/50 backdrop-blur-xl shadow-2xl overflow-hidden transform rotate-2 hover:rotate-0 transition-all duration-500">
//                    <img 
//                      src="/assets/dashboard-pic.png" 
//                      alt="App Dashboard" 
//                      className="w-full h-auto"
//                    />
                   
                   
//                    {/* Floating Badge 1 */}
//                    <div className="absolute -left-6 top-10 bg-card p-3 rounded-lg shadow-xl border border-border flex items-center gap-3 animate-bounce duration-3000">
//                       <div className="bg-green-100 p-2 rounded-full">
//                         <Zap className="h-5 w-5 text-green-600" />
//                       </div>
//                       <div>
//                          <p className="text-xs text-muted-foreground font-bold">New Order</p>
//                          <p className="text-sm font-bold text-foreground">Rs. 1,250</p>
//                       </div>
//                    </div>

//                    {/* Floating Badge 2 */}
//                    <div className="absolute -right-6 bottom-10 bg-card p-3 rounded-lg shadow-xl border border-border flex items-center gap-3 animate-bounce duration-4000">
//                       <div className="bg-blue-100 p-2 rounded-full">
//                         <LayoutDashboard className="h-5 w-5 text-blue-600" />
//                       </div>
//                       <div>
//                          <p className="text-xs text-muted-foreground font-bold">Khata Updated</p>
//                          <p className="text-sm font-bold text-foreground">Balance: 0</p>
//                       </div>
//                    </div>
//                 </div>
//              </div>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// }

// // --- 2. Stats Section (Social Proof) ---
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

// // --- 3. Features with Gradient Tabs ---
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
        
//         {/* Toggle */}
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

//         {/* Grid */}
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

// // --- 4. Explore Stores with Image Cards ---
// function ExploreStoresSection() {
//   const stores = [
//     { name: "City Electronics", category: "Electronics", img: "https://placehold.co/400x300/1e293b/ffffff?text=Electronics" },
//     { name: "Fresh Grocers", category: "Grocery", img: "https://placehold.co/400x300/064e3b/ffffff?text=Fresh+Veg" },
//     { name: "Modern Fashions", category: "Apparel", img: "https://placehold.co/400x300/831843/ffffff?text=Fashion" },
//     { name: "Punjab Pharmacy", category: "Health", img: "https://placehold.co/400x300/14532d/ffffff?text=Pharmacy" }
//   ];

//   return (
//     <section className="pt-24 pb-12 bg-secondary/20">
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex flex-col md:flex-row justify-between items-end mb-12">
//             <div>
//                 <h2 className="text-3xl font-bold text-foreground">Featured Shops</h2>
//                 <p className="text-muted-foreground mt-2">Support local businesses in your area.</p>
//             </div>
//             <Button variant="ghost" className="text-primary gap-2 mt-4 md:mt-0">
//                 View All Shops <ArrowRight className="h-4 w-4" />
//             </Button>
//         </div>
        
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {stores.map((store, i) => (
//             <div key={i} className="group bg-card rounded-xl border border-border shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer">
//               <div className="relative h-48 overflow-hidden">
//                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
//                  <img 
//                     src={store.img} 
//                     alt={store.name} 
//                     className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
//                  />
//                  <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-black shadow-sm">
//                     4.8 ★
//                  </div>
//               </div>
//               <div className="p-5">
//                 <h3 className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors">{store.name}</h3>
//                 <p className="text-sm text-muted-foreground font-medium mb-4">{store.category}</p>
//                 <div className="w-full h-px bg-border mb-4" />
//                 <div className="flex items-center justify-between text-sm">
//                     <span className="text-green-600 font-medium">Open Now</span>
//                     <span className="text-muted-foreground">1.2 km away</span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
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
//               {/* Quote Icon */}
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

// // --- 6. CTA Section ---
// // --- 6. CTA Section ---
// function CallToActionSection() {
//   return (
//     // Added 'bg-primary' as a fallback color in case the gradient fails
//     <section className="py-20 relative overflow-hidden bg-primary">
        
//         {/* Gradient Background */}
//         {/* FIX: Changed 'bg-linear-to-br' to 'bg-gradient-to-br' */}
//         <div className="absolute inset-0 bg-linear-to-br from-primary via-purple-700 to-blue-700 -z-10" />
        
//         {/* Decorative Circles */}
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
//           <Button size="lg" variant="secondary" className="h-14 px-8 text-lg font-bold shadow-2xl text-primary hover:bg-white/20">
//             Get Started as Vendor
//           </Button>
          
//           {/* Adjusted button styles to ensure visibility */}
//           <Button 
//             size="lg" 
//             variant="outline" 
//             className="h-14 px-8 text-lg bg-transparent border-white/40 text-white hover:bg-white/20 hover:text-white"
//           >
//             Start Shopping
//           </Button>
//         </div>
//       </div>
//     </section>
//   );
// }
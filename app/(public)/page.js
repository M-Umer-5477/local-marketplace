
"use client";
import Image from "next/image";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAddress } from "@/context/addressContext"; // ✅ IMPORT GLOBAL ADDRESS
import {
  Store, BookText, ShoppingCart, Search, CreditCard, History,
  ArrowRight, CheckCircle2, Zap, LayoutDashboard, MapPin, Navigation, LogIn, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from "@/components/ui/skeleton";
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
    <section className="relative pt-20 pb-32 md:pt-16 md:pb-32 overflow-hidden isolate">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background dark:bg-background bg-[linear-gradient(to_right,var(--color-primary)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-primary)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.04] dark:opacity-[0.06]"></div>
      <div className="absolute top-0 -z-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#F97316]/30 rounded-full blur-[120px] opacity-40"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col lg:flex-row items-center gap-12 text-center lg:text-left">

          <div className="lg:w-1/2 space-y-8 animate-in slide-in-from-bottom-5 duration-700 fade-in">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-background/50 backdrop-blur-md px-4 py-1.5 text-sm font-semibold text-primary">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse shadow-[0_0_8px_var(--color-primary)]"></span>
              The #1 Marketplace for Locals
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground leading-[1.1]">
              Digitize Your <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#F59E0B] to-[#EA580C] drop-shadow-md">
                Local Business.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground w-full max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Accept orders, manage your <strong className="text-foreground">Khata</strong>, and run your <strong className="text-foreground">POS</strong>—all from one highly-accessible dashboard.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-2">
              <Button asChild size="lg" className="h-14 px-8 rounded-full text-lg font-bold shadow-xl shadow-primary/30 transition-transform hover:scale-105" >
                <Link href="/vendor/register">Start Selling Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 rounded-full text-lg border-primary/20 bg-background/50 backdrop-blur-xl hover:bg-primary/5 transition-colors">
                <Link href="/shops">Find Nearby Stores</Link>
              </Button>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-foreground/80 font-medium">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-[#F97316]" /> Free 14-day trial</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-[#F97316]" /> No credit card required</div>
            </div>
          </div>

          <div className="lg:w-1/2 relative animate-in slide-in-from-right-10 duration-1000 fade-in">
            <div className="relative mx-auto w-full max-w-[500px]">
              <div className="absolute top-0 -right-4 w-72 h-72 bg-[#F97316]/20 rounded-full blur-3xl filter opacity-70 animate-pulse duration-3000"></div>
              <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-[#F59E0B]/20 rounded-full blur-3xl filter opacity-70 animate-pulse duration-4000 delay-1000"></div>

              <div className="relative rounded-[2rem] border border-border/50 bg-white/40 dark:bg-black/40 backdrop-blur-2xl shadow-2xl p-2 transform rotate-2 hover:rotate-0 transition-all duration-700 ease-out">
                <div className="overflow-hidden rounded-[1.5rem] border border-border/30">
                  <Image
                    src="/assets/dp.png"
                    alt="ShopSync Dashboard Preview"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-1000"
                    priority
                  />
                </div>

                <div className="absolute -left-6 top-10 bg-background/80 backdrop-blur-xl p-3.5 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 animate-bounce duration-3000">
                  <div className="bg-primary/20 p-2.5 rounded-xl"><Zap className="h-6 w-6 text-primary" /></div>
                  <div><p className="text-xs text-muted-foreground font-semibold">New Order</p><p className="text-sm font-black text-foreground">Rs. 1,250</p></div>
                </div>
                <div className="absolute -right-6 bottom-10 bg-background/80 backdrop-blur-xl p-3.5 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 animate-bounce duration-4000 delay-500 transition-all">
                  <div className="bg-accent p-2.5 rounded-xl"><LayoutDashboard className="h-6 w-6 text-primary" /></div>
                  <div><p className="text-xs text-muted-foreground font-semibold">Khata Updated</p><p className="text-sm font-black text-foreground">Balance: Rs. 0</p></div>
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
    { icon: <Store className="h-7 w-7 text-white" />, color: "bg-linear-to-br from-[#F97316] to-[#F59E0B]", shadow: "shadow-[#F97316]/30", title: "Digital Storefront", description: "Create a beautiful online store in minutes. No coding required." },
    { icon: <BookText className="h-7 w-7 text-white" />, color: "bg-linear-to-br from-[#1C1410] to-[#3B2E25]", shadow: "shadow-black/20", title: "Khata Management", description: "Ditch the paper. Track all your customer credit (udhaar) digitally." },
    { icon: <ShoppingCart className="h-7 w-7 text-white" />, color: "bg-linear-to-br from-[#F59E0B] to-[#FCD34D]", shadow: "shadow-[#F59E0B]/30", title: "Offline POS", description: "Manage your in-store sales and inventory with our simple checkout system." }
  ];

  const customerFeatures = [
    { icon: <Search className="h-7 w-7 text-white" />, color: "bg-linear-to-br from-[#F97316] to-[#F59E0B]", shadow: "shadow-[#F97316]/30", title: "Discover Local", description: "Find and shop from your favorite neighborhood stores online." },
    { icon: <CreditCard className="h-7 w-7 text-white" />, color: "bg-linear-to-br from-[#10B981] to-[#34D399]", shadow: "shadow-[#10B981]/30", title: "Easy Payments", description: "Pay securely with cash, card, or browse products from home." },
    { icon: <History className="h-7 w-7 text-white" />, color: "bg-linear-to-br from-[#F59E0B] to-[#FCD34D]", shadow: "shadow-[#F59E0B]/30", title: "Order History", description: "Keep track of all your purchases from local stores, all in one place." }
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-background isolate">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,var(--color-primary)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-[0.05] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_10%,transparent_100%)]"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6">
            One Platform. <br /> <span className="text-transparent bg-clip-text bg-linear-to-r from-[#F97316] to-[#F59E0B]">Infinite Possibilities.</span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium">
            Whether you are buying groceries or selling electronics, we have built the tools to make it seamless.
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1.5 bg-muted/50 backdrop-blur-md rounded-full shadow-inner border border-border/10">
            {['sellers', 'customers'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-500 capitalize ${activeTab === tab
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
              >
                For {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {(activeTab === 'sellers' ? sellerFeatures : customerFeatures).map((feature, i) => (
            <div key={i} className="group relative bg-card/40 backdrop-blur-xl p-8 rounded-[2rem] border border-border/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:bg-card/60 hover:border-primary/20">
              <div className={`h-16 w-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-xl ${feature.shadow} transform group-hover:-rotate-6 group-hover:scale-110 transition-all duration-500`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed font-medium">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- 4. Explore Stores (GUEST-FOCUSED WITH CLEAR CTAs) ---
function ExploreStoresSection() {
  const { data: session } = useSession();
  const { selectedAddress, loading: addressLoading } = useAddress();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ✅ UPDATED ROBUST TIME CHECK
  const checkIsShopOpen = (shop) => {
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

  useEffect(() => {
    if (addressLoading) return; // Wait for context

    const fetchShops = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/public/featured-shops');
        const data = await res.json();

        if (data.success) {
          let processedShops = data.shops.map(shop => {
            const isOpen = checkIsShopOpen(shop);
            let dist = null;

            // ✅ Calculate distance IF they have an address
            if (selectedAddress?.location?.coordinates && shop.shopLocation?.coordinates) {
              const userLat = selectedAddress.location.coordinates[1];
              const userLng = selectedAddress.location.coordinates[0];
              const shopLat = shop.shopLocation.coordinates[1];
              const shopLng = shop.shopLocation.coordinates[0];
              dist = calculateDistance(userLat, userLng, shopLat, shopLng);
            }
            return { ...shop, isOpen, distance: dist };
          });

          // ✅ UX MAGIC: If they have an address, filter strictly. 
          // If they DON'T have an address (Guest), show everything to entice them!
          if (selectedAddress) {
            processedShops = processedShops.filter(shop => shop.distance !== null && shop.distance <= (shop.deliveryRadius || 10));
          }

          // Sort: Open shops first, then by distance (if available)
          processedShops.sort((a, b) => {
            if (a.isOpen === b.isOpen) {
              return (a.distance || 9999) - (b.distance || 9999);
            }
            return b.isOpen - a.isOpen;
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
  }, [selectedAddress, addressLoading]);

  return (
    <section className="pt-16 pb-24 bg-secondary/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Guest-Focused Banner */}
        {!session && (
          <div className="mb-12 p-6 bg-linear-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-1">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Ready to Start Shopping?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Login to browse shops near you and checkout with ease.
                </p>
              </div>
              <Link href="/login">
                <Button className="gap-2 min-w-fit" size="lg">
                  <LogIn className="h-4 w-4" />
                  Login to Order
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Featured Shops</h2>
            <p className="text-muted-foreground mt-2 text-lg">
              Explore some of our top-rated local businesses
            </p>
          </div>
          <Link href="/shops">
            <Button variant="ghost" className="text-primary gap-2 mt-4 md:mt-0 group hover:bg-primary/5">
              Browse All Shops <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {loading || addressLoading ? (
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
            {selectedAddress ? "No featured shops deliver to this address right now. Try expanding your search!" : "No featured shops available right now."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {shops.slice(0, 4).map((store, i) => (
              <div
                key={i}
                className={`group bg-card rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col h-full ${!store.isOpen ? "opacity-75" : ""}`}
              >
                <div className="relative h-40 overflow-hidden bg-muted flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />

                  <div className="absolute top-3 left-3 z-20">
                    <Badge className={`${store.isOpen ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"} shadow-lg border-0`}>
                      {store.isOpen ? "Open" : "Closed"}
                    </Badge>
                  </div>

                  {store.distance !== null && (
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

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex-1 mb-4">
                    <h3 className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
                      {store.shopName}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium">{store.shopType}</p>
                  </div>

                  <div className="w-full h-px bg-border mb-4" />

                  {/* Info */}
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-4">
                    <MapPin className="h-3 w-3 text-primary shrink-0" />
                    <span className="truncate">{store.shopAddress || "Local Store"}</span>
                  </div>

                  {/* CTA Button */}
                  <Link href="/shops" className="w-full">
                    <Button className="w-full gap-2" variant="default" size="sm">
                      <Eye className="h-4 w-4" />
                      Browse Shops
                    </Button>
                  </Link>
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
    <section className="py-24 bg-muted/20 relative">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-black mb-16 text-foreground">
          What our <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-[#F59E0B]">Community</span> says
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, i) => (
            <div key={i} className="group relative bg-card p-8 rounded-3xl border border-border shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-linear-to-tr from-[#F97316] to-[#F59E0B] text-white h-14 w-14 flex items-center justify-center rounded-full text-3xl shadow-xl shadow-primary/30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                ❝
              </div>
              <p className="text-muted-foreground italic mb-6 mt-6 font-medium leading-relaxed">"{item.quote}"</p>
              <div className="w-12 h-1 bg-border mx-auto mb-4 rounded-full group-hover:bg-primary/50 transition-colors"></div>
              <h4 className="font-bold text-foreground text-lg">{item.name}</h4>
              <p className="text-xs text-primary font-bold uppercase tracking-widest mt-1">{item.role}</p>
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
    <section className="relative py-24 my-10 mx-4 sm:mx-6 lg:mx-8 overflow-hidden rounded-[3rem] border border-[#3B2E25]/10 shadow-2xl isolate">
      <div className="absolute inset-0 bg-linear-to-br from-[#1C1410] via-[#2C1C13] to-[#3B2E25] -z-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#F97316]/20 mix-blend-screen rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F59E0B]/20 mix-blend-screen rounded-full blur-[100px] animate-pulse delay-1000" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem] -z-10" />

      <div className="container mx-auto px-4 text-center text-[#FCEEE6] relative z-10">
        <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight drop-shadow-sm text-[#FFFBF7]">
          Ready to Grow Your Business?
        </h2>
        <p className="text-xl md:text-2xl text-[#FCEEE6]/80 max-w-2xl mx-auto mb-10 font-medium">
          Join thousands of local businesses and customers building a stronger community economy today.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-5">
          <Button asChild size="lg" className="h-14 px-8 text-lg font-bold shadow-2xl shadow-[#F97316]/20 text-[#2C1C13] bg-[#FFFBF7] hover:bg-[#FFF1E5] hover:scale-105 transition-all rounded-full">
            <Link href="/vendor/register">Get Started as Vendor</Link>
          </Button>

          <Button asChild size="lg" className="h-14 px-8 text-lg font-bold bg-[#36261E]/50 backdrop-blur-md border border-[#E8DCD1]/20 text-[#FFFBF7] hover:bg-[#36261E] hover:scale-105 transition-all rounded-full shadow-lg">
            <Link href="/shops">Start Shopping</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

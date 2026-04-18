
"use client";
import Image from "next/image";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import CheckoutAuthModal from "@/components/auth/CheckoutAuthModal";
import {
  Store, BookText, ShoppingCart, Search, CreditCard, History,
  ArrowRight, CheckCircle2, Zap, LayoutDashboard, MapPin,
  UserPlus, ShieldCheck, Clock, TrendingUp, Package, Star,
  ChevronRight, Smartphone, BarChart3, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- Animated Counter Hook ---
function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const numericTarget = parseInt(target.replace(/[^0-9]/g, ''));

          const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * numericTarget));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

// --- Main App Component ---
export default function LandingPage() {
  return (
    <div className="font-sans antialiased text-foreground bg-background flex flex-col min-h-screen selection:bg-primary/20 selection:text-primary">
      <main className="grow">
        <HeroSection />
        <StatsSection />
        <CustomerSection />
        <SellerSection />
        <FeaturesGrid />
        <TestimonialsSection />
        <CallToActionSection />
      </main>
    </div>
  );
}

// ============================================================
// 1. HERO — Dual-Audience Headline
// ============================================================
function HeroSection() {
  return (
    <section className="relative pt-20 pb-28 md:pt-14 md:pb-36 overflow-hidden isolate">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,var(--color-primary)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-primary)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.04] dark:opacity-[0.06]"></div>
      {/* Gradient Blobs */}
      <div className="absolute top-0 -z-10 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-[#F97316]/25 rounded-full blur-[120px] opacity-50"></div>
      <div className="absolute -bottom-20 -z-10 right-0 w-[500px] h-[300px] bg-[#F59E0B]/20 rounded-full blur-[100px] opacity-40"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-in slide-in-from-bottom-5 duration-700 fade-in">

          {/* Badge */}
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-background/50 backdrop-blur-md px-4 py-1.5 text-sm font-semibold text-primary mx-auto">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse shadow-[0_0_8px_var(--color-primary)]"></span>
            Hyper-Local Commerce for Pakistan
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-foreground leading-[1.08]">
            Your Neighborhood.
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#F59E0B] to-[#EA580C] drop-shadow-md">
              Now Online.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
            Whether you're a <strong className="text-foreground">shopper</strong> looking for nearby stores or a <strong className="text-foreground">seller</strong> ready to go digital — MartLy connects your community, instantly.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Button asChild size="lg" className="h-14 px-8 rounded-full text-lg font-bold shadow-xl shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/40 gap-2">
              <Link href="/shops">
                <ShoppingCart className="h-5 w-5" />
                Start Shopping
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 rounded-full text-lg font-bold border-primary/30 bg-background/50 backdrop-blur-xl hover:bg-primary/5 transition-all duration-300 hover:scale-105 gap-2">
              <Link href="/vendor/register">
                <Store className="h-5 w-5" />
                Open Your Store
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-foreground/70 font-medium">
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#F97316]" /> Free to get started</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#F97316]" /> No credit card needed</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#F97316]" /> Set up in minutes</div>
          </div>
        </div>

        {/* Floating Cards */}
        <div className="hidden lg:block">
          <div className="absolute left-[6%] top-[40%] bg-background/80 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 flex items-center gap-3 animate-in slide-in-from-left-10 fade-in duration-1000 delay-500">
            <div className="bg-primary/15 p-2.5 rounded-xl">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold">New Order</p>
              <p className="text-sm font-black text-foreground">Rs. 1,250</p>
            </div>
          </div>

          <div className="absolute right-[6%] top-[55%] bg-background/80 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 flex items-center gap-3 animate-in slide-in-from-right-10 fade-in duration-1000 delay-700">
            <div className="bg-green-500/15 p-2.5 rounded-xl">
              <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold">Order Delivered</p>
              <p className="text-sm font-black text-foreground">⭐ 5.0 Rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 2. STATS — Trust Bar
// ============================================================
function StatsSection() {
  const stats = [
    { label: "Local Stores", value: "500", suffix: "+" },
    { label: "Orders Fulfilled", value: "2500", suffix: "+" },
    { label: "Cities Covered", value: "12", suffix: "" },
    { label: "Satisfied Users", value: "10000", suffix: "+" },
  ];

  return (
    <section className="border-y border-border bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <StatItem key={i} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatItem({ label, value, suffix }) {
  const { count, ref } = useCountUp(value);

  // Format the count nicely
  const display = count >= 1000 ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k` : count;

  return (
    <div ref={ref} className="space-y-1.5">
      <h3 className="text-3xl md:text-4xl font-black text-foreground tabular-nums">
        {display}{suffix}
      </h3>
      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  );
}

// ============================================================
// 3. FOR SHOPPERS — "How It Works" for Customers
// ============================================================
function CustomerSection() {
  const steps = [
    {
      num: "01",
      icon: <UserPlus className="h-6 w-6" />,
      title: "Register & Set Location",
      description: "Create your free account in seconds. Add your delivery address so we only show stores that actually deliver to you.",
      color: "from-[#F97316] to-[#F59E0B]"
    },
    {
      num: "02",
      icon: <Search className="h-6 w-6" />,
      title: "Discover Nearby Shops",
      description: "Browse real local stores in your area. See their products, ratings, opening hours, and delivery radius — all at a glance.",
      color: "from-[#F59E0B] to-[#FBBF24]"
    },
    {
      num: "03",
      icon: <ShieldCheck className="h-6 w-6" />,
      title: "Order & Track Securely",
      description: "Pay with cash on delivery or online. Track your order in real-time and rate your experience when it arrives.",
      color: "from-[#EA580C] to-[#F97316]"
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-background isolate" id="for-shoppers">
      {/* Subtle dot pattern background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,var(--color-primary)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-[0.04] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_10%,transparent_100%)]"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary mb-6">
            <ShoppingCart className="h-4 w-4 mr-2" />
            For Shoppers
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-foreground mb-5 tracking-tight">
            Shop Smarter,{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#F97316] to-[#F59E0B]">
              Shop Local
            </span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium leading-relaxed">
            Skip the traffic. Order from your favorite neighborhood stores without leaving home.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="group relative">
              {/* Connector line (desktop only, not on last item) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[calc(100%-20%)] h-[2px] bg-linear-to-r from-primary/30 to-primary/5 z-0" />
              )}

              <div className="relative bg-card/50 backdrop-blur-xl rounded-[1.5rem] border border-border/60 p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 z-10 h-full">
                {/* Step number */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`h-14 w-14 rounded-2xl bg-linear-to-br ${step.color} flex items-center justify-center text-white shadow-lg transform group-hover:-rotate-6 group-hover:scale-110 transition-all duration-500`}>
                    {step.icon}
                  </div>
                  <span className="text-4xl font-black text-muted-foreground/15 group-hover:text-primary/15 transition-colors duration-500 select-none">
                    {step.num}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed font-medium text-[15px]">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <CheckoutAuthModal>
            <Button size="lg" className="h-13 px-8 rounded-full text-base font-bold shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105 gap-2">
              Create Your Free Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CheckoutAuthModal>
          <p className="text-sm text-muted-foreground mt-3 font-medium">
            No credit card required • Takes 30 seconds
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 4. FOR SELLERS — "How It Works" for Vendors
// ============================================================
function SellerSection() {
  const steps = [
    {
      num: "01",
      icon: <Store className="h-6 w-6" />,
      title: "Register Your Shop",
      description: "Fill out a simple form with your shop details, location, and products. Our admin reviews and approves you within hours.",
      color: "from-[#1C1410] to-[#3B2E25]"
    },
    {
      num: "02",
      icon: <LayoutDashboard className="h-6 w-6" />,
      title: "Manage Everything in One Place",
      description: "Products, inventory, online orders, offline POS, customer Khata — your entire business runs from a single dashboard.",
      color: "from-[#F97316] to-[#EA580C]"
    },
    {
      num: "03",
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Reach More Customers",
      description: "Your store goes live, customers in your delivery radius discover you, and orders start rolling in. Grow your business digitally.",
      color: "from-[#F59E0B] to-[#FBBF24]"
    }
  ];

  const benefits = [
    { icon: <Smartphone className="h-5 w-5" />, text: "Mobile-friendly dashboard" },
    { icon: <BarChart3 className="h-5 w-5" />, text: "Sales & performance analytics" },
    { icon: <BookText className="h-5 w-5" />, text: "Digital Khata (Udhaar tracking)" },
    { icon: <CreditCard className="h-5 w-5" />, text: "Online + Cash payments" },
    { icon: <Users className="h-5 w-5" />, text: "Customer review system" },
    { icon: <Package className="h-5 w-5" />, text: "Real-time order management" },
  ];

  return (
    <section className="py-24 bg-muted/20 relative overflow-hidden isolate" id="for-sellers">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-[#F97316]/8 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[300px] bg-[#F59E0B]/8 rounded-full blur-[100px] -z-10"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center rounded-full bg-[#1C1410]/10 dark:bg-white/10 px-4 py-1.5 text-sm font-bold text-foreground mb-6">
            <Store className="h-4 w-4 mr-2" />
            For Sellers
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-foreground mb-5 tracking-tight">
            Expand Beyond{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#F97316] to-[#F59E0B]">
              Your Counter
            </span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium leading-relaxed">
            Your physical shop is great. Now imagine reaching thousands of customers online — without the complexity.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start max-w-6xl mx-auto">
          {/* Left: Steps */}
          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={i} className="group flex gap-5 items-start">
                {/* Step icon + connector */}
                <div className="flex flex-col items-center shrink-0">
                  <div className={`h-12 w-12 rounded-xl bg-linear-to-br ${step.color} flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500`}>
                    {step.icon}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-[2px] h-12 bg-linear-to-b from-border to-transparent mt-3" />
                  )}
                </div>

                {/* Content */}
                <div className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-primary/60 uppercase tracking-widest">Step {step.num}</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300 mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed font-medium text-[15px]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Benefits Card */}
          <div className="relative">
            <div className="absolute -top-4 -right-4 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10"></div>

            <div className="bg-card/60 backdrop-blur-xl rounded-[2rem] border border-border/60 p-8 shadow-xl">
              <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Everything You Get
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border/40 hover:border-primary/20 hover:bg-primary/5 transition-all duration-300 group">
                    <div className="text-primary/70 group-hover:text-primary transition-colors duration-300 shrink-0">
                      {b.icon}
                    </div>
                    <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors duration-300">
                      {b.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Dashboard Preview */}
              {/* <div className="mt-8 rounded-xl border border-border/50 overflow-hidden bg-muted/30">
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border/40 bg-muted/50">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/70"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/70"></div>
                  <span className="text-[10px] text-muted-foreground ml-2 font-medium">vendor dashboard</span>
                </div>
                {/* <div className="p-4">
                  <Image
                    src="/assets/dp.png"
                    alt="MartLy Vendor Dashboard Preview"
                    width={600}
                    height={350}
                    className="w-full h-auto rounded-lg object-cover"
                    priority
                  />
                </div> 
            </div> */}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <Button asChild size="lg" className="h-13 px-8 rounded-full text-base font-bold shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105 gap-2">
            <Link href="/vendor/register">
              Start Selling Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-3 font-medium">
            Free to register • Get approved within hours
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 5. FEATURES GRID — Unified 6-card layout
// ============================================================
function FeaturesGrid() {
  const features = [
    {
      icon: <Store className="h-7 w-7 text-white" />,
      color: "bg-linear-to-br from-[#F97316] to-[#F59E0B]",
      shadow: "shadow-[#F97316]/30",
      title: "Digital Storefront",
      description: "Your own online shop with products, categories, and real-time availability.",
      audience: "Seller"
    },
    {
      icon: <Search className="h-7 w-7 text-white" />,
      color: "bg-linear-to-br from-[#EA580C] to-[#F97316]",
      shadow: "shadow-[#EA580C]/30",
      title: "Discover Local",
      description: "Find and shop from neighborhood stores filtered by your delivery location.",
      audience: "Shopper"
    },
    {
      icon: <BookText className="h-7 w-7 text-white" />,
      color: "bg-linear-to-br from-[#1C1410] to-[#3B2E25]",
      shadow: "shadow-black/20",
      title: "Khata Management",
      description: "Track customer credit (Udhaar) digitally. No more paper khata books.",
      audience: "Seller"
    },
    {
      icon: <ShieldCheck className="h-7 w-7 text-white" />,
      color: "bg-linear-to-br from-[#10B981] to-[#34D399]",
      shadow: "shadow-[#10B981]/30",
      title: "Secure Payments",
      description: "Pay with confidence via online payment or cash on delivery.",
      audience: "Shopper"
    },
    {
      icon: <ShoppingCart className="h-7 w-7 text-white" />,
      color: "bg-linear-to-br from-[#F59E0B] to-[#FCD34D]",
      shadow: "shadow-[#F59E0B]/30",
      title: "Offline POS",
      description: "Process in-store walk-in sales with our fast offline checkout system.",
      audience: "Seller"
    },
    {
      icon: <Clock className="h-7 w-7 text-white" />,
      color: "bg-linear-to-br from-[#8B5CF6] to-[#A78BFA]",
      shadow: "shadow-[#8B5CF6]/30",
      title: "Order Tracking",
      description: "Track every order from placement to delivery with live status updates.",
      audience: "Shopper"
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-background isolate">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,var(--color-primary)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-[0.03] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_10%,transparent_100%)]"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-foreground mb-5 tracking-tight">
            One Platform.{" "}
            <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#F97316] to-[#F59E0B]">
              Infinite Possibilities.
            </span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium">
            Everything both sellers and shoppers need, built into one seamless experience.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group relative bg-card/40 backdrop-blur-xl p-8 rounded-[1.5rem] border border-border/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5 hover:bg-card/60 hover:border-primary/20 flex flex-col"
            >
              {/* Audience tag */}
              <span className={`absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                feature.audience === 'Seller'
                  ? 'bg-[#1C1410]/10 text-[#1C1410] dark:bg-white/10 dark:text-white/70'
                  : 'bg-primary/10 text-primary'
              }`}>
                {feature.audience}
              </span>

              <div className={`h-14 w-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-xl ${feature.shadow} transform group-hover:-rotate-6 group-hover:scale-110 transition-all duration-500`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed font-medium text-[15px] flex-1">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 6. TESTIMONIALS
// ============================================================
function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Managing my khata book online has saved me hours every week. My customers love the transparency.",
      name: "Ali Ahmed",
      role: "Owner, Fresh Grocers",
      rating: 5
    },
    {
      quote: "The offline checkout is blazing fast and my inventory stays perfectly in sync. A game-changer.",
      name: "Usman Butt",
      role: "Owner, City Electronics",
      rating: 5
    },
    {
      quote: "I discovered three amazing local shops near me that I didn't even know existed. Love this app!",
      name: "Fatima Khan",
      role: "Regular Shopper",
      rating: 5
    },
  ];

  return (
    <section className="py-24 bg-muted/20 relative">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-black mb-4 text-foreground tracking-tight">
          What Our{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-[#F59E0B]">Community</span>{" "}
          Says
        </h2>
        <p className="text-lg text-muted-foreground font-medium mb-16 max-w-xl mx-auto">
          Real stories from sellers and shoppers who use MartLy every day.
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((item, i) => (
            <div key={i} className="group relative bg-card p-8 rounded-[1.5rem] border border-border shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-left">
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {[...Array(item.rating)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                ))}
              </div>

              <p className="text-foreground/80 mb-6 leading-relaxed font-medium text-[15px]">
                &ldquo;{item.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                {/* Avatar placeholder */}
                <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary/30 to-[#F59E0B]/30 flex items-center justify-center text-sm font-bold text-primary">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">{item.name}</h4>
                  <p className="text-xs text-muted-foreground font-semibold">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 7. FINAL CTA
// ============================================================
function CallToActionSection() {
  return (
    <section className="relative py-24 my-10 mx-4 sm:mx-6 lg:mx-8 overflow-hidden rounded-[2rem] md:rounded-[3rem] border border-[#3B2E25]/10 shadow-2xl isolate">
      <div className="absolute inset-0 bg-linear-to-br from-[#1C1410] via-[#2C1C13] to-[#3B2E25] -z-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#F97316]/20 mix-blend-screen rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F59E0B]/20 mix-blend-screen rounded-full blur-[100px] animate-pulse delay-1000" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem] -z-10" />

      <div className="container mx-auto px-4 text-center text-[#FCEEE6] relative z-10">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 tracking-tight drop-shadow-sm text-[#FFFBF7] leading-tight">
          Ready to Join Your{" "}
          <br className="hidden sm:block" />
          Local Marketplace?
        </h2>
        <p className="text-lg md:text-xl text-[#FCEEE6]/80 max-w-2xl mx-auto mb-10 font-medium">
          Whether you sell or shop — MartLy brings your community together. Get started in minutes.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="h-14 px-8 text-lg font-bold shadow-2xl shadow-[#F97316]/20 text-[#2C1C13] bg-[#FFFBF7] hover:bg-[#FFF1E5] hover:scale-105 transition-all duration-300 rounded-full gap-2">
            <Link href="/shops">
              <ShoppingCart className="h-5 w-5" />
              Start Shopping
            </Link>
          </Button>
          <Button asChild size="lg" className="h-14 px-8 text-lg font-bold bg-[#36261E]/50 backdrop-blur-md border border-[#E8DCD1]/20 text-[#FFFBF7] hover:bg-[#36261E] hover:scale-105 transition-all duration-300 rounded-full shadow-lg gap-2">
            <Link href="/vendor/register">
              <Store className="h-5 w-5" />
              Open Your Store
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

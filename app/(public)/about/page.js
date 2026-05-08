
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Store, ShoppingCart, Users, MapPin, Heart, Zap, Target,
  Globe, Shield, TrendingUp, ArrowRight, Sparkles,
  Smartphone, BarChart3, BookText, Package, Clock,
  CheckCircle2, Code2, Database, Layers, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MartLyIcon from "@/components/ui/MartlyIcon";

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
          const numericTarget = parseInt(target.toString().replace(/[^0-9]/g, ""));
          const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
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

function StatItem({ label, value, suffix, icon: Icon }) {
  const { count, ref } = useCountUp(value);
  const display = count >= 1000 ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k` : count;
  return (
    <div ref={ref} className="text-center space-y-2 group">
      <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-3xl md:text-4xl font-black text-foreground tabular-nums">
        {display}{suffix}
      </h3>
      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="font-sans antialiased text-foreground bg-background flex flex-col min-h-screen selection:bg-primary/20 selection:text-primary">
      <main className="grow">
        <HeroSection />
        <MissionSection />
        <StatsSection />
        <HowItWorksSection />
        <ValuesSection />
        <TeamSection />
        <CTASection />
      </main>
    </div>
  );
}

// ============================================================
// HERO
// ============================================================
function HeroSection() {
  return (
    <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden isolate">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,var(--color-primary)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-primary)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.04] dark:opacity-[0.06]"></div>
      <div className="absolute top-0 -z-10 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-[#F97316]/20 rounded-full blur-[120px] opacity-50"></div>
      <div className="absolute -bottom-20 -z-10 right-0 w-[500px] h-[300px] bg-[#F59E0B]/15 rounded-full blur-[100px] opacity-40"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center space-y-6 animate-in slide-in-from-bottom-5 duration-700 fade-in">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-background/50 backdrop-blur-md px-4 py-1.5 text-sm font-semibold text-primary mx-auto">
            <Sparkles className="h-4 w-4 mr-2" />
            About MartLy
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
            Bridging{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#F59E0B] to-[#EA580C]">
              Neighborhoods
            </span>
            <br />
            Through Technology
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
            MartLy is Pakistan&apos;s hyper-local commerce platform connecting neighborhood shoppers with trusted local stores — digitally.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-foreground/70 font-medium pt-2">
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Based in Pakistan</div>
            <div className="flex items-center gap-2"><Store className="h-4 w-4 text-primary" /> 500+ Local Stores</div>
            <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> 10k+ Users</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// MISSION
// ============================================================
function MissionSection() {
  return (
    <section className="py-20 bg-muted/20 relative overflow-hidden isolate">
      <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-[#F97316]/8 rounded-full blur-[120px] -z-10"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Left: Story */}
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary">
              <Heart className="h-4 w-4 mr-2" />
              Our Mission
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight leading-tight">
              Empowering Local Commerce in the{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#F97316] to-[#F59E0B]">Digital Age</span>
            </h2>
            <div className="space-y-4 text-muted-foreground font-medium leading-relaxed">
              <p>
                In Pakistan, millions of small shopkeepers serve their communities every day — yet most lack the tools to compete in a digital-first world. MartLy was born to change that.
              </p>
              <p>
                We believe every neighborhood store deserves the same digital presence as large retailers. From a <strong className="text-foreground">grocers in Lahore</strong> to an <strong className="text-foreground">electronics shop in Karachi</strong>, MartLy gives them a digital storefront, inventory management, and access to nearby customers — all without technical expertise.
              </p>
              <p>
                For shoppers, we make it effortless to discover what&apos;s available <strong className="text-foreground">right around the corner</strong>, order online, and get it delivered — or simply know it&apos;s in stock before visiting.
              </p>
            </div>
          </div>

          {/* Right: Vision Cards */}
          <div className="space-y-4">
            {[
              { icon: Target, title: "Our Vision", desc: "To be Pakistan's #1 hyper-local marketplace, making every neighborhood store discoverable online.", color: "from-[#F97316] to-[#F59E0B]" },
              { icon: Globe, title: "Our Goal", desc: "Digitize 10,000+ local stores across 50 cities, empowering communities with technology.", color: "from-[#EA580C] to-[#F97316]" },
              { icon: Shield, title: "Our Promise", desc: "Transparent pricing, secure transactions, and genuine reviews — building trust between buyers and sellers.", color: "from-[#1C1410] to-[#3B2E25]" },
            ].map((item, i) => (
              <div key={i} className="group flex gap-5 items-start p-6 rounded-[1.5rem] bg-card/50 backdrop-blur-xl border border-border/60 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1">
                <div className={`h-12 w-12 rounded-xl bg-linear-to-br ${item.color} flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors duration-300">{item.title}</h3>
                  <p className="text-muted-foreground font-medium text-[15px] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// STATS
// ============================================================
function StatsSection() {
  return (
    <section className="py-20 border-y border-border bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
            MartLy in{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#F97316] to-[#F59E0B]">Numbers</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <StatItem label="Local Stores" value="500" suffix="+" icon={Store} />
          <StatItem label="Orders Fulfilled" value="2500" suffix="+" icon={Package} />
          <StatItem label="Cities Covered" value="12" suffix="" icon={MapPin} />
          <StatItem label="Happy Users" value="10000" suffix="+" icon={Users} />
        </div>
      </div>
    </section>
  );
}

// ============================================================
// HOW IT WORKS — Platform Overview
// ============================================================
function HowItWorksSection() {
  const platforms = [
    {
      audience: "For Shoppers",
      icon: ShoppingCart,
      color: "from-[#F97316] to-[#F59E0B]",
      features: [
        { icon: MapPin, text: "Location-based store discovery" },
        { icon: ShoppingCart, text: "Easy online ordering" },
        { icon: Clock, text: "Real-time order tracking" },
        { icon: Shield, text: "Secure payments & COD" },
      ]
    },
    {
      audience: "For Sellers",
      icon: Store,
      color: "from-[#1C1410] to-[#3B2E25]",
      features: [
        { icon: Smartphone, text: "Mobile-friendly dashboard" },
        { icon: BookText, text: "Digital Khata management" },
        { icon: BarChart3, text: "Sales analytics & insights" },
        { icon: Package, text: "Online + Offline POS" },
      ]
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden isolate">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,var(--color-primary)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-[0.04] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_10%,transparent_100%)]"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4 tracking-tight">
            Two Sides.{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#F97316] to-[#F59E0B]">One Platform.</span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium">
            MartLy serves both shoppers and sellers with tailored experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {platforms.map((p, i) => (
            <div key={i} className="bg-card/50 backdrop-blur-xl rounded-[2rem] border border-border/60 p-8 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
              <div className="flex items-center gap-4 mb-8">
                <div className={`h-14 w-14 rounded-2xl bg-linear-to-br ${p.color} flex items-center justify-center text-white shadow-lg`}>
                  <p.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{p.audience}</h3>
              </div>
              <div className="space-y-3">
                {p.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-3 p-3.5 rounded-xl bg-background/60 border border-border/40 hover:border-primary/20 hover:bg-primary/5 transition-all duration-300 group">
                    <div className="text-primary/70 group-hover:text-primary transition-colors duration-300 shrink-0">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors duration-300">{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// VALUES
// ============================================================
function ValuesSection() {
  const values = [
    { icon: Heart, title: "Community First", desc: "Every feature we build strengthens the bond between local stores and their neighborhoods.", color: "from-[#F97316] to-[#F59E0B]" },
    { icon: Shield, title: "Trust & Transparency", desc: "Real reviews, verified stores, and honest pricing — no hidden fees, ever.", color: "from-[#10B981] to-[#34D399]" },
    { icon: Zap, title: "Simplicity", desc: "Technology should empower, not complicate. Our tools are designed for everyone.", color: "from-[#EA580C] to-[#F97316]" },
    { icon: TrendingUp, title: "Growth for All", desc: "When local stores thrive, entire communities prosper. We grow together.", color: "from-[#8B5CF6] to-[#A78BFA]" },
  ];

  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary mb-5">
            <Sparkles className="h-4 w-4 mr-2" />
            Our Values
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
            What{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#F97316] to-[#F59E0B]">Drives Us</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {values.map((v, i) => (
            <div key={i} className="group text-center p-8 rounded-[1.5rem] bg-card/50 backdrop-blur-xl border border-border/60 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-500">
              <div className={`mx-auto h-14 w-14 rounded-2xl bg-linear-to-br ${v.color} flex items-center justify-center text-white shadow-lg mb-5 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500`}>
                <v.icon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">{v.title}</h3>
              <p className="text-muted-foreground font-medium text-[15px] leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// TEAM
// ============================================================
function TeamSection() {
  const team = [
    { name: "Muhammad Umer", role: "Full-Stack Developer", initials: "MU", color: "from-[#F97316] to-[#F59E0B]" },
    { name: "Muhammad Bilal", role: "UI/UX & Frontend", initials: "MB", color: "from-[#EA580C] to-[#F97316]" },
    { name: "Muhammad Umar Butt", role: "Database & Planning", initials: "MUB", color: "from-[#1C1410] to-[#3B2E25]" },
  ];

  return (
    <section className="py-20 relative overflow-hidden isolate">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,var(--color-primary)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-[0.04] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_10%,transparent_100%)]"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary mb-5">
            <Users className="h-4 w-4 mr-2" />
            The Team
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
            Built by{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#F97316] to-[#F59E0B]">Passionate Developers</span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium mt-4">
            MartLy is a Final Year Project built with dedication to solving real problems in local commerce.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {team.map((member, i) => (
            <div key={i} className="group text-center p-8 rounded-[1.5rem] bg-card/50 backdrop-blur-xl border border-border/60 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-500">
              <div className={`mx-auto h-20 w-20 rounded-full bg-linear-to-br ${member.color} flex items-center justify-center text-white text-2xl font-black shadow-xl mb-5 group-hover:scale-110 transition-all duration-500`}>
                {member.initials}
              </div>
              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">{member.name}</h3>
              <p className="text-sm font-semibold text-muted-foreground mt-1">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// CTA
// ============================================================
function CTASection() {
  return (
    <section className="relative py-24 my-10 mx-4 sm:mx-6 lg:mx-8 overflow-hidden rounded-[2rem] md:rounded-[3rem] border border-[#3B2E25]/10 shadow-2xl isolate">
      <div className="absolute inset-0 bg-linear-to-br from-[#1C1410] via-[#2C1C13] to-[#3B2E25] -z-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#F97316]/20 mix-blend-screen rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F59E0B]/20 mix-blend-screen rounded-full blur-[100px] animate-pulse delay-1000" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem] -z-10" />

      <div className="container mx-auto px-4 text-center text-[#FCEEE6] relative z-10">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 tracking-tight text-[#FFFBF7] leading-tight">
          Ready to Be Part of the{" "}
          <br className="hidden sm:block" />
          MartLy Community?
        </h2>
        <p className="text-lg md:text-xl text-[#FCEEE6]/80 max-w-2xl mx-auto mb-10 font-medium">
          Join thousands of shoppers and sellers who are already transforming local commerce.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="h-14 px-8 text-lg font-bold shadow-2xl shadow-[#F97316]/20 text-[#2C1C13] bg-[#FFFBF7] hover:bg-[#FFF1E5] hover:scale-105 transition-all duration-300 rounded-full gap-2">
            <Link href="/shops">
              <ShoppingCart className="h-5 w-5" />
              Start Shopping
            </Link>
          </Button>
          <Button asChild size="lg" className="h-14 px-8 text-lg font-bold bg-[#36261E]/50 backdrop-blur-md border border-[#E8DCD1]/20 text-[#FFFBF7] hover:bg-[#36261E] hover:scale-105 transition-all duration-300 rounded-full shadow-lg gap-2">
            <Link href="/contact">
              <ArrowRight className="h-5 w-5" />
              Get In Touch
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

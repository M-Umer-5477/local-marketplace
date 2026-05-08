
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail, Phone, MapPin, Send, Clock, MessageSquare,
  Store, ShoppingCart, ArrowRight, Sparkles, CheckCircle2,
  ChevronDown, HelpCircle, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ContactPage() {
  return (
    <div className="font-sans antialiased text-foreground bg-background flex flex-col min-h-screen selection:bg-primary/20 selection:text-primary">
      <main className="grow">
        <HeroSection />
        <ContactFormSection />
        <FAQSection />
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
    <section className="relative pt-20 pb-16 md:pt-28 md:pb-20 overflow-hidden isolate">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,var(--color-primary)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-primary)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.04] dark:opacity-[0.06]" />
      <div className="absolute top-0 -z-10 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-[#F97316]/20 rounded-full blur-[120px] opacity-50" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-3xl mx-auto text-center space-y-6 animate-in slide-in-from-bottom-5 duration-700 fade-in">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-background/50 backdrop-blur-md px-4 py-1.5 text-sm font-semibold text-primary mx-auto">
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact Us
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
            We&apos;d Love to{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#F59E0B] to-[#EA580C]">
              Hear From You
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
            Have a question, feedback, or want to partner with us? Reach out and our team will get back to you promptly.
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// CONTACT FORM + INFO CARDS
// ============================================================
function ContactFormSection() {
  const [form, setForm] = useState({ name: "", email: "", subject: "general", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSent(true);
        toast.success("Message sent successfully! We'll get back to you soon.");
        setForm({ name: "", email: "", subject: "general", message: "" });
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { icon: Mail, label: "Email Us", value: "admin.martly@gmail.com", href: "mailto:admin.martly@gmail.com", color: "from-[#F97316] to-[#F59E0B]" },
    { icon: Phone, label: "Call Us", value: "+92 300 1234567", href: "tel:+923001234567", color: "from-[#EA580C] to-[#F97316]" },
    { icon: MapPin, label: "Location", value: "Pakistan", href: null, color: "from-[#1C1410] to-[#3B2E25]" },
    { icon: Clock, label: "Response Time", value: "Within 24 hours", href: null, color: "from-[#10B981] to-[#34D399]" },
  ];

  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Contact Info Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
            {contactInfo.map((item, i) => (
              <div key={i} className="group p-5 rounded-[1.5rem] bg-card/50 backdrop-blur-xl border border-border/60 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500 text-center">
                <div className={`mx-auto h-12 w-12 rounded-2xl bg-linear-to-br ${item.color} flex items-center justify-center text-white shadow-lg mb-3 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="text-sm font-semibold text-foreground hover:text-primary transition-colors">{item.value}</a>
                ) : (
                  <p className="text-sm font-semibold text-foreground">{item.value}</p>
                )}
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="grid lg:grid-cols-5 gap-10 items-start">
            {/* Left: Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight mb-3">
                  Send Us a{" "}
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-[#F97316] to-[#F59E0B]">Message</span>
                </h2>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  Whether you&apos;re a shopper with a question, a vendor needing support, or someone interested in partnering — we&apos;re here to help.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { icon: ShoppingCart, text: "Customer support & order inquiries" },
                  { icon: Store, text: "Vendor onboarding & partnership" },
                  { icon: HelpCircle, text: "General questions & feedback" },
                  { icon: Users, text: "Business & collaboration proposals" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/40">
                    <div className="text-primary/70 shrink-0">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-foreground/80">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-3">
              <div className="bg-card/60 backdrop-blur-xl rounded-[2rem] border border-border/60 p-8 shadow-xl">
                {sent ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="mx-auto h-16 w-16 rounded-full bg-green-500/15 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Message Sent!</h3>
                    <p className="text-muted-foreground font-medium">We&apos;ll get back to you within 24 hours.</p>
                    <Button onClick={() => setSent(false)} variant="outline" className="rounded-full mt-2">
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Name *</label>
                        <input
                          name="name" value={form.name} onChange={handleChange} required
                          className="w-full h-12 px-4 rounded-xl bg-background border border-border/60 text-foreground text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Email *</label>
                        <input
                          name="email" type="email" value={form.email} onChange={handleChange} required
                          className="w-full h-12 px-4 rounded-xl bg-background border border-border/60 text-foreground text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Subject</label>
                      <select
                        name="subject" value={form.subject} onChange={handleChange}
                        className="w-full h-12 px-4 rounded-xl bg-background border border-border/60 text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200 appearance-none cursor-pointer"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="support">Customer Support</option>
                        <option value="vendor">Vendor / Seller Support</option>
                        <option value="partnership">Partnership / Business</option>
                        <option value="bug">Report a Bug</option>
                        <option value="feedback">Feedback & Suggestions</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Message *</label>
                      <textarea
                        name="message" value={form.message} onChange={handleChange} required rows={5}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border/60 text-foreground text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200 resize-none"
                        placeholder="Tell us how we can help..."
                      />
                    </div>

                    <Button type="submit" disabled={loading} size="lg" className="w-full h-13 rounded-xl text-base font-bold shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 gap-2">
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// FAQ
// ============================================================
function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: "How do I create a customer account?", a: "Simply click 'Get Started' on the homepage, sign up with your email or Google account, and set your delivery address. It takes less than 30 seconds!" },
    { q: "How can I register my shop on MartLy?", a: "Visit the 'Become a Seller' page, fill in your shop details including location and product categories, and submit for review. Our admin team approves new stores within hours." },
    { q: "Is there a fee to use MartLy?", a: "Creating an account is completely free for both shoppers and sellers. MartLy charges a small commission on completed orders to maintain the platform." },
    { q: "What payment methods are accepted?", a: "We support Cash on Delivery (COD) and online payments via Stripe. More payment options are coming soon!" },
    { q: "How does delivery work?", a: "Each store sets their own delivery radius. When you set your address, MartLy only shows stores that deliver to your area, ensuring fast and reliable delivery." },
    { q: "Can I track my order?", a: "Yes! Once your order is placed, you can track it in real-time from the 'My Orders' section. You'll see status updates as the order is prepared and delivered." },
  ];

  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary mb-5">
            <HelpCircle className="h-4 w-4 mr-2" />
            FAQ
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
            Frequently Asked{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#F97316] to-[#F59E0B]">Questions</span>
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-primary/20">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left gap-4"
              >
                <span className="text-[15px] font-bold text-foreground">{faq.q}</span>
                <ChevronDown className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-300 ${openIndex === i ? "rotate-180 text-primary" : ""}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? "max-h-40 pb-5" : "max-h-0"}`}>
                <p className="px-5 text-sm text-muted-foreground font-medium leading-relaxed">{faq.a}</p>
              </div>
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

      <div className="container mx-auto px-4 text-center text-[#FCEEE6] relative z-10">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 tracking-tight text-[#FFFBF7] leading-tight">
          Still Have Questions?
        </h2>
        <p className="text-lg md:text-xl text-[#FCEEE6]/80 max-w-2xl mx-auto mb-10 font-medium">
          Browse our shops or become a seller today — or reach out anytime.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="h-14 px-8 text-lg font-bold shadow-2xl shadow-[#F97316]/20 text-[#2C1C13] bg-[#FFFBF7] hover:bg-[#FFF1E5] hover:scale-105 transition-all duration-300 rounded-full gap-2">
            <Link href="/shops">
              <ShoppingCart className="h-5 w-5" />
              Browse Shops
            </Link>
          </Button>
          <Button asChild size="lg" className="h-14 px-8 text-lg font-bold bg-[#36261E]/50 backdrop-blur-md border border-[#E8DCD1]/20 text-[#FFFBF7] hover:bg-[#36261E] hover:scale-105 transition-all duration-300 rounded-full shadow-lg gap-2">
            <Link href="/about">
              <ArrowRight className="h-5 w-5" />
              About MartLy
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

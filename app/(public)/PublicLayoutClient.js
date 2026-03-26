"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MainNavbar from "@/components/nav/MainNavbar";
import Footer from "@/components/nav/Footer";

export default function PublicLayoutClient({ children }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  // 🚀 REDIRECT LOGIC: Protect public pages from sellers/admins
  // - Customers login → NextAuth redirects to /dashboard automatically
  // - Customers on refresh → stay on current page (no redirect)
  // - Sellers/Admins → must be redirected away from public pages
  // - Logged-out users → freely access all public pages
  useEffect(() => {
    if (status === "loading") return;
    
    if (session && status === "authenticated") {
      const role = session.user?.role;
      const currentPath = window.location.pathname;
      
      // 🔴 SELLERS & ADMINS: Redirect away from public pages (except auth pages)
      if (role === "seller" || role === "admin") {
        const isAuthPage = currentPath === "/login" || currentPath === "/register";
        
        if (!isAuthPage) {
          // Redirect to their respective dashboards
          const dashboard = role === "seller" ? "/vendor/dashboard" : "/admin/dashboard";
          router.replace(dashboard);
        }
      }
      // 🟢 CUSTOMERS: Redirect only from auth pages (they logged in already)
      else if (role === "customer") {
        const isAuthPage = currentPath === "/login" || currentPath === "/register";
        if (isAuthPage) {
          router.replace("/dashboard");
        }
        // All other pages (/shops, /checkout, /orders, etc.) are allowed freely
      }
    }
  }, [session, status, router]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MainNavbar />
      <main className="flex-1">{children}</main>
      <Footer/>
    </div>
  );
}

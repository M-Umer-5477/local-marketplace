"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MainNavbar from "@/components/nav/MainNavbar";
import Footer from "@/components/nav/Footer";

export default function PublicLayoutClient({ children }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  // 🚀 OPTIMIZATION: Lightweight redirect for authenticated users on public pages
  // NextAuth callback handles most redirects automatically
  // This is only a fallback for edge cases (e.g., manually visiting public URLs while logged in)
  useEffect(() => {
    if (status === "loading") return; // Don't redirect while session is loading
    
    // Only redirect if user is authenticated AND on a public/guest page
    // (not on login, register, etc. which have their own auth checks)
    if (session && status === "authenticated") {
      const role = session.user?.role;
      const currentPath = window.location.pathname;
      
      // Skip redirect if already on protected route or login page
      if (currentPath.includes("/vendor") || 
          currentPath.includes("/admin") || 
          currentPath.includes("/login") || 
          currentPath.includes("/register")) {
        return;
      }

      if (role === "seller") {
        router.replace("/vendor/dashboard");
      } else if (role === "customer") {
        router.replace("/dashboard");
      }
    }
  }, [session, status, router]);

  // 🚀 OPTIMIZATION: Don't block render on session loading
  // Let navbar and children render while session is loading
  // This prevents blank page flicker
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MainNavbar />
      <main className="flex-1">{children}</main>
      <Footer/>
    </div>
  );
}

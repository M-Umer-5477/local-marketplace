"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MainNavbar from "@/components/nav/MainNavbar";

export default function PublicLayoutClient({ children }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (session) {
      const role = session.user?.role;

      if (role === "seller") {
        router.replace("/vendor/dashboard");
      } 
    }
  }, [session, status, router]);

  if (status === "loading") {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MainNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}

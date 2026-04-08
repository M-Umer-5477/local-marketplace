"use client";

import { useState } from "react";
import VendorHeader from "@/components/nav/VendorHeader";
import VendorSidebar from "@/components/nav/VendorSidebar";
import SellerContext from "@/app/(vendor)/SellerContext"; // 👈 1. Import the context

export default function VendorLayoutClient({ session, children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = session;

  return (
   
    <SellerContext.Provider value={{ user }}>
      <div className="min-h-screen bg-backgound">
    
        <VendorHeader
          isCollapsed={isCollapsed}
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
          session={session} // Keep passing full session to header (it might need it for logout)
        />

        {/* Main area: Sidebar + Content */}
        <div className="flex">
          <VendorSidebar isCollapsed={isCollapsed} />
          <main className={`flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto transition-all duration-500 ${isCollapsed ? "md:ml-20" : "md:ml-64"}`}>
            {/* 👈 4. All children here can now use the useSeller() hook */}
            {children}
          </main>
        </div>
      </div>
    </SellerContext.Provider>
  );
}
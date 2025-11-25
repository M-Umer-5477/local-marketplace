"use client";

import { useState } from "react";
import VendorHeader from "@/components/nav/VendorHeader";
import VendorSidebar from "@/components/nav/VendorSidebar";
import SellerContext from "@/app/(vendor)/SellerContext"; // 👈 1. Import the context

export default function VendorLayoutClient({ session, children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 👈 2. Extract the 'user' object from the session
  // This is what we will pass to all child pages.
  const { user } = session;

  return (
    // 👈 3. Wrap your entire layout in the Context Provider
    // The 'value' is what the useSeller() hook will return.
    <SellerContext.Provider value={{ user }}>
      <div className="min-h-screen bg-backgound">
        {/* Header always on top */}
        <VendorHeader
          isCollapsed={isCollapsed}
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
          session={session} // Keep passing full session to header (it might need it for logout)
        />

        {/* Main area: Sidebar + Content */}
        <div className="flex">
          <VendorSidebar isCollapsed={isCollapsed} />
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            {/* 👈 4. All children here can now use the useSeller() hook */}
            {children}
          </main>
        </div>
      </div>
    </SellerContext.Provider>
  );
}
"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider"; 
import { CartProvider } from "@/context/cartContext"; // <--- 1. Import CartProvider
import { AddressProvider } from "@/context/addressContext";
import React from 'react'; 

export default function Providers({ children }) {
  return (
    <ThemeProvider
      attribute="class"          
      defaultTheme="system"      
      enableSystem               
      disableTransitionOnChange  
    >
      <SessionProvider>
        {/* 2. Wrap CartProvider here so it can access Session if needed, and provide data to the App */}
        <CartProvider>
          <AddressProvider>
            {children}
          </AddressProvider>
        </CartProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
// "use client";

// import { SessionProvider } from "next-auth/react";
// import { ThemeProvider } from "@/components/theme-provider"; // Import the new theme provider
// import React from 'react'; // React is often needed for JSX in .js files

// export default function Providers({ children }) {
//   return (
//     // ThemeProvider placed at the top to ensure global class and context are available first.
//     <ThemeProvider
//       attribute="class"          // CRITICAL: Applies the 'dark' class to the <html>
//       defaultTheme="system"      // Default theme setting
//       enableSystem               // Allows 'system' option
//       disableTransitionOnChange  // Prevents visual flickering on load
//     >
//       <SessionProvider>
//         {children}
//       </SessionProvider>
//     </ThemeProvider>
//   );
// }
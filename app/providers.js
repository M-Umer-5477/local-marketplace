// // app/providers.js
// "use client";

// import { SessionProvider } from "next-auth/react";

// export default function Providers({ children }) {
//   return <SessionProvider>{children}</SessionProvider>;
// }
"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider"; // Import the new theme provider
import React from 'react'; // React is often needed for JSX in .js files

export default function Providers({ children }) {
  return (
    // ThemeProvider placed at the top to ensure global class and context are available first.
    <ThemeProvider
      attribute="class"          // CRITICAL: Applies the 'dark' class to the <html>
      defaultTheme="system"      // Default theme setting
      enableSystem               // Allows 'system' option
      disableTransitionOnChange  // Prevents visual flickering on load
    >
      <SessionProvider>
        {children}
      </SessionProvider>
    </ThemeProvider>
  );
}
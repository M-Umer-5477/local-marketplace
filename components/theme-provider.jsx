"use client";

import * as React from "react";
// Import the necessary component from next-themes
import { ThemeProvider as NextThemesProvider } from "next-themes"; 

/**
 * Component to wrap the application and provide theme context.
 * It's configured to use the 'class' attribute for dark mode, matching your global CSS.
 */
export function ThemeProvider({ children, ...props }) {
  // Pass all props down to the NextThemesProvider
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
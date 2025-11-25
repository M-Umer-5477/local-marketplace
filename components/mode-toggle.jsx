"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  // resolvedTheme will return 'dark' or 'light' even if the setting is 'system'
  const { setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    // If currently dark (or system-dark), switch to light. Otherwise, switch to dark.
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      {/* Sun Icon: Visible by default (Light Mode), scales down in Dark Mode */}
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      
      {/* Moon Icon: Hidden by default (Light Mode), scales up in Dark Mode */}
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
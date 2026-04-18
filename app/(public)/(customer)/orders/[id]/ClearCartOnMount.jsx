"use client";

import { useEffect } from "react";
import { useCart } from "@/context/cartContext";

/**
 * Clears the cart ONLY when the user arrives from a fresh order placement.
 * Uses sessionStorage flag set during order submission to prevent
 * clearing the cart when revisiting old order pages.
 */
export default function ClearCartOnMount() {
  const { clearCart } = useCart();

  useEffect(() => {
    // Only clear if we just placed an order (flag set in checkout flow)
    const justPlaced = sessionStorage.getItem("orderJustPlaced");
    if (justPlaced) {
      clearCart();
      sessionStorage.removeItem("orderJustPlaced");
    }
  }, []);

  return null;
}

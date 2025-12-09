// app/orders/[id]/ClearCartOnMount.tsx
"use client";

import { useEffect } from "react";
import { useCart } from "@/context/cartContext";

export default function ClearCartOnMount() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);
  return null;
}

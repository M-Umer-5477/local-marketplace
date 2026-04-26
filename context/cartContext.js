"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { data: session, status } = useSession();

  const [isInitialized, setIsInitialized] = useState(false);
  const [cartReady, setCartReady] = useState(false);

  const [cart, setCart] = useState({
    shopId: null,
    shopName: "",
    items: [],
  });

  // --- Shop-switch confirmation state ---
  const [shopSwitchPending, setShopSwitchPending] = useState(null);

  // Wait for NextAuth (important for signup auto-login)
  const isUserReady = status !== "loading" && (session === null || session?.user);

  // ---------- LOAD CART ONCE ----------
  useEffect(() => {
    if (!isUserReady || isInitialized) return; // run only once

    if (typeof window === "undefined") return;

    const savedCartRaw = localStorage.getItem("myAppCart");
    const savedOwner = localStorage.getItem("cartOwner");

    if (savedCartRaw) {
      const parsedCart = JSON.parse(savedCartRaw);

      if (session?.user?.email) {
        const email = session.user.email;

        const hasValidOwner =
          savedOwner &&
          savedOwner !== "undefined" &&
          savedOwner !== "null";

        // Guest cart -> claim for this new user (signup or first login)
        if (!hasValidOwner) {
          console.log("Claiming GUEST CART for authenticated user");
          setCart(parsedCart);
          localStorage.setItem("cartOwner", email);
        }
        // Cart already belongs to this user
        else if (savedOwner === email) {
          setCart(parsedCart);
        }
        // Cart belongs to some *other* user -> wipe
        else {
          console.log("Cart belonged to previous user → Resetting");
          setCart({ shopId: null, shopName: "", items: [] });
          localStorage.removeItem("myAppCart");
          localStorage.setItem("cartOwner", email);
        }
      } else {
        // Guest session
        setCart(parsedCart);
      }
    }

    setIsInitialized(true);
    setCartReady(true);
  }, [isUserReady, isInitialized, session?.user?.email]);

  // ---------- SAVE CART ----------
  useEffect(() => {
    if (!isInitialized) return;
    if (typeof window === "undefined") return;

    localStorage.setItem("myAppCart", JSON.stringify(cart));

    if (session?.user?.email) {
      localStorage.setItem("cartOwner", session.user.email);
    } else {
      // Guest mode: keep cartOwner empty
    }
  }, [cart, session?.user?.email, isInitialized]);

  // ---------- ACTIONS ----------
  const addToCart = (product, shop) => {
    // If the cart has items from a different shop, show confirmation dialog
    if (cart.shopId && cart.shopId !== shop._id) {
      setShopSwitchPending({ product, shop });
      return;
    }

    addItemDirectly(product, shop);
  };

  // Internal: directly add an item without shop-switch checks
  const addItemDirectly = useCallback((product, shop) => {
    setCart((prev) => {
      const existing = prev.items.find((i) => i.productId === product._id);
      let newItems;

      if (existing) {
        newItems = prev.items.map((i) =>
          i.productId === product._id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        newItems = [
          ...prev.items,
          {
            productId: product._id,
            name: product.name,
            price: product.price,
            image: product.image || product.imageUrl,
            stock: product.stock,
            quantity: 1,
          },
        ];
      }

      return {
        shopId: shop._id,
        shopName: shop.shopName,
        items: newItems,
      };
    });

    toast.success("Item added to cart");
  }, []);

  // Confirm shop switch: clear cart then add the pending item
  const confirmShopSwitch = useCallback(() => {
    if (!shopSwitchPending) return;
    const { product, shop } = shopSwitchPending;
    
    // Clear cart first, then add the new item
    setCart({ shopId: null, shopName: "", items: [] });
    if (typeof window !== "undefined") {
      localStorage.removeItem("myAppCart");
      localStorage.removeItem("cartOwner");
    }
    
    setShopSwitchPending(null);
    
    // Add the new item after clearing
    setTimeout(() => addItemDirectly(product, shop), 0);
  }, [shopSwitchPending, addItemDirectly]);

  const cancelShopSwitch = useCallback(() => {
    setShopSwitchPending(null);
  }, []);

  const updateQuantity = (productId, delta) => {
    setCart((prev) => {
      const newItems = prev.items
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((i) => i.quantity > 0);

      if (newItems.length === 0) {
        return { shopId: null, shopName: "", items: [] };
      }

      return { ...prev, items: newItems };
    });
  };

  const clearCart = () => {
    setCart({ shopId: null, shopName: "", items: [] });
    if (typeof window !== "undefined") {
      localStorage.removeItem("myAppCart");
      localStorage.removeItem("cartOwner");
    }
  };

  const cartTotal = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const cartCount = cart.items.reduce(
    (count, item) => count + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        cartReady,
        addToCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}

      {/* Shop-switch confirmation dialog */}
      <AlertDialog open={!!shopSwitchPending} onOpenChange={(open) => !open && cancelShopSwitch()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch shop?</AlertDialogTitle>
            <AlertDialogDescription>
              Your cart contains items from <strong>{cart.shopName}</strong>. 
              Adding this item will clear your current cart and start a new order 
              from <strong>{shopSwitchPending?.shop?.shopName}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep current cart</AlertDialogCancel>
            <AlertDialogAction onClick={confirmShopSwitch}>
              Clear & switch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

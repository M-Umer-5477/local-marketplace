"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { data: session } = useSession();

  // Initialization & cart readiness
  const [isInitialized, setIsInitialized] = useState(false);
  const [cartReady, setCartReady] = useState(false);

  const [cart, setCart] = useState({
    shopId: null,
    shopName: "",
    items: [],
  });

  // ------------------------------------------
  // LOAD CART ON MOUNT / LOGIN
  // ------------------------------------------
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("myAppCart");
      const savedOwner = localStorage.getItem("cartOwner");

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        // --- If user is logged in ---
        if (session?.user?.email) {
          const userEmail = session.user.email;

          // Case 1: Guest cart → claim it
          if (!savedOwner || savedOwner === "undefined" || savedOwner === "null") {
            console.log("Cart transferred from guest to user");
            setCart(parsedCart);
            localStorage.setItem("cartOwner", userEmail);
          }

          // Case 2: Cart belongs to current user → keep it
          else if (savedOwner === userEmail) {
            setCart(parsedCart);
          }

          // Case 3: Cart belongs to different user → clear it
          else {
            console.log("Clearing cart from previous user");
            setCart({ shopId: null, shopName: "", items: [] });
            localStorage.removeItem("myAppCart");
            localStorage.setItem("cartOwner", userEmail);
          }
        }

        // --- If guest ---
        else {
          setCart(parsedCart);
        }
      }

      setIsInitialized(true);
      setCartReady(true); // 💎 Important for preventing empty-cart flash
    }
  }, [session]);

  // ------------------------------------------
  // SAVE CART ONLY AFTER INITIALIZATION
  // ------------------------------------------
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("myAppCart", JSON.stringify(cart));

      // Update owner if logged in
      if (session?.user?.email) {
        localStorage.setItem("cartOwner", session.user.email);
      }
    }
  }, [cart, session, isInitialized]);

  // ------------------------------------------
  // CART ACTIONS
  // ------------------------------------------

  const addToCart = (product, shop) => {
    if (cart.shopId && cart.shopId !== shop._id) {
      const confirmClear = window.confirm(
        `Your cart contains items from ${cart.shopName}. Clear cart to start a new order from ${shop.shopName}?`
      );
      if (confirmClear) {
        clearCart();
        return;
      } else return;
    }

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

      toast.success("Item added to cart");
      return { shopId: shop._id, shopName: shop.shopName, items: newItems };
    });
  };

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
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

// "use client";
// import { createContext, useContext, useState, useEffect } from "react";
// import { toast } from "sonner";
// import { useSession } from "next-auth/react";

// const CartContext = createContext();

// export function CartProvider({ children }) {
//   const { data: session } = useSession();
  
//   // 1. Add an initialization flag
//   const [isInitialized, setIsInitialized] = useState(false);
  
//   const [cart, setCart] = useState({
//     shopId: null,
//     shopName: "",
//     items: [], 
//   });

//   // --- LOAD & SYNC CART ON MOUNT/LOGIN ---
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const savedCart = localStorage.getItem("myAppCart");
//       const savedOwner = localStorage.getItem("cartOwner");

//       if (savedCart) {
//         const parsedCart = JSON.parse(savedCart);
        
//         // A. If User is Logged In
//         if (session?.user?.email) {
            
//             // Scenario 1: Guest Cart (No Owner) -> CLAIM IT
//             // This fixes your bug. We transfer the "Guest" cart to the "User".
//             if (!savedOwner || savedOwner === "undefined" || savedOwner === "null") {
//                 console.log("Transferring Guest Cart to User");
//                 setCart(parsedCart);
//                 localStorage.setItem("cartOwner", session.user.email);
//             } 
            
//             // Scenario 2: Cart belongs to THIS user -> KEEP IT
//             else if (savedOwner === session.user.email) {
//                 setCart(parsedCart);
//             }
            
//             // Scenario 3: Cart belongs to DIFFERENT user -> WIPE IT
//             else {
//                 console.log("Wiping cart from previous user");
//                 setCart({ shopId: null, shopName: "", items: [] });
//                 localStorage.removeItem("myAppCart");
//                 localStorage.setItem("cartOwner", session.user.email);
//             }
//         } 
        
//         // B. If Guest (Not Logged In) -> SHOW CART
//         else {
//             setCart(parsedCart);
//         }
//       }
      
//       // 2. Mark as initialized so the Save effect can start working
//       setIsInitialized(true);
//     }
//   }, [session]); 

//   // --- SAVE CART ON CHANGE ---
//   useEffect(() => {
//     // 3. CRITICAL FIX: Only save if we have finished loading (initialized)
//     if (isInitialized) {
//         localStorage.setItem("myAppCart", JSON.stringify(cart));
        
//         // Update owner if logged in
//         if (session?.user?.email) {
//           localStorage.setItem("cartOwner", session.user.email);
//         }
//     }
//   }, [cart, session, isInitialized]); // Add isInitialized dependency

//   const addToCart = (product, shop) => {
//     if (cart.shopId && cart.shopId !== shop._id) {
//       const confirmClear = window.confirm(
//         `Your cart contains items from ${cart.shopName}. Clear cart to start a new order from ${shop.shopName}?`
//       );
//       if (confirmClear) {
//         clearCart(); 
//         // Important: We need to return here, but ideally we should recursively call addToCart
//         // or just let the user click again. For simplicity, we return.
//         return; 
//       } else {
//         return; 
//       }
//     }

//     setCart((prev) => {
//       const existingItem = prev.items.find((i) => i.productId === product._id);
//       let newItems;

//       if (existingItem) {
//         newItems = prev.items.map((i) =>
//           i.productId === product._id
//             ? { ...i, quantity: i.quantity + 1 }
//             : i
//         );
//       } else {
//         newItems = [...prev.items, {
//           productId: product._id,
//           name: product.name,
//           price: product.price,
//           image: product.image || product.imageUrl, 
//           stock: product.stock,
//           quantity: 1
//         }];
//       }

//       toast.success("Item added to cart");
//       return { shopId: shop._id, shopName: shop.shopName, items: newItems };
//     });
//   };

//   const updateQuantity = (productId, delta) => {
//     setCart((prev) => {
//       const newItems = prev.items.map((item) => {
//         if (item.productId === productId) {
//           const newQty = item.quantity + delta;
//           return { ...item, quantity: Math.max(0, newQty) }; 
//         }
//         return item;
//       }).filter(i => i.quantity > 0); 

//       if (newItems.length === 0) {
//         return { shopId: null, shopName: "", items: [] };
//       }

//       return { ...prev, items: newItems };
//     });
//   };

//   const clearCart = () => {
//     setCart({ shopId: null, shopName: "", items: [] });
//     // We update local storage immediately here to be safe
//     if (typeof window !== "undefined") {
//         localStorage.removeItem("myAppCart");
//         localStorage.removeItem("cartOwner");
//     }
//   };

//   const cartTotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
//   const cartCount = cart.items.reduce((count, item) => count + item.quantity, 0);

//   return (
//     <CartContext.Provider value={{ cart, addToCart, updateQuantity, clearCart, cartTotal, cartCount }}>
//       {children}
//     </CartContext.Provider>
//   );
// }

// export const useCart = () => useContext(CartContext);

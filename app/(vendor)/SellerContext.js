'use client';

import { createContext, useContext } from 'react';

// 1. Create the context
const SellerContext = createContext(null);

// 2. Create the custom hook that pages will use
export function useSeller() {
  const context = useContext(SellerContext);

  // 3. Add an error check for safety
  if (!context) {
    throw new Error('useSeller must be used within a SellerLayoutClient');
  }
  return context;
}

// 4. Export the context itself (for the Provider in the next file)
export default SellerContext;
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const AddressContext = createContext();

export function AddressProvider({ children }) {
  const { data: session, status } = useSession();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = async () => {
    // If user is not logged in, just stop loading and return
    if (status === "unauthenticated") {
      setAddresses([]);
      setSelectedAddress(null);
      setLoading(false);
      return;
    }

    if (status === "authenticated") {
      try {
        const res = await fetch("/api/customer/addresses");
        const data = await res.json();
        
        if (data.success && data.addresses.length > 0) {
          setAddresses(data.addresses);
          
          //  UX Magic: Check if they previously selected an address in this browser
          const savedAddressId = localStorage.getItem("selectedAddressId");
          let active = null;
          
          if (savedAddressId) {
              active = data.addresses.find(a => a._id === savedAddressId);
          } 
          
          // If no saved preference, default to their database 'isDefault' address
          if (!active) {
              active = data.addresses.find(a => a.isDefault) || data.addresses[0];
          }
          
          if (active) {
              setSelectedAddress(active);
              localStorage.setItem("selectedAddressId", active._id);
          }
        } else {
          // They have no saved addresses yet
          setAddresses([]);
          setSelectedAddress(null);
        }
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Run this whenever their login status changes
  useEffect(() => {
    fetchAddresses();
  }, [status]);

  // Function to change their active address (used in the Header later)
  const selectAddress = (address) => {
    setSelectedAddress(address);
    if (address?._id) {
        localStorage.setItem("selectedAddressId", address._id);
    }
  };

  return (
    <AddressContext.Provider value={{ 
        addresses, 
        selectedAddress, 
        selectAddress, 
        fetchAddresses, // We can call this after adding a new address to refresh the list
        loading 
    }}>
      {children}
    </AddressContext.Provider>
  );
}

// Custom hook to use the context easily in any component
export const useAddress = () => useContext(AddressContext);
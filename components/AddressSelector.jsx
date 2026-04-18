"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useAddress } from "@/context/addressContext";
import { toast } from "sonner";

// Shadcn UI Components (Make sure you have these installed, or adjust to your UI)
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { MapPin, Plus, Check, Loader2, ArrowLeft, Home, Briefcase, Map, LogIn, ChevronDown } from "lucide-react";
import LocationPicker from "@/components/maps/LocationPicker";
import CheckoutAuthModal from "@/components/auth/CheckoutAuthModal"; 

export default function AddressSelector({ compact = false }) {
  const { data: session, status } = useSession();
  const { addresses, selectedAddress, selectAddress, fetchAddresses, loading } = useAddress();
  
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState("list"); // "list" or "add"
  
  // New Address Form State
  const [label, setLabel] = useState("Home");
  const [addressText, setAddressText] = useState("");
  const [city, setCity] = useState("Gujrat");
  const [mapCoordinates, setMapCoordinates] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLocationSelect = (loc) => {
    setMapCoordinates({ lat: loc.lat, lng: loc.lng });
    if (loc.address) setAddressText(loc.address);
  };

  const handleSaveAddress = async () => {
    if (!addressText || !mapCoordinates) {
      return toast.error("Please drop a pin and provide full address details.");
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/customer/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          address: addressText,
          city,
          lat: mapCoordinates.lat,
          lng: mapCoordinates.lng,
          isDefault: true // Make newly added address the active one automatically
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Address saved successfully!");
        await fetchAddresses(); // Refresh the list from the database
        
        // Find the newly added address (it will be default) and select it
        const newActive = data.addresses.find(a => a.isDefault);
        if (newActive) selectAddress(newActive);
        
        setView("list");
        setIsOpen(false);
      } else {
        toast.error(data.error || "Failed to save address");
      }
    } catch (error) {
      toast.error("Network error while saving address");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If not logged in, show premium login prompt
  if (status !== "authenticated") {
    if (compact) {
      // Navbar version - compact
      return (
        <CheckoutAuthModal>
          <Button 
            variant="outline" 
            className="h-auto py-1.5 px-3 gap-2.5 border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-all rounded-xl group"
          >
            <div className="p-1 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors shrink-0">
              <MapPin className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-semibold text-muted-foreground leading-tight">Deliver to</span>
              <span className="text-xs font-bold text-foreground leading-tight">Set location</span>
            </div>
            <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
          </Button>
        </CheckoutAuthModal>
      );
    }
    
    // Full version for other pages
    return (
      <CheckoutAuthModal>
        <div className="w-full max-w-[300px]">
          <Button 
            className="w-full h-auto py-4 px-4 bg-linear-to-br from-primary/90 to-primary hover:from-primary hover:to-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg border border-primary/20 group"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/15 transition-colors">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col items-start flex-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider opacity-90">Set Delivery</span>
                <span className="text-sm font-bold leading-tight">Login to continue</span>
              </div>
              <div className="p-1.5 rounded-full bg-white/10 group-hover:bg-white/15 transition-colors">
                <LogIn className="h-4 w-4 text-white" />
              </div>
            </div>
          </Button>
        </div>
      </CheckoutAuthModal>
    );
  }

  // Loading state while fetching context
  if (loading) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setView("list"); // Reset view when closing
    }}>
      <DialogTrigger asChild>
        {compact ? (
          // Navbar version - compact, two-line
          <Button 
            variant="outline" 
            className="h-auto py-1.5 px-3 gap-2.5 border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-all rounded-xl group max-w-[220px]"
          >
            <div className="p-1 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors shrink-0">
              <MapPin className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex flex-col items-start overflow-hidden">
              <span className="text-[10px] font-semibold text-muted-foreground leading-tight">Deliver to</span>
              <span className="text-xs font-bold text-foreground leading-tight truncate w-full">
                {selectedAddress ? `${selectedAddress.label} · ${selectedAddress.city}` : "Select address"}
              </span>
            </div>
            <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
          </Button>
        ) : (
          // Full version for other pages
          <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5 transition-all max-w-[250px] justify-start rounded-xl">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <div className="flex flex-col items-start overflow-hidden">
              <span className="text-[10px] text-muted-foreground font-semibold leading-tight uppercase tracking-wider">Delivering to</span>
              <span className="text-sm font-bold truncate w-full leading-tight">
                {selectedAddress ? `${selectedAddress.label} - ${selectedAddress.city}` : "Select Address"}
              </span>
            </div>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent 
        className="sm:max-w-md"
        onPointerDownOutside={(e) => {
          // 🚨 FIXED: Prevent dialog from closing when clicking on autocomplete suggestions
          const target = e.target;
          if (target?.closest?.('.pac-container') || target?.closest?.('.pac-item')) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {view === "add" && (
              <Button variant="ghost" size="icon" className="h-6 w-6 mr-2" onClick={() => setView("list")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {view === "list" ? "Choose Delivery Address" : "Add New Address"}
          </DialogTitle>
        </DialogHeader>

        {view === "list" ? (
          <div className="space-y-4 py-4">
            {addresses.length === 0 ? (
               <div className="text-center py-8 text-muted-foreground">
                 <Map className="h-10 w-10 mx-auto mb-3 opacity-20" />
                 <p>No saved addresses yet.</p>
               </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {addresses.map((addr) => {
                  const isSelected = selectedAddress?._id === addr._id;
                  return (
                    <div 
                      key={addr._id}
                      onClick={() => {
                        selectAddress(addr);
                        setIsOpen(false);
                      }}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:border-primary/40 hover:bg-muted/50"}`}
                    >
                      <div className={`p-2 rounded-full mt-0.5 ${isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {addr.label === "Home" ? <Home className="h-4 w-4" /> : addr.label === "Work" ? <Briefcase className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-sm">{addr.label}</h4>
                          {isSelected && <Check className="h-4 w-4 text-primary" />}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{addr.address}</p>
                        <p className="text-xs text-muted-foreground">{addr.city}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Button className="w-full gap-2 mt-2" onClick={() => setView("add")}>
              <Plus className="h-4 w-4" /> Add New Address
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
             {/* The Add Address Form */}
             <LocationPicker onLocationSelect={handleLocationSelect} />
             
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>Label</Label>
                 <Select value={label} onValueChange={setLabel}>
                   <SelectTrigger><SelectValue /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="Home">Home</SelectItem>
                     <SelectItem value="Work">Work</SelectItem>
                     <SelectItem value="Other">Other</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <Label>City</Label>
                 <Input value={city} onChange={(e) => setCity(e.target.value)} />
               </div>
             </div>

             <div className="space-y-2">
               <Label>Full Address</Label>
               <Input 
                 placeholder="House #, Street, Area..." 
                 value={addressText} 
                 onChange={(e) => setAddressText(e.target.value)} 
               />
             </div>

             <Button className="w-full mt-4" onClick={handleSaveAddress} disabled={isSubmitting}>
               {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
               Save & Select Address
             </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
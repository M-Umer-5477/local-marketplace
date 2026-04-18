"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { GoogleMap, Marker, Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { Loader2, MapPin, Search } from "lucide-react";

const LIBRARIES = ["places"];

export default function LocationPicker({ onLocationSelect, defaultPosition }) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY, 
    libraries: LIBRARIES, 
  });

  // Default Fallback: Gujrat, Pakistan
  const gujratPos = { lat: 32.5731, lng: 74.1005 };
  
  // Use passed position OR fallback
  const initialPos = useMemo(() => defaultPosition || gujratPos, [defaultPosition]);
  
  const [center, setCenter] = useState(initialPos);
  const [markerPos, setMarkerPos] = useState(initialPos);
  const [address, setAddress] = useState("Fetching location...");
  const [autocomplete, setAutocomplete] = useState(null);
  const [mapRef, setMapRef] = useState(null);

  // Function to Get Text Address from Coordinates
  const fetchAddress = async (lat, lng) => {
    try {
      // Ensure Geocoder is loaded before using it
      if (!window.google?.maps?.Geocoder) {
        console.warn("Geocoder not ready yet, will retry...");
        // Retry after 300ms if not ready
        setTimeout(() => fetchAddress(lat, lng), 300);
        return;
      }
      
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
      
      if (response.results[0]) {
        const formattedAddress = response.results[0].formatted_address;
        setAddress(formattedAddress);
        if (onLocationSelect) {
            onLocationSelect({ lat, lng, address: formattedAddress });
        }
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setAddress("Location pinned");
      if (onLocationSelect) {
          onLocationSelect({ lat, lng, address: "" });
      }
    }
  };

  // --- AUTO DETECT LOCATION ---
  useEffect(() => {
    // Only run after Google Maps API is loaded
    if (!isLoaded) return;

    // Only fetch if no default position was provided
    if (navigator.geolocation && !defaultPosition?.lat) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCenter(userPos);
          setMarkerPos(userPos);
          // Increased delay to ensure Geocoder is ready
          setTimeout(() => fetchAddress(userPos.lat, userPos.lng), 800);
        },
        () => {
          console.log("Location denied, using default");
          setAddress("Default Location (Gujrat)");
          setTimeout(() => fetchAddress(gujratPos.lat, gujratPos.lng), 800);
        }
      );
    } else if (defaultPosition?.lat) {
        setTimeout(() => fetchAddress(defaultPosition.lat, defaultPosition.lng), 800);
    }
  }, [isLoaded, defaultPosition]);

  const onMarkerDragEnd = useCallback((e) => {
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    setMarkerPos({ lat: newLat, lng: newLng });
    fetchAddress(newLat, newLng); 
  }, []);

  // Handle Search Bar Selection
  const onLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      
      if (place.geometry && place.geometry.location) {
        const newLat = place.geometry.location.lat();
        const newLng = place.geometry.location.lng();
        const newPos = { lat: newLat, lng: newLng };

        // 1. Move the map and the pin
        setCenter(newPos);
        setMarkerPos(newPos);
        
        // Smooth animation using map ref
        if (mapRef) {
          mapRef.panTo(newPos);
          mapRef.setZoom(15);
        }

        // 2. Set the address instantly from the search result
        const newAddress = place.formatted_address || place.name;
        setAddress(newAddress);

        // 3. Update the parent form
        if (onLocationSelect) {
            onLocationSelect({ lat: newLat, lng: newLng, address: newAddress });
        }
      }
    } else {
      console.log("Autocomplete is not loaded yet!");
    }
  };

  // Capture map reference on load
  const onMapLoad = (mapInstance) => {
    setMapRef(mapInstance);
  };

  if (!isLoaded) return (
    <div className="h-[200px] w-full flex items-center justify-center bg-muted border rounded-xl">
      <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      <p className="ml-2 text-sm text-muted-foreground">Loading Map...</p>
    </div>
  );

  return (
    <div className="space-y-2 relative">
      {/* Search Bar for location autocomplete */}
      <div className="relative z-50">
        <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 z-20 pointer-events-none" />
            <input
              type="text"
              placeholder="Search area, street, city..."
              className="w-full h-9 pl-10 pr-4 text-sm rounded-full shadow-lg border-0 bg-white/95 backdrop-blur-sm focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
            />
          </div>
        </Autocomplete>
      </div>

      <div className="border rounded-lg overflow-hidden shadow-sm relative">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "200px", borderRadius: "8px" }}
          center={center}
          zoom={15}
          onLoad={onMapLoad}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          <Marker
            position={markerPos}
            draggable={true}
            onDragEnd={onMarkerDragEnd}
            animation={window.google?.maps?.Animation?.DROP}
          />
        </GoogleMap>

        {/* Location Pin Badge - More Compact */}
        <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur p-2 rounded-lg shadow-lg border text-xs z-10">
           <p className="font-semibold text-[9px] text-muted-foreground uppercase flex items-center gap-1">
             <MapPin className="w-3 h-3 text-primary" /> Location
           </p>
           <p className="truncate text-gray-700 font-medium mt-1">
             {address}
           </p>
        </div>
      </div>

      <style jsx>{`
        :global(.pac-container) {
          z-index: 9999 !important;
          pointer-events: auto !important;
        }
        :global(.pac-item) {
          cursor: pointer;
          pointer-events: auto !important;
          z-index: 9999 !important;
        }
      `}</style>
    </div>
  );
}
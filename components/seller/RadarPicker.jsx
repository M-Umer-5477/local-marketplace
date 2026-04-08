"use client";
import { useState, useCallback, useMemo } from "react";
import { GoogleMap, Marker, Circle, useJsApiLoader } from "@react-google-maps/api";
import { Loader2, MapPin, Navigation } from "lucide-react";

const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "12px",
};

// Libraries must be defined outside component to avoid re-renders
const LIBRARIES = ["places", "geometry"];

export default function RadarPicker({ position, radius, onLocationChange }) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
    libraries: LIBRARIES,
  });

  // Default Center (Gujrat) if no position provided
  const defaultCenter = useMemo(() => ({ lat: 32.5731, lng: 74.1005 }), []);
  
  // Memoize the center to prevent map flickering
  const center = useMemo(() => {
    return (position && position.lat && position.lng && position.lat !== 0) 
      ? position 
      : defaultCenter;
  }, [position, defaultCenter]);

  // Handle Marker Drag
  const onMarkerDragEnd = useCallback((e) => {
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    // Send new coordinates back to parent form
    onLocationChange({ lat: newLat, lng: newLng });
  }, [onLocationChange]);

  // Circle Styles (The "Blue Radar")
  const circleOptions = {
    strokeColor: "#2563EB", // Primary Blue
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#3B82F6",   // Light Blue fill
    fillOpacity: 0.20,
    clickable: false,
    draggable: false,
    editable: false,
    visible: true,
    radius: radius * 1000, // Convert km to meters
    zIndex: 1
  };

  if (!isLoaded) return (
    <div className="h-[400px] w-full flex flex-col items-center justify-center bg-muted border rounded-xl border-dashed">
      <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground mt-2">Loading Radar Map...</p>
    </div>
  );

  return (
    <div className="relative border rounded-xl overflow-hidden shadow-sm group">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {/* 1. The Shop Pin (Draggable) */}
        <Marker
          position={center}
          draggable={true}
          onDragEnd={onMarkerDragEnd}
          animation={window.google?.maps?.Animation?.DROP}
        />

        {/* 2. The Delivery Radius Circle */}
        <Circle
          center={center}
          options={circleOptions}
        />
      </GoogleMap>
      
      {/* Floating Info Badge */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-lg border text-xs z-10 max-w-[200px]">
         <p className="font-bold text-primary mb-1 flex items-center gap-1">
            <Navigation className="w-3 h-3" /> Radar Active: {radius} KM
         </p>
         <p className="text-gray-600 leading-tight">
            Customers inside the blue circle can see & order from you.
         </p>
      </div>

      <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
         Drag pin to move shop • Adjust slider to resize circle
      </div>
    </div>
  );
}
/*"use client";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useCallback, useState } from "react";

export default function MapPicker({ onSelect, defaultPosition }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const [marker, setMarker] = useState(defaultPosition);

  const handleClick = useCallback(
    (event) => {
      const pos = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      setMarker(pos);
      onSelect(pos);
    },
    [onSelect]
  );

  if (!isLoaded) return <p>Loading map…</p>;

  return (
    <div className="rounded-lg overflow-hidden border">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "clamp(250px, 40vh, 400px)" }}
        center={marker || { lat: 32.574, lng: 74.08 }} // default Gujrat
        zoom={14}
        onClick={handleClick}
      >
        {marker && <Marker position={marker} />}
      </GoogleMap>
    </div>
  );
}*/
"use client";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useCallback, useState } from "react";

export default function MapPicker({ onSelect, defaultPosition }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const hasKey = !!apiKey;

  if (!hasKey) {
    return (
      <div className="border rounded-lg bg-muted p-4 text-sm text-center">
        🗺️ Google Maps is disabled. Add your API key in <code>.env.local</code> to enable location picking.
      </div>
    );
  }

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
  });

  const [marker, setMarker] = useState(defaultPosition);

  const handleClick = useCallback(
    (event) => {
      const pos = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      setMarker(pos);
      onSelect(pos);
    },
    [onSelect]
  );

  if (!isLoaded) return <p>Loading map…</p>;

  return (
    <div className="rounded-lg overflow-hidden border">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "300px" }}
        center={marker || { lat: 32.574, lng: 74.08 }}
        zoom={14}
        onClick={handleClick}
      >
        {marker && <Marker position={marker} />}
      </GoogleMap>
    </div>
  );
}

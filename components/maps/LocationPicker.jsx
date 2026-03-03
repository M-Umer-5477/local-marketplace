// "use client";
// import { useState, useMemo, useEffect, useCallback } from "react";
// import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
// import { Loader2, MapPin } from "lucide-react";

// const containerStyle = {
//   width: "100%",
//   height: "350px",
//   borderRadius: "12px",
// };

// const LIBRARIES = ["places"];

// export default function LocationPicker({ onLocationSelect, defaultPosition }) {
//   const { isLoaded } = useJsApiLoader({
//     id: "google-map-script",
//     googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY, 
//     libraries: LIBRARIES, 
//   });

//   // Default Fallback: Gujrat, Pakistan
//   const gujratPos = { lat: 32.5731, lng: 74.1005 };
  
//   // Use passed position OR fallback
//   const initialPos = useMemo(() => defaultPosition || gujratPos, [defaultPosition]);
  
//   const [center, setCenter] = useState(initialPos);
//   const [markerPos, setMarkerPos] = useState(initialPos);
//   const [address, setAddress] = useState("Fetching location...");

//   // Function to Get Text Address from Coordinates
//   const fetchAddress = async (lat, lng) => {
//     try {
//       if (!window.google) return;
//       const geocoder = new window.google.maps.Geocoder();
//       const response = await geocoder.geocode({ location: { lat, lng } });
      
//       if (response.results[0]) {
//         const formattedAddress = response.results[0].formatted_address;
//         setAddress(formattedAddress);
//         onLocationSelect({ lat, lng, address: formattedAddress });
//       }
//     } catch (error) {
//       console.error("Geocoding error:", error);
//       setAddress("Location pinned");
//       onLocationSelect({ lat, lng, address: "" });
//     }
//   };

//   // --- AUTO DETECT LOCATION ---
//   useEffect(() => {
//     // Only fetch if no default position was provided (i.e. it's null)
//     if (navigator.geolocation && !defaultPosition?.lat) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const userPos = {
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           };
//           setCenter(userPos);
//           setMarkerPos(userPos);
//           // Fetch address for the detected location
//           setTimeout(() => fetchAddress(userPos.lat, userPos.lng), 500);
//         },
//         () => {
//           console.log("Location denied, using default");
//           setAddress("Default Location (Gujrat)");
//           // If denied, update parent with the default Gujrat location
//           fetchAddress(gujratPos.lat, gujratPos.lng);
//         }
//       );
//     } else if (defaultPosition?.lat) {
//         // If data existed (e.g. going back a step), fetch its address string
//         fetchAddress(defaultPosition.lat, defaultPosition.lng);
//     }
//   }, []);

//   const onMarkerDragEnd = useCallback((e) => {
//     const newLat = e.latLng.lat();
//     const newLng = e.latLng.lng();
//     setMarkerPos({ lat: newLat, lng: newLng });
//     fetchAddress(newLat, newLng); 
//   }, []);

//   if (!isLoaded) return (
//     <div className="h-[350px] w-full flex items-center justify-center bg-muted border rounded-xl">
//       <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
//       <p className="ml-2 text-sm text-muted-foreground">Loading Map...</p>
//     </div>
//   );

//   return (
//     <div className="space-y-3">
//       <div className="border rounded-xl overflow-hidden shadow-sm relative">
//         <GoogleMap
//           mapContainerStyle={containerStyle}
//           center={center}
//           zoom={15}
//           options={{
//             streetViewControl: false,
//             mapTypeControl: false,
//             fullscreenControl: false,
//           }}
//         >
//           <Marker
//             position={markerPos}
//             draggable={true}
//             onDragEnd={onMarkerDragEnd}
//             animation={window.google?.maps?.Animation?.DROP}
//           />
//         </GoogleMap>

//         <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-lg border text-sm z-10">
//            <p className="font-semibold text-xs text-muted-foreground uppercase flex items-center gap-1">
//              <MapPin className="w-3 h-3" /> Selected Location
//            </p>
//            <p className="truncate text-gray-800 font-medium mt-1">
//              {address}
//            </p>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { GoogleMap, Marker, Autocomplete, useJsApiLoader } from "@react-google-maps/api"; // 🚨 ADDED Autocomplete
import { Loader2, MapPin, Search } from "lucide-react"; // 🚨 ADDED Search icon

const containerStyle = {
  width: "100%",
  height: "350px",
  borderRadius: "12px",
};

// Places library is required for the Search Bar
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
  
  // 🚨 NEW: Autocomplete State
  const [autocomplete, setAutocomplete] = useState(null);

  // Function to Get Text Address from Coordinates
  const fetchAddress = async (lat, lng) => {
    try {
      if (!window.google) return;
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
          setTimeout(() => fetchAddress(userPos.lat, userPos.lng), 500);
        },
        () => {
          console.log("Location denied, using default");
          setAddress("Default Location (Gujrat)");
          fetchAddress(gujratPos.lat, gujratPos.lng);
        }
      );
    } else if (defaultPosition?.lat) {
        fetchAddress(defaultPosition.lat, defaultPosition.lng);
    }
  }, []);

  const onMarkerDragEnd = useCallback((e) => {
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    setMarkerPos({ lat: newLat, lng: newLng });
    fetchAddress(newLat, newLng); 
  }, []);

  // 🚨 NEW: Handle Search Bar Selection
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

  if (!isLoaded) return (
    <div className="h-[350px] w-full flex items-center justify-center bg-muted border rounded-xl">
      <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      <p className="ml-2 text-sm text-muted-foreground">Loading Map...</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="border rounded-xl overflow-hidden shadow-sm relative">
        
        {/* 🚨 NEW: Floating Search Bar */}
        <div className="absolute top-4 left-4 right-12 z-10 sm:right-4">
            <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                <div className="relative w-full max-w-sm mx-auto sm:mx-0 sm:max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 z-20" />
                    <input
                        type="text"
                        placeholder="Search area, street, or city..."
                        className="w-full h-10 pl-10 pr-4 text-sm rounded-full shadow-lg border-0 bg-white/95 backdrop-blur-sm focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                    />
                </div>
            </Autocomplete>
        </div>

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={15}
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

        {/* Existing Location Pin Badge */}
        <div className="absolute bottom-4 left-4 right-12 bg-white/95 backdrop-blur p-3 rounded-lg shadow-lg border text-sm z-10 sm:right-4 max-w-sm sm:max-w-none">
           <p className="font-semibold text-[10px] text-muted-foreground uppercase flex items-center gap-1">
             <MapPin className="w-3 h-3 text-primary" /> Selected Location
           </p>
           <p className="truncate text-gray-800 font-medium mt-0.5">
             {address}
           </p>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground text-center">
        Tip: You can search for an area and then drag the pin for exact placement.
      </p>
    </div>
  );
}
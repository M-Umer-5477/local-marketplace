"use client";
import { useForm } from "react-hook-form";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import MapPicker from "./MapPicker";

export default function StepShop({ nextStep, prevStep, data }) { 
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      shopName: data?.shopName || "",
      shopType: data?.shopType || "",
      shopAddress: data?.shopAddress || "",
    },
  });

  const [location, setLocation] = useState(
    data?.shopLocation || { lat: 32.574, lng: 74.08 }
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = (data) => {
    setError("");
    if (!data.shopType) {
      setError("Please select a shop type.");
      return;
    }
    if (!location || !location.lat || !location.lng) {
      setError("Please pin your shop location on the map.");
      return;
    }
    try {
      setSubmitting(true);
      nextStep({ ...data, shopLocation: location });
    } catch (err) {
      console.error(err);
      setError("Something went wrong, please try again.");
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Shop Details</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Shop Name */}
            <div>
              <Input
                placeholder="Shop Name"
                {...register("shopName", {
                  required: "Shop name is required",
                  minLength: { value: 3, message: "Minimum 3 characters" },
                })}
              />
              {errors.shopName && (
                <p className="text-destructive text-sm mt-1">
                  {errors.shopName.message}
                </p>
              )}
            </div>

            {/* Shop Type */}
            <div>
              <Select
                onValueChange={(v) => setValue("shopType", v)}
                value={watch("shopType")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Shop Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grocery">Grocery</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                </SelectContent>
              </Select>
              {error && error.includes("type") && (
                <p className="text-destructive text-sm mt-1">{error}</p>
              )}
            </div>

            {/* Address (Full width) */}
            <div className="md:col-span-2">
              <Input
                placeholder="Shop Address"
                {...register("shopAddress", {
                  required: "Shop address is required",
                })}
              />
              {errors.shopAddress && (
                <p className="text-destructive text-sm mt-1">
                  {errors.shopAddress.message}
                </p>
              )}
            </div>
          </div>
          {/* End Grid */}

          {/* Map Picker (Full width, outside grid) */}
          <div>
            <p className="text-sm font-medium mb-2 text-foreground">Pin Shop Location</p>
            <MapPicker onSelect={setLocation} defaultPosition={location} />
            {error && error.includes("location") && (
              <p className="text-destructive text-sm mt-1">{error}</p>
            )}
          </div>

          {/* Global Error */}
          {error && !error.includes("type") && !error.includes("location") && (
            <div className="bg-destructive/10 border border-destructive text-destructive-foreground rounded-md p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" type="button" onClick={prevStep}>
              Back
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                </>
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
// "use client";
// import { useForm } from "react-hook-form";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { AlertCircle, Loader2 } from "lucide-react";
// import MapPicker from "./MapPicker";

// export default function StepShop({ nextStep, prevStep, data }) { // <-- 1. Accept 'data'
//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     formState: { errors },
//   } = useForm({
//     // 2. Use 'data' to set default values
//     defaultValues: {
//       shopName: data?.shopName || "",
//       shopType: data?.shopType || "",
//       shopAddress: data?.shopAddress || "",
//     },
//   });

//   // 3. Also initialize location from 'data'
//   const [location, setLocation] = useState(
//     data?.shopLocation || { lat: 32.574, lng: 74.08 }
//   );
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState("");

//   const onSubmit = (data) => {
//     setError("");
//     if (!data.shopType) {
//       setError("Please select a shop type.");
//       return;
//     }
//     if (!location || !location.lat || !location.lng) {
//       setError("Please pin your shop location on the map.");
//       return;
//     }
//     // ... (rest of submit logic is unchanged)
//     try {
//       setSubmitting(true);
//       nextStep({ ...data, shopLocation: location });
//     } catch (err) {
//       console.error(err);
//       setError("Something went wrong, please try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   };


//   return (
//     // ✅ STANDARD CARD: Using consistent Card component
//     <Card>
//       <CardHeader>
//         <CardTitle>Shop Details</CardTitle>
//       </CardHeader>

//       <form onSubmit={handleSubmit(onSubmit)}>
//         {/* ✅ ADDED SPACE: Using space-y-6 for separation */}
//         <CardContent className="space-y-6">
//           {/* ✅ 2-COLUMN GRID: For the top inputs */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* Shop Name */}
//             <div>
//               <Input
//                 placeholder="Shop Name"
//                 {...register("shopName", {
//                   required: "Shop name is required",
//                   minLength: { value: 3, message: "Minimum 3 characters" },
//                 })}
//               />
//               {errors.shopName && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {errors.shopName.message}
//                 </p>
//               )}
//             </div>

//             {/* Shop Type */}
//             <div>
//               <Select
//                 onValueChange={(v) => setValue("shopType", v)}
//                 value={watch("shopType")}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select Shop Type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="Grocery">Grocery</SelectItem>
//                   <SelectItem value="General">General</SelectItem>
//                   <SelectItem value="Pharmacy">Pharmacy</SelectItem>
//                 </SelectContent>
//               </Select>
//               {error && error.includes("type") && (
//                 <p className="text-red-500 text-sm mt-1">{error}</p>
//               )}
//             </div>

//             {/* Address (Full width) */}
//             <div className="md:col-span-2">
//               <Input
//                 placeholder="Shop Address"
//                 {...register("shopAddress", {
//                   required: "Shop address is required",
//                 })}
//               />
//               {errors.shopAddress && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {errors.shopAddress.message}
//                 </p>
//               )}
//             </div>
//           </div>
//           {/* End Grid */}

//           {/* Map Picker (Full width, outside grid) */}
//           <div>
//             <p className="text-sm font-medium mb-2">Pin Shop Location</p>
//             <MapPicker onSelect={setLocation} defaultPosition={location} />
//             {error && error.includes("location") && (
//               <p className="text-red-500 text-sm mt-1">{error}</p>
//             )}
//           </div>

//           {/* Global Error */}
//           {error && !error.includes("type") && !error.includes("location") && (
//             <div className="bg-red-50 border border-red-300 text-red-700 rounded-md p-3 flex items-center gap-2">
//               <AlertCircle className="w-4 h-4" />
//               <span className="text-sm">{error}</span>
//             </div>
//           )}

//           {/* Buttons */}
//           <div className="flex justify-between pt-4">
//             <Button variant="outline" type="button" onClick={prevStep}>
//               Back
//             </Button>
//             <Button
//               type="submit"
//               disabled={submitting}
//               className="flex items-center gap-2"
//             >
//               {submitting ? (
//                 <>
//                   <Loader2 className="w-4 h-4 animate-spin" /> Processing...
//                 </>
//               ) : (
//                 "Next"
//               )}
//             </Button>
//           </div>
//         </CardContent>
//       </form>
//     </Card>
//   );
// }

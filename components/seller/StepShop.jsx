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
// import ImageUploader from "@/components/seller/ImageUploader";

// export default function StepShop({ nextStep, prevStep, data }) { 
//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     formState: { errors },
//   } = useForm({
//     defaultValues: {
//       shopName: data?.shopName || "",
//       shopType: data?.shopType || "",
//       shopAddress: data?.shopAddress || "",
//       shopBanner: data?.shopBanner || "",
//     },
//   });

//   const [location, setLocation] = useState(
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
//     <Card>
//       <CardHeader>
//         <CardTitle>Shop Details</CardTitle>
//       </CardHeader>

//       <form onSubmit={handleSubmit(onSubmit)}>
//         <CardContent className="space-y-6">
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
//                 <p className="text-destructive text-sm mt-1">
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
//                 <p className="text-destructive text-sm mt-1">{error}</p>
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
//                 <p className="text-destructive text-sm mt-1">
//                   {errors.shopAddress.message}
//                 </p>
//               )}
//             </div>
//           </div>
//           {/* End Grid */}

//           {/* Map Picker (Full width, outside grid) */}
//           <div>
//             <p className="text-sm font-medium mb-2 text-foreground">Pin Shop Location</p>
//             <MapPicker onSelect={setLocation} defaultPosition={location} />
//             {error && error.includes("location") && (
//               <p className="text-destructive text-sm mt-1">{error}</p>
//             )}
//           </div>
//            <ImageUploader
//                       label="Shop Banner"
//                       onUpload={setshopBanner}
//                       value={shopBanner}
//                     />

//           {/* Global Error */}
//           {error && !error.includes("type") && !error.includes("location") && (
//             <div className="bg-destructive/10 border border-destructive text-destructive-foreground rounded-md p-3 flex items-center gap-2">
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
import ImageUploader from "@/components/seller/ImageUploader";

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
      shopDescription: data?.shopDescription || "",
      shopAddress: data?.shopAddress || "",
      shopBanner: data?.shopBanner || "",
      shopLogo: data?.shopLogo || "",
    },
  });

  // Watch the banner value specifically for the ImageUploader component
  const shopBanner = watch("shopBanner");
   const shopLogo = watch("shopLogo");


  const [location, setLocation] = useState(
    data?.shopLocation || { lat: 32.574, lng: 74.08 }
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = (formData) => {
    setError("");

    // 1. Validation for Select
    if (!formData.shopType) {
      setError("Please select a shop type.");
      return;
    }

    // 2. Validation for Map
    if (!location || !location.lat || !location.lng) {
      setError("Please pin your shop location on the map.");
      return;
    }

    // 3. Validation for Image Uploader
    if (!formData.shopBanner) {
      setError("Please upload a shop banner.");
      return;
    }
      if (!formData.shopLogo) {
      setError("Please upload a shop logo.");
      return;
    }


    try {
      setSubmitting(true);
      // Pass all data including manual location state
      nextStep({ ...formData, shopLocation: location });
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
          {/* --- Text Inputs Grid --- */}
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
                  <SelectItem value="Bakery">Bakery</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {error && error.includes("type") && (
                <p className="text-destructive text-sm mt-1">{error}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <Input
                placeholder="Shop Description"
                {...register("shopDescription", {
                  required: "Shop Description is required",
                })}
              />
              {errors.shopDescription && (
                <p className="text-destructive text-sm mt-1">
                  {errors.shopDescription.message}
                </p>
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

          {/* --- Map Picker --- */}
          <div>
            <p className="text-sm font-medium mb-2 text-foreground">
              Pin Shop Location
            </p>
            <MapPicker onSelect={setLocation} defaultPosition={location} />
            {error && error.includes("location") && (
              <p className="text-destructive text-sm mt-1">{error}</p>
            )}
          </div>

          {/* --- Image Uploader --- */}
          <div>
            <p className="text-sm font-medium mb-2 text-foreground">
              Shop Logo
            </p>
            <ImageUploader
              label="Upload Logo"
              value={shopLogo}
              onUpload={(url) => {
                setValue("shopLogo", url, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
                // Clear error if specific to banner
                if (error.includes("logo")) setError("");
              }}
            />
            {error && error.includes("logo") && (
              <p className="text-destructive text-sm mt-1">{error}</p>
            )}
          </div>
            <div>
            <p className="text-sm font-medium mb-2 text-foreground">
              Shop Banner
            </p>
            <ImageUploader
              label="Upload Banner"
              value={shopBanner}
              onUpload={(url) => {
                setValue("shopBanner", url, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
                // Clear error if specific to banner
                if (error.includes("banner")) setError("");
              }}
            />
            {error && error.includes("banner") && (
              <p className="text-destructive text-sm mt-1">{error}</p>
            )}
          </div>

          {/* --- Global Error (Fallback) --- */}
          {error &&
            !error.includes("type") &&
            !error.includes("location") &&
            !error.includes("banner") && (
              <div className="bg-destructive/10 border border-destructive text-destructive-foreground rounded-md p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

          {/* --- Buttons --- */}
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
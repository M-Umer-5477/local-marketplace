"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";

import LocationPicker from "@/components/maps/LocationPicker"; 

import ImageUpload from "@/components/seller/image-upload"; 

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

  const shopBanner = watch("shopBanner");
  const shopLogo = watch("shopLogo");

  // Initialize as NULL to trigger LocationPicker's auto-detect
  const [location, setLocation] = useState(data?.shopLocation || null);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleLocationSelect = (newLoc) => {
    setLocation({ lat: newLoc.lat, lng: newLoc.lng });
    
    if (newLoc.address) {
      setValue("shopAddress", newLoc.address, { 
        shouldValidate: true, 
        shouldDirty: true 
      });
    }
  };

  const onSubmit = (formData) => {
    setError("");

    if (!formData.shopType) return setError("Please select a shop type.");
    if (!location || !location.lat) return setError("Please pin your shop location on the map.");
    if (!formData.shopBanner) return setError("Please upload a shop banner.");
    if (!formData.shopLogo) return setError("Please upload a shop logo.");

    try {
      setSubmitting(true);
      
      nextStep({ 
          ...formData, 
          shopLocation: location 
      });
      
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
            <div>
              <Input
                placeholder="Shop Name"
                {...register("shopName", {
                  required: "Shop name is required",
                  minLength: { value: 3, message: "Minimum 3 characters" },
                })}
              />
              {errors.shopName && <p className="text-destructive text-sm mt-1">{errors.shopName.message}</p>}
            </div>

            <div>
              <Select onValueChange={(v) => setValue("shopType", v)} value={watch("shopType")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Shop Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grocery">Grocery</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="Bakery">Bakery</SelectItem>
                  <SelectItem value="Vegetable">Vegetable & Fruits</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
              {/* 1. THE MAP PICKER */}
              <div>
                <p className="text-sm font-medium mb-2 text-foreground">Pin Shop Location</p>
                <LocationPicker 
                   onLocationSelect={handleLocationSelect} 
                   defaultPosition={location} 
                />
                {error && error.includes("location") && (
                  <p className="text-destructive text-sm mt-1">{error}</p>
                )}
              </div>

              {/* 2. THE ADDRESS INPUT */}
              <div>
                <Input
                  placeholder="Shop Address (Auto-filled from map)"
                  {...register("shopAddress", { required: "Shop address is required" })}
                />
                {errors.shopAddress && <p className="text-destructive text-sm mt-1">{errors.shopAddress.message}</p>}
              </div>
              
              <div>
                  <Input
                    placeholder="Shop Description"
                    {...register("shopDescription", { required: "Description is required" })}
                  />
              </div>
          </div>

          {/*  UPDATED IMAGE UPLOAD SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium mb-2">Shop Logo</p>
                <ImageUpload
                  label="Upload Logo"
                  value={shopLogo}
                  onUpload={(url) => setValue("shopLogo", url, { shouldValidate: true })}
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Shop Banner</p>
                <ImageUpload
                  label="Upload Banner"
                  value={shopBanner}
                  onUpload={(url) => setValue("shopBanner", url, { shouldValidate: true })}
                />
              </div>
          </div>

          {error && !error.includes("location") && (
             <div className="bg-destructive/10 border border-destructive text-destructive-foreground rounded-md p-3 flex items-center gap-2">
               <AlertCircle className="w-4 h-4" />
               <span className="text-sm">{error}</span>
             </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" type="button" onClick={prevStep}>Back</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Next"}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
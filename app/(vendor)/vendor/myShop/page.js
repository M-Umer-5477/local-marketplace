
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner"; 
import { Loader2, Save, MapPin, Clock, Info } from "lucide-react";
import ImageUploader from "@/components/seller/ImageUploader"; 

// --- NEW IMPORT ---
import RadarPicker from "@/components/seller/RadarPicker";

// ShadCN Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MyShopPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      shopName: "",
      shopDescription: "",
      shopType: "General",
      shopAddress: "",
      deliveryRadius: 3,
      isShopOpen: true,
      openingTime: "09:00",
      closingTime: "22:00",
      shopLogo: "",
      shopBanner: "",
      latitude: 32.5731, // Default Gujrat Lat
      longitude: 74.1005, // Default Gujrat Lng
      minimumOrderAmount: 0 // ✅ NEW: Minimum order amount
    }
  });

  // Watch values for real-time map updates
  const isShopOpen = watch("isShopOpen");
  const deliveryRadius = watch("deliveryRadius");
  const currentLat = watch("latitude");
  const currentLng = watch("longitude");

  // 1. Fetch Existing Data
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await fetch("/api/vendor/myShop");
        const data = await res.json();

        if (data.success && data.data) {
          const s = data.data;
          setValue("shopName", s.shopName);
          setValue("shopDescription", s.shopDescription || "");
          setValue("shopType", s.shopType);
          setValue("shopAddress", s.shopAddress);
          setValue("deliveryRadius", s.deliveryRadius || 3);
          setValue("isShopOpen", s.isShopOpen);
          setValue("openingTime", s.openingTime || "09:00");
          setValue("closingTime", s.closingTime || "22:00");
          setValue("shopLogo", s.shopLogo || "");
          setValue("shopBanner", s.shopBanner || "");
          setValue("minimumOrderAmount", s.minimumOrderAmount || 0); // ✅ NEW
          
          // Set Coords (fallback to Gujrat if 0)
          if (data.data.latitude && data.data.longitude) {
             setValue("latitude", data.data.latitude);
             setValue("longitude", data.data.longitude);
          }
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to load shop details");
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, [setValue]);

  // 2. Handle Map Pin Drag
  const handleLocationChange = ({ lat, lng }) => {
     setValue("latitude", lat, { shouldDirty: true });
     setValue("longitude", lng, { shouldDirty: true });
     // Optional: You could allow reverse-geocoding here to auto-update address text
  };

  // 3. Handle Submit
  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const res = await fetch("/api/vendor/myShop", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success("Shop settings updated successfully!");
      } else {
        toast.error("Failed to update settings.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error saving data.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto pb-20">
      
      {/* Header & Status Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Shop Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your store appearance and availability.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-secondary/50 p-2 rounded-lg px-4 border border-border">
          <Label className="font-medium cursor-pointer" htmlFor="shop-status">Shop Status:</Label>
          <Switch 
            id="shop-status"
            checked={isShopOpen} 
            onCheckedChange={(val) => setValue("isShopOpen", val)} 
          />
          <span className={`text-sm font-bold ${isShopOpen ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
            {isShopOpen ? "OPEN ONLINE" : "CLOSED"}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-fit">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="hours">Hours</TabsTrigger>
          </TabsList>

          {/* --- TAB 1: General --- */}
          <TabsContent value="general" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Details</CardTitle>
                <CardDescription>This information is visible to customers.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Shop Name</Label>
                    <Input {...register("shopName")} placeholder="e.g. Al-Madina General Store" />
                  </div>
                  <div className="space-y-2">
                    <Label>Shop Type</Label>
                    <Select 
                      onValueChange={(val) => setValue("shopType", val)} 
                      value={watch("shopType")}
                    >
                      <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Grocery">Grocery / Kiryana</SelectItem>
                        <SelectItem value="Pharmacy">Medical / Pharmacy</SelectItem>
                        <SelectItem value="General">General Store</SelectItem>
                        <SelectItem value="Bakery">Bakery & Sweets</SelectItem>
                        <SelectItem value="Vegetable">Vegetable / Fruit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    {...register("shopDescription")} 
                    placeholder="Tell customers about your shop..." 
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- TAB 2: Branding --- */}
          <TabsContent value="branding" className="mt-6 space-y-6">
            <div className="space-y-3">
               <Label className="text-base font-semibold">Shop Logo</Label>
               <div className="max-w-xs">
                 <ImageUploader 
                   label="Logo"
                   value={watch("shopLogo")}
                   onUpload={(url) => setValue("shopLogo", url, { shouldDirty: true })}
                   imageClass="w-32 h-32 rounded-full border border-border"
                 />
               </div>
               <p className="text-xs text-muted-foreground">Recommended size: 500x500px (Square)</p>
            </div>
            <div className="space-y-3">
               <Label className="text-base font-semibold">Shop Banner / Cover</Label>
               <div className="w-full">
                 <ImageUploader 
                   label="Banner Image"
                   value={watch("shopBanner")}
                   onUpload={(url) => setValue("shopBanner", url, { shouldDirty: true })}
                   imageClass="w-full h-48 md:h-64 border border-border"
                 />
               </div>
               <p className="text-xs text-muted-foreground">This will appear at the top of your store page.</p>
            </div>
          </TabsContent>

          {/* --- TAB 3: Pricing --- */}
          <TabsContent value="pricing" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Orders</CardTitle>
                <CardDescription>Control minimum orders and future dynamic pricing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Minimum Order Amount */}
                <div className="space-y-3 p-4 border rounded-lg bg-primary/5 border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="min-order" className="text-base font-semibold">Minimum Order Amount</Label>
                      <p className="text-xs text-muted-foreground">Set the lowest order value customers must place. (0 = no minimum)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-primary">Rs.</span>
                    <Input 
                      id="min-order"
                      type="number" 
                      min="0" 
                      step="10"
                      placeholder="e.g., 500"
                      {...register("minimumOrderAmount", { 
                        valueAsNumber: true,
                        min: { value: 0, message: "Minimum must be 0 or higher" }
                      })} 
                      className="text-lg font-semibold"
                    />
                  </div>
                  
                  <div className="bg-white/50 dark:bg-black/20 p-3 rounded text-xs space-y-1">
                    <p className="font-semibold text-foreground">Examples:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• <strong>0</strong> = No minimum (customers can order any amount)</li>
                      <li>• <strong>200</strong> = Customers must order at least Rs. 200</li>
                      <li>• <strong>500</strong> = Customers must order at least Rs. 500</li>
                    </ul>
                  </div>
                </div>

                {/* Future Feature Notice */}
                <div className="p-4 border rounded-lg bg-amber-50/30 dark:bg-amber-950/20 border-amber-200/50">
                  <div className="flex gap-3">
                    <div className="text-2xl">🚀</div>
                    <div className="space-y-1">
                      <p className="font-semibold text-sm text-foreground">Coming Soon</p>
                      <p className="text-xs text-muted-foreground">Dynamic delivery fee based on customer distance (automatically calculate fees based on how far customers are from your shop)</p>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* --- TAB 4: Location (INTEGRATED RADAR) --- */}
          <TabsContent value="location" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Radar & Location</CardTitle>
                <CardDescription>Drag the pin to your shop. Adjust slider to set delivery area.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="space-y-2">
                  <Label>Shop Address Text</Label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input {...register("shopAddress")} className="pl-9" placeholder="Street, Sector, City" />
                  </div>
                </div>

                {/* --- RADAR MAP --- */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        Visual Radar Editor 
                        <span className="text-xs text-muted-foreground font-normal">(Updates automatically)</span>
                    </Label>
                    <RadarPicker 
                        position={{ lat: currentLat, lng: currentLng }}
                        radius={deliveryRadius}
                        onLocationChange={handleLocationChange}
                    />
                </div>

                {/* Radius Slider */}
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <div className="flex justify-between items-center">
                    <Label>Delivery Radius</Label>
                    <span className="font-bold text-primary bg-background border px-3 py-1 rounded text-sm shadow-sm">
                      {deliveryRadius} KM
                    </span>
                  </div>
                  <Slider 
                    defaultValue={[3]} 
                    max={15} 
                    step={1} 
                    value={[deliveryRadius]}
                    onValueChange={(val) => setValue("deliveryRadius", val[0], { shouldDirty: true })}
                  />
                  <div className="flex gap-2 items-start text-xs bg-primary/10 p-2 rounded text-primary">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>Moving this slider will shrink or grow the primary circle on the map above.</p>
                  </div>
                </div>

                {/* Hidden Inputs (We need these to submit the form, but User edits via Map) */}
                <div className="grid grid-cols-2 gap-4">
                  <Input type="number" step="any" {...register("latitude")} />
                  <Input type="number" step="any" {...register("longitude")} />
                </div>
                
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- TAB 5: Hours --- */}
          <TabsContent value="hours" className="mt-6 space-y-4">
            <Card>
              <CardHeader><CardTitle>Operating Hours</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Opening Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                    <Input type="time" className="pl-9" {...register("openingTime")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Closing Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                    <Input type="time" className="pl-9" {...register("closingTime")} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="sticky bottom-4 flex justify-end mt-8">
              <Button size="lg" type="submit" disabled={saving} className="shadow-xl">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
          </div>

        </Tabs>
      </form>
    </div>
  );
}
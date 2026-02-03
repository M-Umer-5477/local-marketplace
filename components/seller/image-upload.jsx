"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud, X, Camera } from "lucide-react";
import { toast } from "sonner";

export default function ImageUpload({ 
  onUpload, 
  value, 
  label = "Upload Image", 
  capture = null // Pass "environment" for rear camera (Docs), "user" for selfie
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || "");

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate size (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "vendor_docs_unsigned"); 

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME; 
      
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (data.secure_url) {
        setPreview(data.secure_url);
        onUpload(data.secure_url);
        toast.success("Image uploaded!");
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview("");
    onUpload("");
  };

  // 1. VIEW MODE (If image exists)
  if (preview) {
    return (
      <div className="relative w-full h-40 rounded-lg border-2 border-dashed border-gray-200 overflow-hidden group hover:border-primary transition-colors bg-gray-50">
        <img src={preview} alt="Preview" className="w-full h-full object-contain" />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <Button 
                type="button"
                variant="destructive" 
                size="sm" 
                className="gap-2"
                onClick={handleRemove}
            >
                <X className="h-4 w-4" /> Remove Image
            </Button>
        </div>
      </div>
    );
  }

  // 2. UPLOAD MODE
  return (
    <div className="w-full">
      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 hover:border-primary transition-all duration-200 group">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {uploading ? (
             <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
          ) : capture ? (
             // Show Camera Icon if capture mode is on
             <Camera className="w-10 h-10 text-gray-400 group-hover:text-primary mb-3 transition-colors" />
          ) : (
             // Show Cloud Icon normally
             <UploadCloud className="w-10 h-10 text-gray-400 group-hover:text-primary mb-3 transition-colors" />
          )}
          
          <p className="text-sm font-medium text-gray-600 group-hover:text-primary">
            {uploading ? "Uploading..." : label}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {capture ? "Tap to take photo" : "Click to upload or drag & drop"}
          </p>
        </div>

        <input 
          type="file" 
          className="hidden" 
          accept="image/*" 
          // ✅ This enables camera on mobile
          capture={capture} 
          onChange={handleFileChange} 
          disabled={uploading}
        />
      </label>
    </div>
  );
}
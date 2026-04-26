"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud, X, Camera, Wand2 } from "lucide-react";
import { toast } from "sonner";

 
const REMOVE_BG_API_KEY = process.env.NEXT_PUBLIC_REMOVE_BG_API_KEY;

export default function ProductImageUpload({ 
  onUpload, 
  value, 
  label = "Upload Image", 
  capture = null 
}) {
  const [uploading, setUploading] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [preview, setPreview] = useState(value || "");

  const handleFileChange = async (e) => {
    const originalFile = e.target.files?.[0];
    if (!originalFile) return;

    if (!originalFile.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (originalFile.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
    }

    let fileToUpload = originalFile;

    
    try {
      setAiProcessing(true);
      toast.loading("AI is cleaning the image...", { id: "ai-toast" });
      
      const removeBgFormData = new FormData();
      removeBgFormData.append("image_file", originalFile);
      removeBgFormData.append("size", "auto");

      const aiResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": REMOVE_BG_API_KEY,
        },
        body: removeBgFormData,
      });

      if (!aiResponse.ok) throw new Error("Remove.bg API failed");

      // Convert the successful API response into a file for Cloudinary
      const cleanImageBlob = await aiResponse.blob();
      fileToUpload = new File([cleanImageBlob], "clean_product.png", { type: "image/png" });
      
      toast.success("Background removed instantly!", { id: "ai-toast" });
    } catch (error) {
      console.error("AI Error:", error);
      toast.error("AI failed, uploading original image instead.", { id: "ai-toast" });
    } finally {
      setAiProcessing(false);
    }

    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", fileToUpload); 
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
        toast.success("Image uploaded to marketplace!");
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

  if (preview) {
    return (
      <div className="relative w-full h-40 rounded-lg border-2 border-dashed border-gray-200 overflow-hidden group hover:border-primary transition-colors bg-white">
        <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
        <img src={preview} alt="Preview" className="w-full h-full object-contain relative z-10" />
        
        <div className="absolute inset-0 z-20 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <Button type="button" variant="destructive" size="sm" className="gap-2" onClick={handleRemove}>
                <X className="h-4 w-4" /> Remove Image
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 hover:border-primary transition-all duration-200 group">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {aiProcessing ? (
             <Wand2 className="w-10 h-10 text-primary animate-pulse mb-3" />
          ) : uploading ? (
             <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
          ) : capture ? (
             <Camera className="w-10 h-10 text-gray-400 group-hover:text-primary mb-3 transition-colors" />
          ) : (
             <UploadCloud className="w-10 h-10 text-gray-400 group-hover:text-primary mb-3 transition-colors" />
          )}
          
          <p className="text-sm font-medium text-gray-600 group-hover:text-primary">
            {aiProcessing ? "AI API Cleaning Image..." : uploading ? "Uploading..." : label}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {aiProcessing ? "Connecting to Remove.bg" : capture ? "Tap to take photo" : "Click to upload or drag & drop"}
          </p>
        </div>
        <input type="file" className="hidden" accept="image/*" capture={capture} onChange={handleFileChange} disabled={uploading || aiProcessing} />
      </label>
    </div>
  );
}
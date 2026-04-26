"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";

export default function SimpleUpload({ onUpload, value }) {
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

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    // We use the same unsigned preset you used in the widget
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
        onUpload(data.secure_url); // Pass URL back to parent
        toast.success("Screenshot uploaded!");
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Upload failed. Check console for details.");
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
      <div className="relative w-full h-32 rounded-lg border overflow-hidden group">
        <img src={preview} alt="Proof" className="w-full h-full object-cover" />
        <Button 
          type="button"
          variant="destructive" 
          size="icon" 
          className="absolute top-2 right-2 h-6 w-6 opacity-90 hover:opacity-100"
          onClick={handleRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {uploading ? (
             <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-2" />
          ) : (
             <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
          )}
          <p className="text-xs text-gray-500">
            {uploading ? "Uploading..." : "Click to upload screenshot"}
          </p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
          disabled={uploading}
        />
      </label>
    </div>
  );
}
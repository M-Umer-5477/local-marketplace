
"use client";
import { CldUploadWidget } from "next-cloudinary";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, UploadCloud } from "lucide-react";

export default function ImageUploader({ label, onUpload, value, disableScrollbarFix = false }) {
  const [uploadedUrl, setUploadedUrl] = useState(value || "");

  useEffect(() => {
    setUploadedUrl(value || "");
  }, [value]);

  const setScroll = () => {
    if (!disableScrollbarFix) document.body.style.overflow = "auto";
  };

  const handleSuccess = (result) => {
    const url = result?.info?.secure_url;
    const format = result?.info?.format;
    if (["png", "jpg", "jpeg", "webp"].includes(format)) {
      setUploadedUrl(url);
      onUpload(url);
      setTimeout(() => setScroll(), 500);
    } else {
      alert("Only image files allowed (JPG, PNG, JPEG, WEBP)");
      setScroll();
    }
  };

  const handleRemove = () => {
    setUploadedUrl("");
    onUpload("");
    setScroll();
  };

  return (
    <Card className="p-4 border border-dashed border-gray-300 hover:border-primary/50 transition-all duration-200">
      <div className="flex flex-col items-center justify-center space-y-3">
        <p className="font-medium text-sm text-gray-600">{label}</p>

        {!uploadedUrl ? (
          <CldUploadWidget
            uploadPreset="vendor_docs_unsigned"
            options={{
              sources: ["local", "camera"],
              multiple: false,
              maxFiles: 1,
              folder: "vendor_docs",
              resourceType: "image",
            }}
            onSuccess={handleSuccess}
            onClose={setScroll}
          >
            {({ open }) => (
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setTimeout(() => open(), 150)}
              >
                <UploadCloud className="w-4 h-4" />
                Upload Image
              </Button>
            )}
          </CldUploadWidget>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <img
              src={uploadedUrl}
              alt="Uploaded"
              className="rounded-md w-40 h-40 object-cover border border-gray-300 shadow-sm"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              className="flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" /> Remove
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


import ImageUpload from "@/components/seller/image-upload";

export default function StepDocs({ nextStep, prevStep, data }) {
  
  // Helper to find existing doc URL
  const findDocUrl = (docType) => {
    return (
      data?.verificationDocs?.find((doc) => doc.docType === docType)?.docURL || ""
    );
  };

  const [cnicFront, setCnicFront] = useState(() => findDocUrl("CNIC Front"));
  const [cnicBack, setCnicBack] = useState(() => findDocUrl("CNIC Back"));
  const [proofDoc, setProofDoc] = useState(() => findDocUrl("Proof of Shop"));

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setError("");
    if (!cnicFront || !cnicBack || !proofDoc) {
      setError("Please upload all required documents before proceeding.");
      return;
    }
    
    const verificationDocs = [
      { docType: "CNIC Front", docURL: cnicFront },
      { docType: "CNIC Back", docURL: cnicBack },
      { docType: "Proof of Shop", docURL: proofDoc },
    ];

    setLoading(true);
    
    // Simulate short delay for UX
    setTimeout(() => {
      setLoading(false);
      nextStep({ verificationDocs });
    }, 500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Verification Documents</CardTitle>
        <p className="text-sm text-muted-foreground">
          Please upload clear photos. On mobile, the camera will open automatically.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* ✅ 1. CNIC FRONT (Forces Rear Camera) */}
          <div>
            <ImageUpload
                label="CNIC Front"
                // 📸 Opens Rear Camera
                onUpload={setCnicFront}
                value={cnicFront}
            />
          </div>

          {/* ✅ 2. CNIC BACK (Forces Rear Camera) */}
          <div>
            <ImageUpload
                label="CNIC Back"
               
                onUpload={setCnicBack}
                value={cnicBack}
            />
          </div>

          {/* ✅ 3. PROOF OF SHOP */}
          <div>
            <ImageUpload
                label="Shop Proof (Bill/Rent Agreement)"
                
                onUpload={setProofDoc}
                value={proofDoc}
            />
          </div>

        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive-foreground rounded-md p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={prevStep} disabled={loading}>
            Back
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Next"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
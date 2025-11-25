
// 
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ImageUploader from "@/components/seller/ImageUploader";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ✅ 1. Accept 'data' prop
export default function StepDocs({ nextStep, prevStep, data }) {
  
  // ✅ 2. Helper function to find a doc URL from the saved array
  // This safely checks if 'data.verificationDocs' exists
  const findDocUrl = (docType) => {
    return (
      data?.verificationDocs?.find((doc) => doc.docType === docType)?.docURL || ""
    );
  };

  // ✅ 3. Initialize state using the helper function
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
    console.log("✅ Docs ready to save:", verificationDocs);
    
    setTimeout(() => {
      setLoading(false);
      nextStep({ verificationDocs });
    }, 800);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Verification Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ✅ 4. Pass the 'value' prop to each uploader */}
          <ImageUploader
            label="CNIC Front Image"
            onUpload={setCnicFront}
            value={cnicFront}
          />
          <ImageUploader
            label="CNIC Back Image"
            onUpload={setCnicBack}
            value={cnicBack}
          />
          <ImageUploader
            label="Proof of Shop (Utility Bill / License / Rent Agreement)"
            onUpload={setProofDoc}
            value={proofDoc}
          />
        </div>

        {/* Show validation error */}
        {error && (
          // FIX: Replaced hardcoded red colors with semantic destructive classes
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
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className={`transition ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Processing..." : "Next"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
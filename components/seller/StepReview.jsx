"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner" // ✅ Shadcn toast hook
export default function StepReview({ data, prevStep }) {
  // ... (all your useState and handleSubmit logic remains IDENTICAL)
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    // ... (submit logic is unchanged)
    if (submitting || submitted) return;
    try {
      setSubmitting(true);
      setError("");
      const res = await fetch("/api/vendor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
      toast.success("Registration Submitted ✅", {
        description: "Please verify your email and wait for admin approval.",
      });
    } catch (err) {
      setError("Something went wrong. Please try again later.");
      toast.error("Submission Failed ❌", {
        description: "Please check your connection and try again.",
      });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center text-foreground">
        Review Your Information
      </h2>

      {/* Personal Info */}
      <Card>
        <CardContent className="p-4 space-y-2 text-foreground">
          <h3 className="font-semibold text-lg">Personal Details</h3>
          <p className="text-muted-foreground">
            <strong>Full Name:</strong> <span className="text-foreground">{data.fullName}</span>
          </p>
          <p className="text-muted-foreground">
            <strong>Email:</strong> <span className="text-foreground">{data.email}</span>
          </p>
          <p className="text-muted-foreground">
            <strong>Phone:</strong> <span className="text-foreground">{data.phone}</span>
          </p>
          <p className="text-muted-foreground">
            <strong>CNIC:</strong> <span className="text-foreground">{data.cnic}</span>
          </p>
        </CardContent>
      </Card>

      {/* Shop Info */}
      <Card>
        <CardContent className="p-4 space-y-2 text-foreground">
          <h3 className="font-semibold text-lg">Shop Details</h3>
          <p className="text-muted-foreground">
            <strong>Shop Name:</strong> <span className="text-foreground">{data.shopName}</span>
          </p>
          <p className="text-muted-foreground">
            <strong>Type:</strong> <span className="text-foreground">{data.shopType}</span>
          </p>
          <p className="text-muted-foreground">
            <strong>Address:</strong> <span className="text-foreground">{data.shopAddress}</span>
          </p>
          <p className="text-muted-foreground">
            <strong>Location:</strong>{" "}
            {data.shopLocation
              ? <span className="text-foreground">{`${data.shopLocation.lat}, ${data.shopLocation.lng}`}</span>
              : "Not set"}
          </p>
        </CardContent>
      </Card>

      {/* Verification Documents */}
      {data.verificationDocs && data.verificationDocs.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="font-semibold text-lg text-foreground">Verification Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {data.verificationDocs.map((doc, index) => (
                <div key={index} className="text-center">
                  <p className="font-medium text-sm mb-1 text-foreground">{doc.docType}</p>
                  <img
                    src={doc.docURL}
                    alt={doc.docType}
                    // Border uses semantic color
                    className="rounded-md w-full h-32 object-cover border border-border" 
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error message */}
      {error && (
        // FIX: Replaced hardcoded red colors with semantic destructive classes
        <div className="bg-destructive/10 border border-destructive text-destructive-foreground rounded-md p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={prevStep} disabled={submitting}>
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting || submitted}
          className="flex items-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin w-4 h-4" /> Submitting...
            </>
          ) : submitted ? (
            <>
              {/* FIX: Used the chart success color variable for the icon */}
              <CheckCircle2 className="w-4 h-4 text-[--color-chart-2]" /> Submitted
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </div>
    </div>
  );
}
// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
// import { toast } from "sonner" // ✅ Shadcn toast hook
// export default function StepReview({ data, prevStep }) {
//   // ... (all your useState and handleSubmit logic remains IDENTICAL)
//   const [submitting, setSubmitting] = useState(false);
//   const [submitted, setSubmitted] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async () => {
//     // ... (submit logic is unchanged)
//     if (submitting || submitted) return;
//     try {
//       setSubmitting(true);
//       setError("");
//       const res = await fetch("/api/vendor/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       });
//       if (!res.ok) throw new Error("Submission failed");
//       setSubmitted(true);
//       toast.success("Registration Submitted ✅", {
//         description: "Please verify your email and wait for admin approval.",
//       });
//     } catch (err) {
//       setError("Something went wrong. Please try again later.");
//       toast.error("Submission Failed ❌", {
//         description: "Please check your connection and try again.",
//       });
//       console.error(err);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     // 
//     // ✅ CRITICAL FIX: 
//     // Removed 'min-h-screen overflow-y-auto p-6'
//     // Replaced with a simple 'space-y-6' wrapper.
//     //
//     <div className="space-y-6">
//       <h2 className="text-xl font-semibold text-center">
//         Review Your Information
//       </h2>

//       {/* Personal Info */}
//       <Card>
//         <CardContent className="p-4 space-y-2">
//           <h3 className="font-semibold text-lg">Personal Details</h3>
//           <p>
//             <strong>Full Name:</strong> {data.fullName}
//           </p>
//           {/* ... (rest of your review fields are unchanged) */}
//           <p>
//             <strong>Email:</strong> {data.email}
//           </p>
//           <p>
//             <strong>Phone:</strong> {data.phone}
//           </p>
//           <p>
//             <strong>CNIC:</strong> {data.cnic}
//           </p>
//         </CardContent>
//       </Card>

//       {/* Shop Info */}
//       <Card>
//         <CardContent className="p-4 space-y-2">
//           <h3 className="font-semibold text-lg">Shop Details</h3>
//           <p>
//             <strong>Shop Name:</strong> {data.shopName}
//           </p>
//           {/* ... (rest of your review fields are unchanged) */}
//           <p>
//             <strong>Type:</strong> {data.shopType}
//           </p>
//           <p>
//             <strong>Address:</strong> {data.shopAddress}
//           </p>
//           <p>
//             <strong>Location:</strong>{" "}
//             {data.shopLocation
//               ? `${data.shopLocation.lat}, ${data.shopLocation.lng}`
//               : "Not set"}
//           </p>
//         </CardContent>
//       </Card>

//       {/* Verification Documents */}
//       {data.verificationDocs && data.verificationDocs.length > 0 && (
//         <Card>
//           <CardContent className="p-4 space-y-2">
//             <h3 className="font-semibold text-lg">Verification Documents</h3>
//             {/* This grid layout you had is already good! */}
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//               {data.verificationDocs.map((doc, index) => (
//                 <div key={index} className="text-center">
//                   <p className="font-medium text-sm mb-1">{doc.docType}</p>
//                   <img
//                     src={doc.docURL}
//                     alt={doc.docType}
//                     className="rounded-md w-full h-32 object-cover border"
//                   />
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Error message */}
//       {error && (
//         <div className="bg-red-50 border border-red-400 text-red-600 rounded-md p-3 flex items-center gap-2">
//           <AlertCircle className="w-4 h-4" />
//           <span className="text-sm">{error}</span>
//         </div>
//       )}

//       {/* Buttons */}
//       <div className="flex justify-between mt-6">
//         <Button variant="outline" onClick={prevStep} disabled={submitting}>
//           Back
//         </Button>
//         <Button
//           onClick={handleSubmit}
//           disabled={submitting || submitted}
//           className="flex items-center gap-2"
//         >
//           {submitting ? (
//             <>
//               <Loader2 className="animate-spin w-4 h-4" /> Submitting...
//             </>
//           ) : submitted ? (
//             <>
//               <CheckCircle2 className="w-4 h-4 text-green-600" /> Submitted
//             </>
//           ) : (
//             "Submit"
//           )}
//         </Button>
//       </div>
//     </div>
//   );
// }
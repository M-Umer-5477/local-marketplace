"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // To redirect
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2, AlertCircle, MapPin, Store, User } from "lucide-react";
import { toast } from "sonner"; 

// Import your Modal Logic (We will build a simple inline version here for simplicity or reuse)
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function StepReview({ data, prevStep }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // OTP Verification State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);

  // 1. Submit Registration Data
  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/vendor/register", { // Ensure this matches your API route
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Submission failed");

      // Success: Open OTP Modal
      toast.success("Application Submitted!", {
        description: "We sent a verification code to your email.",
      });
      setShowOtpModal(true);

    } catch (err) {
      setError(err.message);
      toast.error("Submission Failed", { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Handle OTP Verification
  const handleVerifyOtp = async () => {
    setVerifying(true);
    try {
        const res = await fetch("/api/vendor/register/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: data.email, otp })
        });

        const result = await res.json();

        if(res.ok) {
            toast.success("Email Verified Successfully!");
            router.push("/vendor/register/applicationSuccess"); // Redirect to success page
        } else {
            toast.error(result.error || "Invalid OTP");
        }
    } catch (error) {
        toast.error("Verification failed");
    } finally {
        setVerifying(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Review & Submit</h2>
        <p className="text-muted-foreground">Please double check your details before submitting.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
          
          {/* Personal Info */}
          <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" /> Personal Details
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground font-medium">Name:</span>
                    <span className="col-span-2">{data.fullName}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground font-medium">Email:</span>
                    <span className="col-span-2 break-all">{data.email}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground font-medium">Phone:</span>
                    <span className="col-span-2">{data.phone}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground font-medium">CNIC:</span>
                    <span className="col-span-2">{data.cnic}</span>
                </div>
            </CardContent>
          </Card>

          {/* Shop Info */}
          <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Store className="h-5 w-5 text-primary" /> Shop Details
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground font-medium">Name:</span>
                    <span className="col-span-2">{data.shopName}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground font-medium">Type:</span>
                    <span className="col-span-2">{data.shopType}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground font-medium">Description:</span>
                    <span className="col-span-2 line-clamp-2">{data.shopDescription}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground font-medium">Address:</span>
                    <span className="col-span-2 line-clamp-2">{data.shopAddress}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground font-medium">Location:</span>
                    <span className="col-span-2 flex items-center gap-1 text-xs text-blue-600">
                        <MapPin className="h-3 w-3" />
                        {data.shopLocation ? "Coordinates Set" : "Not Set"}
                    </span>
                </div>
            </CardContent>
          </Card>
      </div>

      {/* Visual Assets */}
      <Card>
        <CardHeader className="pb-2">
            <CardTitle className="text-lg">Visual Identity</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
            <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Shop Logo</p>
                <div className="border rounded-lg overflow-hidden h-32 bg-muted flex items-center justify-center">
                    {data.shopLogo ? (
                        <img src={data.shopLogo} alt="Logo" className="h-full w-full object-cover" />
                    ) : <span className="text-xs text-muted-foreground">None</span>}
                </div>
            </div>
            <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Shop Banner</p>
                <div className="border rounded-lg overflow-hidden h-32 bg-muted flex items-center justify-center">
                    {data.shopBanner ? (
                        <img src={data.shopBanner} alt="Banner" className="h-full w-full object-cover" />
                    ) : <span className="text-xs text-muted-foreground">None</span>}
                </div>
            </div>
        </CardContent>
      </Card>

      {/* Verification Docs */}
      {data.verificationDocs && data.verificationDocs.length > 0 && (
        <Card>
            <CardHeader className="pb-2"><CardTitle className="text-lg">Documents</CardTitle></CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {data.verificationDocs.map((doc, idx) => (
                        <div key={idx} className="relative group border rounded-lg overflow-hidden h-24 bg-muted">
                            <img src={doc.docURL} alt={doc.docType} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 text-center truncate">
                                {doc.docType}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/50 text-destructive rounded-lg p-3 flex items-center gap-2 text-sm font-medium animate-pulse">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={prevStep} disabled={submitting}>
          Back
        </Button>
        <Button 
            onClick={handleSubmit} 
            disabled={submitting} 
            className="min-w-[140px] shadow-lg hover:shadow-xl transition-all"
        >
          {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Processing</> : "Submit Application"}
        </Button>
      </div>

      {/* --- OTP VERIFICATION MODAL --- */}
      <Dialog open={showOtpModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
                <DialogTitle className="text-center text-xl">Verify Email Address</DialogTitle>
                <DialogDescription className="text-center">
                    We sent a 6-digit code to <strong>{data.email}</strong>. Enter it below to complete your application.
                </DialogDescription>
            </DialogHeader>
            
            <div className="flex justify-center py-4">
                <Input 
                    className="text-center text-3xl tracking-[0.5em] font-bold h-14 w-full border-primary/30 bg-primary/5 focus:border-primary" 
                    placeholder="000000" 
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                    autoFocus
                />
            </div>

            <Button onClick={handleVerifyOtp} className="w-full" disabled={verifying || otp.length < 6}>
                {verifying ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Verify & Finish"}
            </Button>
        </DialogContent>
      </Dialog>

    </div>
  );
}
// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
// } from "@/components/ui/card";
// import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
// import { toast } from "sonner"; 

// export default function StepReview({ data, prevStep }) {
//   const [submitting, setSubmitting] = useState(false);
//   const [submitted, setSubmitted] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async () => {
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
//     <div className="space-y-6">
//       <h2 className="text-xl font-semibold text-center text-foreground">
//         Review Your Information
//       </h2>

//       {/* Personal Info */}
//       <Card>
//         <CardContent className="p-4 space-y-2 text-foreground">
//           <h3 className="font-semibold text-lg">Personal Details</h3>
//           <p className="text-muted-foreground">
//             <strong>Full Name:</strong> <span className="text-foreground">{data.fullName}</span>
//           </p>
//           <p className="text-muted-foreground">
//             <strong>Email:</strong> <span className="text-foreground">{data.email}</span>
//           </p>
//           <p className="text-muted-foreground">
//             <strong>Phone:</strong> <span className="text-foreground">{data.phone}</span>
//           </p>
//           <p className="text-muted-foreground">
//             <strong>CNIC:</strong> <span className="text-foreground">{data.cnic}</span>
//           </p>
//         </CardContent>
//       </Card>

//       {/* Shop Info */}
//       <Card>
//         <CardContent className="p-4 space-y-2 text-foreground">
//           <h3 className="font-semibold text-lg">Shop Details</h3>
//           <p className="text-muted-foreground">
//             <strong>Shop Name:</strong> <span className="text-foreground">{data.shopName}</span>
//           </p>
//           <p className="text-muted-foreground">
//             <strong>Type:</strong> <span className="text-foreground">{data.shopType}</span>
//           </p>
//           <p className="text-muted-foreground">
//             <strong>Address:</strong> <span className="text-foreground">{data.shopAddress}</span>
//           </p>
//           <p className="text-muted-foreground">
//             <strong>Location:</strong>{" "}
//             {data.shopLocation
//               ? <span className="text-foreground">{`${data.shopLocation.lat}, ${data.shopLocation.lng}`}</span>
//               : "Not set"}
//           </p>

//           {/* --- Added Shop Banner Display --- */}
//           {data.shopBanner ? (
//             <div className="mt-4 pt-2 border-t border-border">
//               <p className="text-sm font-medium mb-2 text-muted-foreground">Shop Banner</p>
//               <div className="rounded-md overflow-hidden border border-border w-full max-w-sm">
//                 <img 
//                   src={data.shopBanner} 
//                   alt="Shop Banner" 
//                   className="w-full h-48 object-cover"
//                 />
//               </div>
//             </div>
//           ) : (
//             <p className="text-muted-foreground mt-2">
//               <strong>Shop Banner:</strong> <span className="text-destructive">Not uploaded</span>
//             </p>
//           )}
//            {data.shopLogo ? (
//             <div className="mt-4 pt-2 border-t border-border">
//               <p className="text-sm font-medium mb-2 text-muted-foreground">Shop Logo</p>
//               <div className="rounded-md overflow-hidden border border-border w-full max-w-sm">
//                 <img 
//                   src={data.shopLogo} 
//                   alt="Shop Logo" 
//                   className="w-full h-48 object-cover"
//                 />
//               </div>
//             </div>
//           ) : (
//             <p className="text-muted-foreground mt-2">
//               <strong>Shop Logo:</strong> <span className="text-destructive">Not uploaded</span>
//             </p>
//           )}
//         </CardContent>
//       </Card>

//       {/* Verification Documents */}
//       {data.verificationDocs && data.verificationDocs.length > 0 && (
//         <Card>
//           <CardContent className="p-4 space-y-2">
//             <h3 className="font-semibold text-lg text-foreground">Verification Documents</h3>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//               {data.verificationDocs.map((doc, index) => (
//                 <div key={index} className="text-center">
//                   <p className="font-medium text-sm mb-1 text-foreground">{doc.docType}</p>
//                   <img
//                     src={doc.docURL}
//                     alt={doc.docType}
//                     className="rounded-md w-full h-32 object-cover border border-border" 
//                   />
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Error message */}
//       {error && (
//         <div className="bg-destructive/10 border border-destructive text-destructive-foreground rounded-md p-3 flex items-center gap-2">
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
//               <CheckCircle2 className="w-4 h-4 text-green-500" /> Submitted
//             </>
//           ) : (
//             "Submit"
//           )}
//         </Button>
//       </div>
//     </div>
//   );
// }

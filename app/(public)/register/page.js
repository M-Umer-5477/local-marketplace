"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react"; 
import { toast } from "sonner";
import Link from "next/link"; // Added Link import

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState('idle'); // 'idle', 'submitting', 'success'
  
  // State for the resend button
  const [resent, setResent] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // A single, cleaner handler for all inputs
  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [id]: value }));
  };

  // Optimized submit handler with robust state management
  async function handleSubmit(e) {
    e.preventDefault();
    if (submissionStatus === 'submitting' || submissionStatus === 'success') return;

    setSubmissionStatus('submitting');
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      // Handle success
      toast.success("Registration Submitted ✅", {
        description: "Please check your email to verify your account.",
      });
      setSubmissionStatus('success');

    } catch (err) {
      // Handle failure
      const errorMessage = err.message;
      setError(errorMessage);
      toast.error("Registration Failed ❌", {
        description: errorMessage,
      });
      setSubmissionStatus('idle'); // Allow user to try again
    }
  }
  
  // Optimized resend function with its own loading state
  async function resendVerification() {
    if (isResending) return;
    setIsResending(true);

    try {
        const res = await fetch("/api/auth/register/resend-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: form.email }),
        });
        
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Failed to resend email.");
        }

        toast.success("Verification email sent!", {
            description: "Please check your inbox."
        });
        setResent(true);

    } catch (err) {
        toast.error("Error", {
            description: err.message,
        });
    } finally {
        setIsResending(false);
    }
  }

  return (
    // FIX: Moved the comment inside the component's render logic, 
    // ensuring the <div> is the first element after the return (
    <div className="flex justify-center items-center h-full my-2 p-4 bg-background">
      
      {/* Card inherits theme colors (bg-card, text-card-foreground) automatically */}
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <p className="text-muted-foreground text-sm">
            Quickly register to start selling or shopping on ShopSync.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name Input */}
            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Bilal Doe" value={form.name} onChange={handleChange} required />
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>

            {/* Phone Input */}
            <div className="space-y-1">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+92 300 1234567" value={form.phone} onChange={handleChange} required />
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
            </div>

            {/* Submit Button with Loading/Success States */}
            <Button type="submit" className="w-full flex items-center gap-2" disabled={submissionStatus === 'submitting' || submissionStatus === 'success'}>
              {submissionStatus === 'submitting' ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" /> Submitting...
                </>
              ) : submissionStatus === 'success' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Submitted!
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            {/* Error Message Alert */}
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Registration Error</AlertTitle>
                <AlertDescription className="flex items-center justify-between">
                  {error}
                  {error.includes("not verified") && !resent && (
                    <Button
                      onClick={resendVerification}
                      type="button"
                      variant="link"
                      disabled={isResending}
                      className="p-0 h-auto ml-2 text-sm text-destructive-foreground underline"
                    >
                      {isResending ? <Loader2 className="w-4 h-4 animate-spin"/> : "Resend"}
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Link to Login */}
            <p className="text-muted-foreground text-sm text-center pt-2">
              Already have an account?{" "}
              <Link href="/login" passHref>
                <Button variant="link" className="p-0 h-auto text-primary">Sign In</Button>
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
// "use client";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react"; // <-- Added loader icons
// import { toast } from "sonner";

// export default function RegisterPage() {
//   const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
//   const [error, setError] = useState("");
//   const [submissionStatus, setSubmissionStatus] = useState('idle'); // 'idle', 'submitting', 'success'
  
//   // State for the resend button
//   const [resent, setResent] = useState(false);
//   const [isResending, setIsResending] = useState(false);

//   // ✅ 1. A single, cleaner handler for all inputs
//   const handleChange = (e) => {
//     const { id, value } = e.target;
//     setForm((prevForm) => ({ ...prevForm, [id]: value }));
//   };

//   // ✅ 2. Optimized submit handler with robust state management
//   async function handleSubmit(e) {
//     e.preventDefault();
//     if (submissionStatus === 'submitting' || submissionStatus === 'success') return;

//     setSubmissionStatus('submitting');
//     setError("");

//     try {
//       const res = await fetch("/api/auth/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         // Throw an error to be caught by the catch block
//         throw new Error(data.error || "Something went wrong.");
//       }

//       // Handle success
//       toast.success("Registration Submitted ✅", {
//         description: "Please check your email to verify your account.",
//       });
//       setSubmissionStatus('success');

//     } catch (err) {
//       // Handle failure
//       const errorMessage = err.message;
//       setError(errorMessage);
//       toast.error("Registration Failed ❌", {
//         description: errorMessage,
//       });
//       setSubmissionStatus('idle'); // Allow user to try again
//     }
//   }
  
//   // ✅ 3. Optimized resend function with its own loading state
//   async function resendVerification() {
//     if (isResending) return;
//     setIsResending(true);

//     try {
//         const res = await fetch("/api/auth/register/resend-email", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ email: form.email }),
//         });
        
//         const data = await res.json();

//         if (!res.ok) {
//             throw new Error(data.error || "Failed to resend email.");
//         }

//         toast.success("Verification email sent!", {
//             description: "Please check your inbox."
//         });
//         setResent(true);

//     } catch (err) {
//         toast.error("Error", {
//             description: err.message,
//         });
//     } finally {
//         setIsResending(false);
//     }
//   }

//   return (
//     <div className="flex justify-center items-center h-full my-7 p-4 bg-gray-50 dark:bg-gray-900">
//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle className="text-2xl">Create Account</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
            
//             {/* Name Input */}
//             <div className="space-y-1">
//               <Label htmlFor="name">Full Name</Label>
//               <Input id="name" placeholder="Bilal Doe" value={form.name} onChange={handleChange} required />
//             </div>

//             {/* Email Input */}
//             <div className="space-y-1">
//               <Label htmlFor="email">Email Address</Label>
//               <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
//             </div>

//             {/* Phone Input */}
//             <div className="space-y-1">
//               <Label htmlFor="phone">Phone Number</Label>
//               <Input id="phone" type="tel" placeholder="+92 300 1234567" value={form.phone} onChange={handleChange} required />
//             </div>

//             {/* Password Input */}
//             <div className="space-y-1">
//               <Label htmlFor="password">Password</Label>
//               <Input id="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
//             </div>

//             {/* ✅ 4. Submit Button with Loading/Success States */}
//             <Button type="submit" className="w-full flex items-center gap-2" disabled={submissionStatus === 'submitting' || submissionStatus === 'success'}>
//               {submissionStatus === 'submitting' ? (
//                 <>
//                   <Loader2 className="animate-spin w-4 h-4" /> Submitting...
//                 </>
//               ) : submissionStatus === 'success' ? (
//                 <>
//                   <CheckCircle2 className="w-4 h-4" /> Submitted!
//                 </>
//               ) : (
//                 "Create Account"
//               )}
//             </Button>

//             {/* Error Message Alert */}
//             {error && (
//               <Alert variant="destructive" className="mt-4">
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertTitle>Registration Error</AlertTitle>
//                 <AlertDescription className="flex items-center justify-between">
//                   {error}
//                   {error.includes("not verified") && !resent && (
//                     <Button
//                       onClick={resendVerification}
//                       type="button"
//                       variant="link"
//                       disabled={isResending}
//                       className="p-0 h-auto ml-2 text-sm text-red-100 underline"
//                     >
//                       {isResending ? <Loader2 className="w-4 h-4 animate-spin"/> : "Resend"}
//                     </Button>
//                   )}
//                 </AlertDescription>
//               </Alert>
//             )}
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
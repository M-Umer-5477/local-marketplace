"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react"; // Import NextAuth
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, Mail } from "lucide-react";

// ShadCN UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function RegisterPage() {
  const router = useRouter();
  
  // State Management
  const [step, setStep] = useState(1); // 1 = Details Form, 2 = OTP Form
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Data
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [otp, setOtp] = useState("");

  // Handle Input Change
  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  // --- STEP 1: REGISTER & SEND OTP ---
  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast.success("OTP Sent", {
        description: `We sent a 6-digit code to ${form.email}`,
      });
      setStep(2); // Move to OTP Step

    } catch (err) {
      setError(err.message);
      toast.error("Error", { description: err.message });
    } finally {
      setLoading(false);
    }
  }

  // --- STEP 2: VERIFY OTP & AUTO-LOGIN ---
  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Verify Code
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid verification code");
      }

      toast.success("Account Verified!", { description: "Logging you in..." });

      // 2. Auto Login
      const loginRes = await signIn("credentials", {
        redirect: false,
        identifier: form.email, // Use 'identifier' to match NextAuth config
        password: form.password,
      });

      if (loginRes?.ok) {
        // Get session to check role and redirect accordingly
        const session = await fetch("/api/auth/session").then(r => r.json());
        
        if (session?.user?.role === "seller") {
          router.push("/vendor/dashboard");
        } else if (session?.user?.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          // Customer - redirect to dashboard
          router.push("/dashboard");
        }
      } else {
        // Fallback if login fails but verification worked
        router.push("/login");
        toast.info("Please login with your new account.");
      }

    } catch (err) {
      setError(err.message);
      toast.error("Verification Failed", { description: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] p-4 bg-background">
      <Card className="w-full max-w-md shadow-lg border-border/60">
        
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {step === 1 ? "Create Account" : "Verify Email"}
          </CardTitle>
          <CardDescription>
            {step === 1 
              ? "Enter your details to start shopping" 
              : `Enter the 6-digit code sent to ${form.email}`
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === 1 ? (
            /* =======================
               VIEW 1: DETAILS FORM 
               ======================= */
            <form onSubmit={handleRegister} className="space-y-4">
              
              <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" value={form.name} onChange={handleChange} required />
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="name@example.com" value={form.email} onChange={handleChange} required />
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" placeholder="0300 1234567" value={form.phone} onChange={handleChange} required />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : (
                    <span className="flex items-center">
                        Next Step <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground pt-2">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign In
                </Link>
              </div>
            </form>
          ) : (
            /* =======================
               VIEW 2: OTP FORM 
               ======================= */
            <form onSubmit={handleVerify} className="space-y-6 animate-in fade-in slide-in-from-right-4">
              
              <div className="space-y-4">
                <div className="flex justify-center py-4">
                    <div className="bg-primary/10 p-4 rounded-full">
                        <Mail className="h-8 w-8 text-primary" />
                    </div>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="otp" className="sr-only">OTP Code</Label>
                    <Input 
                        id="otp"
                        className="text-center text-3xl tracking-[0.5em] font-bold h-14 border-primary/30 focus:border-primary bg-primary/5" 
                        placeholder="000000" 
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                        autoFocus
                    />
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Verification Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                    <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" /> Verifying...
                    </>
                ) : (
                    <>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Verify & Login
                    </>
                )}
              </Button>

              <button 
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground hover:underline"
              >
                Wrong email? Go back
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

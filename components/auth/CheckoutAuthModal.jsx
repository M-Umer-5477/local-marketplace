"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, Phone, CheckCircle2, ArrowRight } from "lucide-react";

// ShadCN UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function CheckoutAuthModal({ children }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);

  // --- Registration State ---
  // Tracks if we are in "Form Mode" or "OTP Mode"
  const [needsVerification, setNeedsVerification] = useState(false);
  
  // Stores form data
  const [regData, setRegData] = useState({ name: "", email: "", password: "", phone: "" });
  const [otp, setOtp] = useState("");

  // ----------------------------------------------------
  // 1. HANDLE LOGIN
  // ----------------------------------------------------
 const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const email = e.target.email.value;
    const password = e.target.password.value;
    
    // FIX: Change 'email' to 'identifier' to match your NextAuth config
    const res = await signIn("credentials", {
      redirect: false,
      identifier: email, // <--- CHANGED THIS
      password,
    });

    setLoading(false);

    if (res?.error) {
      toast.error("Invalid email or password");
    } else {
      toast.success("Welcome back!");
      setOpen(false); 
      // window.location.reload(); 
    }
  };
  // ----------------------------------------------------
  // 2. HANDLE REGISTER (Sends OTP)
  // ----------------------------------------------------
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call your Register API
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("OTP sent to your email!");
        setNeedsVerification(true); // SWITCH UI TO OTP SCREEN
      } else {
        toast.error(data.error || "Registration failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // 3. HANDLE VERIFY & AUTO-LOGIN
  // ----------------------------------------------------
 

 const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regData.email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Email Verified!");
        
        // FIX: Change 'email' to 'identifier' here too
        const loginRes = await signIn("credentials", {
          redirect: false,
          identifier: regData.email, // <--- CHANGED THIS
          password: regData.password,
        });

        if (loginRes?.ok) {
            setOpen(false); 
          //window.location.reload(); 
        } else {
            toast.error("Verification successful, please login manually.");
            setNeedsVerification(false);
            setActiveTab("login");
        }

      } else {
        toast.error(data.error || "Invalid OTP");
      }
    } catch (error) {
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold tracking-tight">
            {needsVerification ? "Check your Email" : "Welcome to ShopSync"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {needsVerification 
              ? `We sent a 6-digit code to ${regData.email}` 
              : "Login or create an account to place your order."}
          </DialogDescription>
        </DialogHeader>

        {needsVerification ? (
          /* =======================================
             VIEW B: OTP VERIFICATION FORM 
             ======================================= */
          <form onSubmit={handleVerify} className="space-y-6 pt-2 animate-in fade-in slide-in-from-right-4">
             <div className="space-y-2">
                <Label className="text-center block text-muted-foreground">Enter Verification Code</Label>
                <div className="flex justify-center">
                    <Input 
                      className="text-center text-3xl tracking-[0.5em] font-bold h-14 w-full border-primary/50 bg-primary/5" 
                      placeholder="000000" 
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))} // Only numbers
                      autoFocus
                    />
                </div>
             </div>
             <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Verify & Login
             </Button>
             
             <button 
                type="button"
                onClick={() => setNeedsVerification(false)}
                className="w-full text-center text-sm text-muted-foreground hover:text-primary hover:underline"
             >
                Wrong email? Go back
             </button>
          </form>
        ) : (
          /* =======================================
             VIEW A: LOGIN / REGISTER TABS 
             ======================================= */
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>

            {/* --- LOGIN FORM --- */}
            <TabsContent value="login" className="space-y-4 pt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                     <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                     <Input name="email" type="email" placeholder="name@example.com" className="pl-9" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                     <Label>Password</Label>
                     <span className="text-xs text-primary cursor-pointer hover:underline">Forgot?</span>
                  </div>
                  <div className="relative">
                     <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                     <Input name="password" type="password" className="pl-9" required />
                  </div>
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : "Login to Continue"}
                </Button>
              </form>
            </TabsContent>

            {/* --- REGISTER FORM --- */}
            <TabsContent value="register" className="space-y-4 pt-4">
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="space-y-2">
                    <Label>Full Name</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                            className="pl-9"
                            placeholder="John Doe"
                            value={regData.name} 
                            onChange={(e)=>setRegData({...regData, name: e.target.value})} 
                            required 
                        />
                    </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                            type="email" 
                            className="pl-9"
                            placeholder="john@example.com"
                            value={regData.email} 
                            onChange={(e)=>setRegData({...regData, email: e.target.value})} 
                            required 
                        />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                            className="pl-9"
                            placeholder="0300 1234567"
                            value={regData.phone} 
                            onChange={(e)=>setRegData({...regData, phone: e.target.value})} 
                            required 
                        />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Create Password</Label>
                  <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                            type="password" 
                            className="pl-9"
                            value={regData.password} 
                            onChange={(e)=>setRegData({...regData, password: e.target.value})} 
                            required 
                        />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : (
                      <span className="flex items-center">
                          Create Account <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
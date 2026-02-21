"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation"; 
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, Phone, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function CheckoutAuthModal({ children }) {
  const router = useRouter(); 
  const [open, setOpen] = useState(false);
  
  // VIEWS: 'LOGIN' | 'REGISTER' | 'VERIFY_REG' | 'FORGOT_EMAIL' | 'RESET_PASS'
  const [view, setView] = useState("LOGIN"); 
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [foundModel, setFoundModel] = useState("User"); 

  // --- Helper to Route Based on Role ---
  const routeUserAfterLogin = async () => {
      try {
          const sessionRes = await fetch('/api/auth/session');
          const sessionData = await sessionRes.json();
          
          if (sessionData?.user?.role === 'seller') {
              router.push('/vendor/dashboard'); // Change this if your URL is different
          }else if (sessionData?.user?.role === 'admin') {
              router.push('/admin/dashboard'); // Change this if your URL is different
          }  
          else {
              router.refresh(); 
          }
      } catch (error) {
          router.refresh(); // Fallback
      }
  };

  // --- 1. HANDLE LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await signIn("credentials", {
      redirect: false,
      identifier: formData.email,
      password: formData.password,
    });

    if (res?.error) {
      setLoading(false);
      toast.error("Invalid email or password");
    } else {
      toast.success("Welcome back!");
      setOpen(false);
      await routeUserAfterLogin(); // ✅ Use Helper
      setLoading(false);
    }
  };

  // --- 2. HANDLE REGISTER ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("OTP sent to your email!");
        setOtp(""); 
        setView("VERIFY_REG");
      } else {
        toast.error(data.error || "Registration failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. HANDLE REGISTRATION VERIFICATION ---
  const handleVerifyReg = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", { 
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ email: formData.email, otp }),
      });

      if (res.ok) {
        toast.success("Verified! Logging you in...");
        await signIn("credentials", { 
            redirect: false, 
            identifier: formData.email, 
            password: formData.password 
        });
        setOpen(false);
        await routeUserAfterLogin(); // ✅ Use Helper
      } else {
        toast.error("Invalid OTP");
      }
    } catch (error) {
      toast.error("Error verifying");
    } finally {
      setLoading(false);
    }
  };

  // --- 4. FORGOT PASSWORD FLOW ---
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Code sent to email");
        if(data.model) setFoundModel(data.model);
        setOtp(""); 
        setView("RESET_PASS");
      }
    } catch(e) { toast.error("Request failed"); }
    finally { setLoading(false); }
  };

  // --- 5. RESET PASSWORD & AUTO-LOGIN ---
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ 
          email: formData.email, 
          otp, 
          newPassword,
          model: foundModel 
        }),
      });
      
      if (res.ok) {
        toast.success("Password Updated! Logging in...");
        await signIn("credentials", { 
            redirect: false, 
            identifier: formData.email, 
            password: newPassword 
        });
        
        setOpen(false);
        await routeUserAfterLogin(); // ✅ Use Helper
      } else {
        toast.error("Invalid Code or Expired");
      }
    } catch(e) { toast.error("Failed"); }
    finally { setLoading(false); }
  };

  // Reset View when closing
  const resetView = () => {
     setView("LOGIN");
     setActiveTab("login");
     setOtp("");
     setNewPassword("");
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) resetView(); }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {view === "LOGIN" && "Welcome Back"}
            {view === "REGISTER" && "Create Account"}
            {view === "VERIFY_REG" && "Verify Email"}
            {view === "FORGOT_EMAIL" && "Reset Password"}
            {view === "RESET_PASS" && "New Password"}
          </DialogTitle>
          <DialogDescription className="text-center">
             {view === "VERIFY_REG" || view === "RESET_PASS" 
                ? `Enter the code sent to ${formData.email}` 
                : "Securely access your account."}
          </DialogDescription>
        </DialogHeader>

        {/* ================= VIEW 1: LOGIN / REGISTER TABS ================= */}
        {(view === "LOGIN" || view === "REGISTER") && (
           <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setView(v === "login" ? "LOGIN" : "REGISTER"); }} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>

            {/* LOGIN FORM */}
            <TabsContent value="login" className="space-y-4 pt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                     <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                     <Input 
                        name="email" 
                        placeholder="name@example.com" 
                        value={formData.email} 
                        onChange={e=>setFormData({...formData, email: e.target.value})} 
                        className="pl-9" 
                        required 
                     />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                     <Label>Password</Label>
                     <span onClick={() => setView("FORGOT_EMAIL")} className="text-xs text-primary cursor-pointer hover:underline font-medium">
                        Forgot Password?
                     </span>
                  </div>
                  <div className="relative">
                     <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                     <Input 
                        type="password" 
                        name="password" 
                        placeholder="••••••••" 
                        value={formData.password} 
                        onChange={e=>setFormData({...formData, password: e.target.value})} 
                        className="pl-9" 
                        required 
                     />
                  </div>
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : "Login"}
                </Button>
              </form>
            </TabsContent>

            {/* REGISTER FORM */}
            <TabsContent value="register" className="space-y-4 pt-4">
              <form onSubmit={handleRegister} className="space-y-3">
                 <div className="space-y-2">
                    <Label>Full Name</Label>
                    <div className="relative">
                       <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                       <Input 
                          placeholder="John Doe" 
                          value={formData.name} 
                          onChange={e=>setFormData({...formData, name: e.target.value})} 
                          className="pl-9" 
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
                          placeholder="john@example.com" 
                          value={formData.email} 
                          onChange={e=>setFormData({...formData, email: e.target.value})} 
                          className="pl-9" 
                          required 
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <div className="relative">
                       <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                       <Input 
                          placeholder="0300 1234567" 
                          value={formData.phone} 
                          onChange={e=>setFormData({...formData, phone: e.target.value})} 
                          className="pl-9" 
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
                          placeholder="Min 6 characters" 
                          value={formData.password} 
                          onChange={e=>setFormData({...formData, password: e.target.value})} 
                          className="pl-9" 
                          required 
                       />
                    </div>
                 </div>
                 <Button type="submit" className="w-full" size="lg" disabled={loading}>
                   {loading ? <Loader2 className="animate-spin" /> : "Create Account"}
                 </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}

        {/* ================= VIEW 2: VERIFY REGISTRATION ================= */}
        {view === "VERIFY_REG" && (
           <form onSubmit={handleVerifyReg} className="space-y-6 pt-2">
              <div className="flex justify-center">
                 <Input 
                   className="text-center text-3xl tracking-[0.5em] font-bold h-14 w-full border-primary/20 bg-primary/5 focus-visible:ring-primary" 
                   placeholder="000000" 
                   maxLength={6}
                   value={otp} onChange={(e) => setOtp(e.target.value)}
                   autoFocus
                 />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                 {loading ? <Loader2 className="animate-spin" /> : "Verify & Login"}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setView("REGISTER")}>Back</Button>
           </form>
        )}

        {/* ================= VIEW 3: FORGOT PASSWORD ================= */}
        {view === "FORGOT_EMAIL" && (
           <form onSubmit={handleForgotSubmit} className="space-y-4 pt-2">
              <div className="relative">
                 <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                 <Input 
                    placeholder="Enter your registered email" 
                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    className="pl-9"
                    required 
                 />
              </div>
              <Button className="w-full" size="lg" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : "Send Reset Code"}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setView("LOGIN")}>
                 <ArrowLeft className="w-4 h-4 mr-2"/> Back to Login
              </Button>
           </form>
        )}

        {/* ================= VIEW 4: RESET PASSWORD ================= */}
        {view === "RESET_PASS" && (
           <form onSubmit={handleResetSubmit} className="space-y-5 pt-2">
              <div className="space-y-2">
                 <Label className="text-center block text-muted-foreground">Verification Code</Label>
                 <Input 
                    className="text-center text-3xl tracking-[0.5em] font-bold h-14 w-full border-primary/20 bg-primary/5 focus-visible:ring-primary"
                    placeholder="000000" 
                    value={otp} onChange={(e) => setOtp(e.target.value)} 
                    maxLength={6}
                    autoFocus
                 />
              </div>
              
              <div className="space-y-2">
                 <Label>New Password</Label>
                 <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                       type="password"
                       placeholder="Enter new password" 
                       value={newPassword} onChange={(e) => setNewPassword(e.target.value)} 
                       className="pl-9"
                       required
                    />
                 </div>
              </div>

              <Button className="w-full" size="lg" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : "Update & Login"}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setView("FORGOT_EMAIL")}>Back</Button>
           </form>
        )}

      </DialogContent>
    </Dialog>
  );
}
// "use client";

// import { useState } from "react";
// import { signIn } from "next-auth/react";
// import { useRouter } from "next/navigation"; // ✅ Use Router for smooth updates
// import { toast } from "sonner";
// import { Loader2, Mail, Lock, User, Phone, CheckCircle2, ArrowLeft } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogTrigger,
// } from "@/components/ui/dialog";

// export default function CheckoutAuthModal({ children }) {
//   const router = useRouter(); // ✅ Initialize Router
//   const [open, setOpen] = useState(false);
  
//   // VIEWS: 'LOGIN' | 'REGISTER' | 'VERIFY_REG' | 'FORGOT_EMAIL' | 'RESET_PASS'
//   const [view, setView] = useState("LOGIN"); 
//   const [activeTab, setActiveTab] = useState("login");
//   const [loading, setLoading] = useState(false);

//   // Form Data
//   const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });
//   const [otp, setOtp] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [foundModel, setFoundModel] = useState("User"); 

//   // --- 1. HANDLE LOGIN ---
//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     const res = await signIn("credentials", {
//       redirect: false,
//       identifier: formData.email,
//       password: formData.password,
//     });
    
//     setLoading(false);

//     if (res?.error) {
//       toast.error("Invalid email or password");
//     } else {
//       toast.success("Welcome back!");
//       setOpen(false);
//       router.refresh(); // ✅ Smooth Session Update
//     }
//   };

//   // --- 2. HANDLE REGISTER ---
//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const res = await fetch("/api/auth/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });
//       const data = await res.json();

//       if (res.ok) {
//         toast.success("OTP sent to your email!");
//         setOtp(""); // Clear any previous OTP
//         setView("VERIFY_REG");
//       } else {
//         toast.error(data.error || "Registration failed");
//       }
//     } catch (error) {
//       toast.error("Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- 3. HANDLE REGISTRATION VERIFICATION ---
//   const handleVerifyReg = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       // 1. Verify OTP
//       const res = await fetch("/api/auth/verify-otp", { // Ensure you have this route or logic
//          method: "POST",
//          headers: { "Content-Type": "application/json" },
//          body: JSON.stringify({ email: formData.email, otp }),
//       });

//       if (res.ok) {
//         // 2. Auto Login on Success
//         toast.success("Verified! Logging you in...");
//         await signIn("credentials", { 
//             redirect: false, 
//             identifier: formData.email, 
//             password: formData.password 
//         });
//         setOpen(false);
//         router.refresh(); // ✅ Smooth Update
//       } else {
//         toast.error("Invalid OTP");
//       }
//     } catch (error) {
//       toast.error("Error verifying");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- 4. FORGOT PASSWORD FLOW ---
//   const handleForgotSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const res = await fetch("/api/auth/forgot-password", {
//         method: "POST",
//         body: JSON.stringify({ email: formData.email }),
//       });
//       const data = await res.json();
//       if (data.success) {
//         toast.success("Code sent to email");
//         if(data.model) setFoundModel(data.model);
//         setOtp(""); // Clear OTP for input
//         setView("RESET_PASS");
//       }
//     } catch(e) { toast.error("Request failed"); }
//     finally { setLoading(false); }
//   };

//   // --- 5. RESET PASSWORD & AUTO-LOGIN ---
//   const handleResetSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const res = await fetch("/api/auth/reset-password", {
//         method: "POST",
//         body: JSON.stringify({ 
//           email: formData.email, 
//           otp, 
//           newPassword,
//           model: foundModel 
//         }),
//       });
      
//       if (res.ok) {
//         toast.success("Password Updated! Logging in...");
        
//         // ✅ AUTO LOGIN WITH NEW PASSWORD
//         await signIn("credentials", { 
//             redirect: false, 
//             identifier: formData.email, 
//             password: newPassword 
//         });
        
//         setOpen(false);
//         router.refresh();
//       } else {
//         toast.error("Invalid Code or Expired");
//       }
//     } catch(e) { toast.error("Failed"); }
//     finally { setLoading(false); }
//   };

//   // Reset View when closing
//   const resetView = () => {
//      setView("LOGIN");
//      setActiveTab("login");
//      setOtp("");
//      setNewPassword("");
//   }

//   return (
//     <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) resetView(); }}>
//       <DialogTrigger asChild>
//         {children}
//       </DialogTrigger>
      
//       <DialogContent className="sm:max-w-[400px]">
//         <DialogHeader>
//           <DialogTitle className="text-center text-2xl font-bold">
//             {view === "LOGIN" && "Welcome Back"}
//             {view === "REGISTER" && "Create Account"}
//             {view === "VERIFY_REG" && "Verify Email"}
//             {view === "FORGOT_EMAIL" && "Reset Password"}
//             {view === "RESET_PASS" && "New Password"}
//           </DialogTitle>
//           <DialogDescription className="text-center">
//              {view === "VERIFY_REG" || view === "RESET_PASS" 
//                 ? `Enter the code sent to ${formData.email}` 
//                 : "Securely access your account."}
//           </DialogDescription>
//         </DialogHeader>

//         {/* ================= VIEW 1: LOGIN / REGISTER TABS ================= */}
//         {(view === "LOGIN" || view === "REGISTER") && (
//            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setView(v === "login" ? "LOGIN" : "REGISTER"); }} className="w-full">
//             <TabsList className="grid w-full grid-cols-2">
//               <TabsTrigger value="login">Login</TabsTrigger>
//               <TabsTrigger value="register">Sign Up</TabsTrigger>
//             </TabsList>

//             {/* LOGIN FORM */}
//             <TabsContent value="login" className="space-y-4 pt-4">
//               <form onSubmit={handleLogin} className="space-y-4">
//                 <div className="space-y-2">
//                   <Label>Email</Label>
//                   <div className="relative">
//                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                      <Input 
//                         name="email" 
//                         placeholder="name@example.com" 
//                         value={formData.email} 
//                         onChange={e=>setFormData({...formData, email: e.target.value})} 
//                         className="pl-9" 
//                         required 
//                      />
//                   </div>
//                 </div>
//                 <div className="space-y-2">
//                   <div className="flex justify-between items-center">
//                      <Label>Password</Label>
//                      <span onClick={() => setView("FORGOT_EMAIL")} className="text-xs text-primary cursor-pointer hover:underline font-medium">
//                         Forgot Password?
//                      </span>
//                   </div>
//                   <div className="relative">
//                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                      <Input 
//                         type="password" 
//                         name="password" 
//                         placeholder="••••••••" 
//                         value={formData.password} 
//                         onChange={e=>setFormData({...formData, password: e.target.value})} 
//                         className="pl-9" 
//                         required 
//                      />
//                   </div>
//                 </div>
//                 <Button type="submit" className="w-full" size="lg" disabled={loading}>
//                   {loading ? <Loader2 className="animate-spin" /> : "Login"}
//                 </Button>
//               </form>
//             </TabsContent>

//             {/* REGISTER FORM */}
//             <TabsContent value="register" className="space-y-4 pt-4">
//               <form onSubmit={handleRegister} className="space-y-3">
//                  <div className="space-y-2">
//                     <Label>Full Name</Label>
//                     <div className="relative">
//                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                        <Input 
//                           placeholder="John Doe" 
//                           value={formData.name} 
//                           onChange={e=>setFormData({...formData, name: e.target.value})} 
//                           className="pl-9" 
//                           required 
//                        />
//                     </div>
//                  </div>
//                  <div className="space-y-2">
//                     <Label>Email Address</Label>
//                     <div className="relative">
//                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                        <Input 
//                           type="email" 
//                           placeholder="john@example.com" 
//                           value={formData.email} 
//                           onChange={e=>setFormData({...formData, email: e.target.value})} 
//                           className="pl-9" 
//                           required 
//                        />
//                     </div>
//                  </div>
//                  <div className="space-y-2">
//                     <Label>Phone Number</Label>
//                     <div className="relative">
//                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                        <Input 
//                           placeholder="0300 1234567" 
//                           value={formData.phone} 
//                           onChange={e=>setFormData({...formData, phone: e.target.value})} 
//                           className="pl-9" 
//                           required 
//                        />
//                     </div>
//                  </div>
//                  <div className="space-y-2">
//                     <Label>Create Password</Label>
//                     <div className="relative">
//                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                        <Input 
//                           type="password" 
//                           placeholder="Min 6 characters" 
//                           value={formData.password} 
//                           onChange={e=>setFormData({...formData, password: e.target.value})} 
//                           className="pl-9" 
//                           required 
//                        />
//                     </div>
//                  </div>
//                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
//                    {loading ? <Loader2 className="animate-spin" /> : "Create Account"}
//                  </Button>
//               </form>
//             </TabsContent>
//           </Tabs>
//         )}

//         {/* ================= VIEW 2: VERIFY REGISTRATION (Consistent Style) ================= */}
//         {view === "VERIFY_REG" && (
//            <form onSubmit={handleVerifyReg} className="space-y-6 pt-2">
//               <div className="flex justify-center">
//                  <Input 
//                    className="text-center text-3xl tracking-[0.5em] font-bold h-14 w-full border-primary/20 bg-primary/5 focus-visible:ring-primary" 
//                    placeholder="000000" 
//                    maxLength={6}
//                    value={otp} onChange={(e) => setOtp(e.target.value)}
//                    autoFocus
//                  />
//               </div>
//               <Button type="submit" className="w-full" size="lg" disabled={loading}>
//                  {loading ? <Loader2 className="animate-spin" /> : "Verify & Login"}
//               </Button>
//               <Button variant="ghost" className="w-full" onClick={() => setView("REGISTER")}>Back</Button>
//            </form>
//         )}

//         {/* ================= VIEW 3: FORGOT PASSWORD (EMAIL) ================= */}
//         {view === "FORGOT_EMAIL" && (
//            <form onSubmit={handleForgotSubmit} className="space-y-4 pt-2">
//               <div className="relative">
//                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                  <Input 
//                     placeholder="Enter your registered email" 
//                     value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} 
//                     className="pl-9"
//                     required 
//                  />
//               </div>
//               <Button className="w-full" size="lg" disabled={loading}>
//                 {loading ? <Loader2 className="animate-spin" /> : "Send Reset Code"}
//               </Button>
//               <Button variant="ghost" className="w-full" onClick={() => setView("LOGIN")}>
//                   <ArrowLeft className="w-4 h-4 mr-2"/> Back to Login
//               </Button>
//            </form>
//         )}

//         {/* ================= VIEW 4: RESET PASSWORD (Consistent OTP Style) ================= */}
//         {view === "RESET_PASS" && (
//            <form onSubmit={handleResetSubmit} className="space-y-5 pt-2">
//               <div className="space-y-2">
//                  <Label className="text-center block text-muted-foreground">Verification Code</Label>
//                  <Input 
//                     className="text-center text-3xl tracking-[0.5em] font-bold h-14 w-full border-primary/20 bg-primary/5 focus-visible:ring-primary"
//                     placeholder="000000" 
//                     value={otp} onChange={(e) => setOtp(e.target.value)} 
//                     maxLength={6}
//                     autoFocus
//                  />
//               </div>
              
//               <div className="space-y-2">
//                  <Label>New Password</Label>
//                  <div className="relative">
//                     <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                     <Input 
//                        type="password"
//                        placeholder="Enter new password" 
//                        value={newPassword} onChange={(e) => setNewPassword(e.target.value)} 
//                        className="pl-9"
//                        required
//                     />
//                  </div>
//               </div>

//               <Button className="w-full" size="lg" disabled={loading}>
//                 {loading ? <Loader2 className="animate-spin" /> : "Update & Login"}
//               </Button>
//               <Button variant="ghost" className="w-full" onClick={() => setView("FORGOT_EMAIL")}>Back</Button>
//            </form>
//         )}

//       </DialogContent>
//     </Dialog>
//   );
// }
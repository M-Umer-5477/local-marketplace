"use client";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// A small component to handle the logic for search params
function VerificationMessage() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      toast.success("Email Verified!", {
        description: "You can now log in to your account.",
      });
    }
  }, [searchParams]);

  return null; // This component doesn't render anything
}

export default function LoginPage() {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // State for the resend button
  const [resent, setResent] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const { data: session, status } = useSession();
  const router = useRouter();

  // Effect for redirecting authenticated users
  useEffect(() => {
    if (status === "authenticated") {
      if (session.user.role === "seller") {
        router.push("/vendor/dashboard");
      } else {
        router.push("/");
      }
    }
  }, [session, status, router]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  async function handleLogin(e) {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        identifier: form.identifier,
        password: form.password,
      });

      if (res?.error) {
        throw new Error(res.error);
      }
      toast.success("Login Successful!", {
        description: "Redirecting to your dashboard..."
      });

    } catch (err) {
      setError(err.message);
      toast.error("Login Failed", {
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function resendVerification() {
    if (isResending) return;
    setIsResending(true);

    try {
        const res = await fetch("/api/auth/verify-email/resend-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: form.identifier }),
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        toast.success("Verification email sent!", {
            description: "Please check your inbox."
        });
        setResent(true);
    } catch (err) {
        toast.error("Error", {
            description: err.message
        });
    } finally {
        setIsResending(false);
    }
  }

  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen text-foreground">Loading...</div>}>
      {/* FIX: Removed hardcoded gray backgrounds (bg-gray-50 dark:bg-gray-900) 
        Replaced with bg-muted/40 for a subtle background tint that works in both themes.
      */}
      <div className="flex justify-center items-center h-full my-14 p-4 bg-background">
        <VerificationMessage />
        {/* Card inherits theme colors automatically (bg-card, text-card-foreground) */}
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome Back!</CardTitle>
            <CardDescription>Enter your credentials to access your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="identifier">Email or Phone</Label>
                <Input
                  id="identifier"
                  placeholder="you@example.com"
                  value={form.identifier}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Login Error</AlertTitle>
                  <AlertDescription className="flex items-center justify-between">
                    {error}
                    {error.includes("verify") && !resent && (
                      <Button
                        onClick={resendVerification}
                        type="button"
                        variant="link"
                        disabled={isResending}
                        // FIX: Changed hardcoded red-300 link color to use theme-aware destructive-foreground
                        className="p-0 h-auto text-xs text-destructive-foreground underline"
                      >
                        {isResending ? <Loader2 className="w-4 h-4 animate-spin"/> : "Resend Email"}
                      </Button>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full flex items-center gap-2" disabled={isLoading}>
                {isLoading && <Loader2 className="animate-spin w-4 h-4" />}
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-2 text-sm">
            
            <p className="text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" passHref>
                <Button variant="link" className="p-0 h-auto text-primary">Sign Up</Button>
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </Suspense>
  );
}

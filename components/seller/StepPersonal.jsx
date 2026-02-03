"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner"; // ✅ Recommended for network errors

const schema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  cnic: z.string().min(13, "CNIC must be at least 13 digits"),
});

export default function StepPersonal({ nextStep, data }) {
  const [checking, setChecking] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: data?.fullName || "",
      email: data?.email || "",
      phone: data?.phone || "",
      cnic: data?.cnic || "",
      password: data?.password || "",
    },
  });

  const onSubmit = async (formData) => {
    setChecking(true);

    try {
      // 1. Call API to check email (Checks both Sellers AND Users now)
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const result = await res.json();

      if (result.exists) {
        // 🛑 STOP: Email is taken (either as Seller or User)
        const roleMsg = result.role ? ` (as ${result.role})` : "";
        
        setError("email", {
          type: "manual",
          message: `This email is already registered${roleMsg}. Please login.`,
        });
        
        toast.error("Email already exists");
        setChecking(false);
        return; 
      }

      // ✅ SUCCESS: Proceed to Next Step
      nextStep(formData);
      
    } catch (error) {
      console.error(error);
      toast.error("Unable to verify email. Please try again.");
      setChecking(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Details</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Field 1: Full Name */}
            <div>
              <Input placeholder="Full Name" {...register("fullName")} />
              {errors.fullName && (
                <p className="text-destructive text-sm mt-1">{errors.fullName.message}</p>
              )}
            </div>

            {/* Field 2: Email */}
            <div>
              <Input placeholder="Email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Field 3: Phone */}
            <div>
              <Input placeholder="Phone" {...register("phone")} />
              {errors.phone && (
                <p className="text-destructive text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Field 4: CNIC */}
            <div>
              <Input placeholder="CNIC" {...register("cnic")} />
              {errors.cnic && (
                <p className="text-destructive text-sm mt-1">{errors.cnic.message}</p>
              )}
            </div>

            {/* Field 5: Password */}
            <div className="md:col-span-2">
              <Input
                placeholder="Password"
                type="password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-destructive text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={checking}>
            {checking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking...
              </>
            ) : (
              "Next"
            )}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
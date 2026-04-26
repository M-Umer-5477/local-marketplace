"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^03\d{9}$/, "Enter a valid 11-digit phone number (03XXXXXXXXX)"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  cnic: z.string().regex(/^\d{5}-?\d{7}-?\d$/, "Enter a valid 13-digit CNIC (e.g. 12345-1234567-8)"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
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
      confirmPassword: data?.password || "",
    },
  });

  const onSubmit = async (formData) => {
    setChecking(true);

    try {
      // Check both email AND phone uniqueness in one call
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, phone: formData.phone }),
      });

      const result = await res.json();

      if (result.exists) {
        const field = result.field || "email";
        const roleMsg = result.role ? ` (as ${result.role})` : "";
        
        setError(field, {
          type: "manual",
          message: `This ${field} is already registered${roleMsg}. Please login.`,
        });
        
        toast.error(`${field === "phone" ? "Phone number" : "Email"} already exists`);
        setChecking(false);
        return; 
      }

      // Strip confirmPassword before passing to next step
      const { confirmPassword, ...cleanData } = formData;
      nextStep(cleanData);
      
    } catch (error) {
      console.error(error);
      toast.error("Unable to verify details. Please try again.");
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
              <Input placeholder="Phone (03XXXXXXXXX)" {...register("phone")} />
              {errors.phone && (
                <p className="text-destructive text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Field 4: CNIC */}
            <div>
              <Input placeholder="CNIC (XXXXX-XXXXXXX-X)" {...register("cnic")} />
              {errors.cnic && (
                <p className="text-destructive text-sm mt-1">{errors.cnic.message}</p>
              )}
            </div>

            {/* Field 5: Password */}
            <div>
              <Input
                placeholder="Password"
                type="password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-destructive text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Field 6: Confirm Password */}
            <div>
              <Input
                placeholder="Confirm Password"
                type="password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-destructive text-sm mt-1">{errors.confirmPassword.message}</p>
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

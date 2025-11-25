"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import StepPersonal from "./StepPersonal";
import StepShop from "./StepShop";
import StepDocs from "./StepDocs";
import StepReview from "./StepReview";


export default function SellerForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  const nextStep = (data) => {
    setFormData({ ...formData, ...data });
    setStep(step + 1);
  };
  const prevStep = () => setStep(step - 1);

  const steps = ["Personal", "Shop", "Documents", "Review"];

  return (
    // ✅ SIMPLIFIED WRAPPER:
    // Removed all max-w- and padding classes.
    // Let the parent page control the layout.
    <div className="w-full">
      <div>
        {/* Stepper progress bar - This part is perfect, no changes needed */}
        <div className="relative mb-8">
          <div className="flex justify-between mb-2 text-sm font-medium">
            {steps.map((label, i) => (
              <span
                key={i}
                className={`flex-1 text-center ${
                  step > i + 1
                    ? "text-primary"
                    : step === i + 1
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-2 bg-primary transition-all duration-500"
              style={{ width: `${(step / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Steps - No changes to logic */}
       {step === 1 && <StepPersonal nextStep={nextStep} data={formData} />}
      {step === 2 && <StepShop nextStep={nextStep} prevStep={prevStep} data={formData} />}
      {step === 3 && <StepDocs nextStep={nextStep} prevStep={prevStep} data={formData} />}
      {step === 4 && <StepReview data={formData} prevStep={prevStep} />}
      </div>
    </div>
  );
}
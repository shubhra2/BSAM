import React from "react";
import { Check } from "lucide-react";

type BookingStepsProps = {
  currentStep: number;
  steps: string[];
};

export function BookingSteps({ currentStep, steps }: BookingStepsProps) {
  return (
    <div className="w-full py-4 border-b">
      <div className="flex items-center justify-between max-w-xl mx-auto px-4">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = currentStep > stepNum;
          const isActive = currentStep === stepNum;

          return (
            <React.Fragment key={step}>
              {idx > 0 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    isCompleted ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
              <div className="flex flex-col items-center space-y-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border transition-all ${
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : isActive
                      ? "border-primary text-primary bg-background ring-2 ring-primary/20"
                      : "border-muted text-muted-foreground bg-background"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                </div>
                <span
                  className={`text-[11px] font-medium hidden sm:inline ${
                    isActive ? "text-primary font-bold" : "text-muted-foreground"
                  }`}
                >
                  {step}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

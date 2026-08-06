import React from "react";
import { Check } from "lucide-react";

type BookingStepsProps = {
  currentStep: number;
  steps: string[];
};

export function BookingSteps({ currentStep, steps }: BookingStepsProps) {
  return (
    <div className="w-full py-5">
      <div className="flex items-center justify-between max-w-xl mx-auto px-2">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = currentStep > stepNum;
          const isActive = currentStep === stepNum;

          return (
            <React.Fragment key={step}>
              {idx > 0 && (
                <div className="relative flex-1 h-0.5 mx-1.5 bg-white/8 overflow-hidden rounded-full">
                  {isCompleted && (
                    <div className="absolute inset-0 bg-amber-500 animate-[progress-line_0.5s_ease-out_both]" />
                  )}
                </div>
              )}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                    isCompleted
                      ? "bg-amber-500 border-amber-500 text-neutral-950 shadow-[0_0_0_3px_hsl(38_96%_50%/0.15),0_0_12px_0_hsl(38_96%_50%/0.35)]"
                      : isActive
                      ? "border-amber-500 text-amber-400 ring-2 ring-amber-500/20 bg-neutral-950"
                      : "border-white/10 text-neutral-500 bg-neutral-950"
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : stepNum}
                </div>
                <span
                  className={`text-[10px] font-medium hidden sm:inline transition-colors ${
                    isCompleted
                      ? "text-amber-400/70"
                      : isActive
                      ? "text-amber-400 font-bold"
                      : "text-neutral-600"
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

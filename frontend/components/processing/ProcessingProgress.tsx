import React from "react";
import { Sparkles, CheckCircle2, Loader2, Circle, AlertCircle } from "lucide-react";
import { AssessmentStatus } from "@/types/assessment";

interface ProcessingProgressProps {
  status: AssessmentStatus;
  progress: number;
  error?: string;
}

export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({
  status,
  progress,
  error,
}) => {
  const stages = [
    { key: "uploading", label: "Uploading documents", targetProgress: 15 },
    { key: "extracting_questions", label: "Reading question paper & structure", targetProgress: 40 },
    { key: "extracting_answers", label: "Reading handwritten answer sheet", targetProgress: 65 },
    { key: "mapping_answers", label: "Mapping answers to questions", targetProgress: 85 },
    { key: "grading", label: "Generating AI feedback & scoring", targetProgress: 95 },
    { key: "completed", label: "Preparing assessment workspace", targetProgress: 100 },
  ];

  const getStageStatus = (stageKey: string, targetProgress: number) => {
    if (status === "error") return "error";
    if (progress >= targetProgress) return "completed";
    if (progress >= targetProgress - 25) return "in_progress";
    return "pending";
  };

  return (
    <div className="max-w-xl mx-auto py-12 text-center">
      {/* Central Figma Orange Sparkle Icon */}
      <div className="mb-8 flex justify-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-glow animate-pulse">
            <Sparkles className="w-12 h-12" />
          </div>
          <Sparkles className="w-7 h-7 text-amber-300 absolute -top-1 -right-1 animate-bounce" />
        </div>
      </div>

      <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Extracting...</h3>
      <p className="text-slate-500 text-base font-semibold mt-1 mb-10">This may take a while</p>

      {/* Progress Card */}
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-slate-200/80 shadow-glass text-left">
        <div className="flex justify-between text-xs font-extrabold text-slate-800 mb-2.5">
          <span>Processing Pipeline</span>
          <span className="text-orange-600">{progress}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden mb-8">
          <div
            className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500 ease-out shadow-xs"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Stages Checklist */}
        <div className="space-y-3.5">
          {stages.map((stage) => {
            const st = getStageStatus(stage.key, stage.targetProgress);
            return (
              <div key={stage.key} className="flex items-center space-x-3.5 text-xs font-semibold">
                {st === "completed" && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                {st === "in_progress" && (
                  <Loader2 className="w-4 h-4 text-orange-500 animate-spin shrink-0" />
                )}
                {st === "pending" && (
                  <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                )}
                {st === "error" && (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span
                  className={
                    st === "completed"
                      ? "text-slate-800 font-bold"
                      : st === "in_progress"
                      ? "text-orange-600 font-extrabold"
                      : "text-slate-400"
                  }
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-700 text-left mt-4 font-medium">
          <p className="font-bold">Processing Error</p>
          <p className="mt-0.5">{error}</p>
        </div>
      )}
    </div>
  );
};

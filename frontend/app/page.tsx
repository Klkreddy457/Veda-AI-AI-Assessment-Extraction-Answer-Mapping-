"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UploadPanel } from "@/components/upload/UploadPanel";
import { ProcessingProgress } from "@/components/processing/ProcessingProgress";
import { uploadAssessment, getAssessmentStatus } from "@/lib/api";
import { AssessmentStatus } from "@/types/assessment";

export default function HomePage() {
  const router = useRouter();
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [status, setStatus] = useState<AssessmentStatus>("uploading");
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleStartProcessing = async (qpFile: File, ansFile: File) => {
    setIsProcessing(true);
    setStatus("uploading");
    setProgress(10);

    try {
      const id = await uploadAssessment(qpFile, ansFile);
      setAssessmentId(id);
    } catch (err: any) {
      setError(err.message || "Failed to start assessment upload.");
      setStatus("error");
    }
  };

  // Poll backend status until completion
  useEffect(() => {
    if (!assessmentId || !isProcessing) return;

    const interval = setInterval(async () => {
      try {
        const res = await getAssessmentStatus(assessmentId);
        setStatus(res.status);
        setProgress(res.progress);

        if (res.status === "completed") {
          clearInterval(interval);
          setTimeout(() => {
            router.push(`/assessment/${assessmentId}`);
          }, 800);
        } else if (res.status === "error") {
          clearInterval(interval);
          setError(res.error || "An error occurred during assessment processing.");
        }
      } catch (err: any) {
        console.error("Polling error:", err);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [assessmentId, isProcessing, router]);

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col justify-between font-sans">
      {/* Top Navbar Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-10 py-4 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md">
            V
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
              Veda<span className="text-indigo-600">AI</span>
            </h1>
            <p className="text-[11px] font-bold text-slate-400 mt-0.5">
              Document Intelligence Platform
            </p>
          </div>
        </div>
      </header>

      {/* Main Upload Workspace */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-5xl">
          {!isProcessing ? (
            <UploadPanel onStartProcessing={handleStartProcessing} />
          ) : (
            <ProcessingProgress status={status} progress={progress} error={error} />
          )}
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="py-6 text-center text-xs font-semibold text-slate-400 border-t border-slate-200/60 bg-white">
        <p>VedaAI Assessment Extraction & Answer Mapping • Production Intelligence Engine</p>
      </footer>
    </div>
  );
}

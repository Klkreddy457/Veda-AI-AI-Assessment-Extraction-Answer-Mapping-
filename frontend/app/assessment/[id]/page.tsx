"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAssessmentDetails } from "@/lib/api";
import { Assessment } from "@/types/assessment";
import { AssessmentViewer } from "@/components/assessment/AssessmentViewer";
import { Loader2, AlertCircle } from "lucide-react";

export default function AssessmentPage() {
  const params = useParams();
  const id = (params?.id as string) || "ass_demo123456";

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getAssessmentDetails(id);
        setAssessment(data);
      } catch (err: any) {
        setError(err.message || "Failed to load assessment data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 text-slate-700">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-sm font-semibold">Loading Assessment Workspace...</p>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-600 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-1">Assessment Not Found</h2>
        <p className="text-xs text-slate-500 max-w-md mb-6">{error || "Could not retrieve the specified assessment details."}</p>
        <a
          href="/"
          className="px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Return to Upload
        </a>
      </div>
    );
  }

  return <AssessmentViewer initialAssessment={assessment} />;
}

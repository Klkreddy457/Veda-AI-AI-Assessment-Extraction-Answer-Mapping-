import React from "react";
import { Assessment } from "@/types/assessment";
import { CheckCircle2, AlertTriangle, HelpCircle, Award, FileSpreadsheet } from "lucide-react";

interface AssessmentSummaryProps {
  assessment: Assessment;
}

export const AssessmentSummary: React.FC<AssessmentSummaryProps> = ({ assessment }) => {
  const totalQuestions = assessment.questions.length;
  
  let answeredCount = 0;
  let unansweredCount = 0;
  let needsReviewCount = 0;

  assessment.questions.forEach((q) => {
    const mapping = assessment.mappings.find((m) => m.questionId === q.id);
    if (!mapping || mapping.answerIds.length === 0) {
      unansweredCount++;
    } else if (mapping.confidence < 0.7 && mapping.method !== "manual") {
      needsReviewCount++;
      answeredCount++;
    } else {
      answeredCount++;
    }
  });

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-subtle">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
          V
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">
            {assessment.questionPaperFilename || "Assessment Review Workspace"}
          </h1>
          <p className="text-xs text-slate-500">
            Student Answer Sheet: <span className="font-medium text-slate-700">{assessment.answerSheetFilename || "Student_Answers.pdf"}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-slate-800">{totalQuestions}</span>
          <span className="text-slate-500 text-xs">Questions</span>
        </div>

        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-emerald-700">{answeredCount}</span>
          <span className="text-slate-500 text-xs">Answered</span>
        </div>

        <div className="flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-600">{unansweredCount}</span>
          <span className="text-slate-500 text-xs">Unanswered</span>
        </div>

        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span className="font-semibold text-amber-700">{needsReviewCount}</span>
          <span className="text-slate-500 text-xs">Needs Review</span>
        </div>

        {assessment.totalScore !== undefined && assessment.maxTotalScore !== undefined && (
          <div className="pl-4 border-l border-slate-200 flex items-center space-x-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-indigo-900 text-base">{assessment.totalScore}</span>
            <span className="text-slate-400 text-xs">/ {assessment.maxTotalScore} pts</span>
          </div>
        )}
      </div>
    </div>
  );
};

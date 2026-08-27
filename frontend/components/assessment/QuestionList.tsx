import React, { useState } from "react";
import { Question, Answer, AnswerMapping, QuestionGrade, AssessmentWarning } from "@/types/assessment";
import { QuestionItem } from "./QuestionItem";
import { Search, AlertCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionListProps {
  questions: Question[];
  answers: Answer[];
  mappings: AnswerMapping[];
  grades?: QuestionGrade[];
  warnings: AssessmentWarning[];
  selectedQuestionId: string | null;
  selectedUnmatchedAnswerId: string | null;
  onSelectQuestion: (question: Question) => void;
  onSelectUnmatchedAnswer: (answer: Answer) => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  answers,
  mappings,
  grades,
  warnings,
  selectedQuestionId,
  selectedUnmatchedAnswerId,
  onSelectQuestion,
  onSelectUnmatchedAnswer,
}) => {
  const [filter, setFilter] = useState<"all" | "answered" | "unanswered">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const mappedAnswerIds = new Set(mappings.flatMap((m) => m.answerIds));
  const unmatchedAnswers = answers.filter((a) => !mappedAnswerIds.has(a.id));

  const filteredQuestions = questions.filter((q) => {
    const mapping = mappings.find((m) => m.questionId === q.id);
    const isUnanswered = !mapping || mapping.answerIds.length === 0;

    if (filter === "answered" && isUnanswered) return false;
    if (filter === "unanswered" && !isUnanswered) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesNum = q.number.toLowerCase().includes(query);
      const matchesText = q.text.toLowerCase().includes(query);
      return matchesNum || matchesText;
    }

    return true;
  });

  return (
    <div className="w-96 md:w-[420px] border-r border-slate-200/80 bg-slate-100/70 flex flex-col h-full shrink-0">
      {/* Figma Left Panel Header */}
      <div className="p-4 border-b border-slate-200/80 bg-white flex items-center justify-between shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 tracking-tight">
          Extracted Questions <span className="font-normal text-slate-400">(from question paper)</span>
        </h3>
        <button
          onClick={() => setFilter(filter === "all" ? "answered" : "all")}
          className="px-3 py-1 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-700 transition-colors"
        >
          Expand All
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="px-4 py-3 bg-white border-b border-slate-200/80 space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search question paper..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
          />
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl text-[11px] font-semibold text-slate-600">
          {(["all", "answered", "unanswered"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "flex-1 py-1 rounded-lg capitalize transition-all text-center",
                filter === tab
                  ? "bg-white text-slate-900 font-extrabold shadow-xs"
                  : "hover:text-slate-900"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Warnings Header */}
      {warnings.length > 0 && (
        <div className="p-3 bg-amber-50 border-b border-amber-200/80 text-xs text-amber-800 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Extraction Warning:</span>
            {warnings.map((w, idx) => (
              <p key={idx} className="mt-0.5 text-[11px] text-amber-700">{w.message}</p>
            ))}
          </div>
        </div>
      )}

      {/* Scrollable Questions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs font-medium">
            No questions found.
          </div>
        ) : (
          filteredQuestions.map((q) => (
            <QuestionItem
              key={q.id}
              question={q}
              mapping={mappings.find((m) => m.questionId === q.id)}
              grade={grades?.find((g) => g.questionId === q.id)}
              isSelected={selectedQuestionId === q.id}
              onSelect={onSelectQuestion}
            />
          ))
        )}

        {/* Unmatched Answers Section */}
        {unmatchedAnswers.length > 0 && (
          <div className="pt-4 border-t border-slate-200/80 mt-4">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
              Unmatched Answers ({unmatchedAnswers.length})
            </h4>
            <div className="space-y-2">
              {unmatchedAnswers.map((ans) => {
                const firstReg = ans.regions[0];
                const isSelected = selectedUnmatchedAnswerId === ans.id;
                return (
                  <div
                    key={ans.id}
                    onClick={() => onSelectUnmatchedAnswer(ans)}
                    className={cn(
                      "p-3 rounded-xl border text-xs cursor-pointer transition-all bg-white",
                      isSelected
                        ? "border-2 border-rose-500 bg-rose-50/20 shadow-md"
                        : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-center justify-between font-bold text-rose-700">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> Unmatched Answer
                      </span>
                      {firstReg && <span className="text-[10px] text-slate-400">Page {firstReg.page}</span>}
                    </div>
                    <p className="text-slate-600 line-clamp-2 mt-1 text-[11px] font-medium">
                      {ans.detectedQuestionNumber ? `Detected Ref: Q${ans.detectedQuestionNumber} — ` : ""}
                      {ans.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

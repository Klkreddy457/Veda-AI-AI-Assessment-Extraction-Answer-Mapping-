import React, { useState } from "react";
import { Question, AnswerMapping, QuestionGrade } from "@/types/assessment";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionItemProps {
  question: Question;
  mapping?: AnswerMapping;
  grade?: QuestionGrade;
  isSelected: boolean;
  onSelect: (question: Question) => void;
}

export const QuestionItem: React.FC<QuestionItemProps> = ({
  question,
  mapping,
  grade,
  isSelected,
  onSelect,
}) => {
  const [isExpanded, setIsExpanded] = useState(isSelected);

  const isUnanswered = !mapping || mapping.answerIds.length === 0;

  // Calculate score display e.g. 2/2, 4/5, 0/2
  const score = grade ? grade.score : isUnanswered ? 0 : question.maxScore || 10;
  const maxScore = question.maxScore || 10;
  const isPerfect = score === maxScore && score > 0;
  const isZero = score === 0;

  const scoreBgClass = isPerfect
    ? "bg-emerald-100 text-emerald-700 font-bold border-emerald-200"
    : isZero
    ? "bg-rose-100 text-rose-700 font-bold border-rose-200"
    : "bg-amber-100 text-amber-700 font-bold border-amber-200";

  return (
    <div
      onClick={() => onSelect(question)}
      className={cn(
        "rounded-2xl border transition-all cursor-pointer select-none bg-white p-4 shadow-xs",
        isSelected
          ? "border-2 border-orange-500 bg-orange-50/20 shadow-md ring-1 ring-orange-500/20"
          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Number circle & Question text */}
        <div className="flex items-start space-x-3 min-w-0">
          <div
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5",
              isSelected ? "bg-orange-500 text-white" : "bg-slate-700 text-white"
            )}
          >
            {question.part ? `${question.parentNumber} ${question.part}` : question.number}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 leading-relaxed">
              {question.text}
            </p>
          </div>
        </div>

        {/* Right: Score pill & Accordion chevron */}
        <div className="flex items-center space-x-2 shrink-0">
          <span
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-extrabold border",
              scoreBgClass
            )}
          >
            {score}/{maxScore}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
              onSelect(question);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            {isExpanded || isSelected ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded AI Feedback Box */}
      {(isExpanded || isSelected) && grade && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-xs bg-slate-50 p-3 rounded-xl">
          <div className="flex items-center space-x-1.5 text-slate-900 font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>AI Feedback</span>
          </div>
          <p className="text-slate-600 leading-normal text-[11px] font-medium">
            {grade.feedback}
          </p>
        </div>
      )}
    </div>
  );
};

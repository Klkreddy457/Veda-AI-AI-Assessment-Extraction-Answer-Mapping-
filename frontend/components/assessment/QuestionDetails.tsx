import React, { useState } from "react";
import { Question, Answer, AnswerMapping, QuestionGrade } from "@/types/assessment";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { Button } from "@/components/ui/Button";
import { Edit3, Check, Award, Sparkles, HelpCircle } from "lucide-react";

interface QuestionDetailsProps {
  question: Question;
  answers: Answer[];
  mapping?: AnswerMapping;
  grade?: QuestionGrade;
  allAnswers: Answer[];
  onManualRemap: (questionId: string, answerIds: string[]) => void;
}

export const QuestionDetails: React.FC<QuestionDetailsProps> = ({
  question,
  answers,
  mapping,
  grade,
  allAnswers,
  onManualRemap,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string>(
    mapping?.answerIds[0] || ""
  );

  const isUnanswered = !mapping || mapping.answerIds.length === 0;

  const handleSaveRemap = () => {
    onManualRemap(question.id, selectedAnswerId ? [selectedAnswerId] : []);
    setIsEditing(false);
  };

  return (
    <div className="bg-white border-t border-slate-200 p-5 shadow-card max-h-72 overflow-y-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-slate-900">
              Question {question.number}
            </h3>
            {mapping && (
              <ConfidenceBadge
                confidence={mapping.confidence}
                method={mapping.method}
                isUnanswered={isUnanswered}
              />
            )}
          </div>
          <p className="text-xs text-slate-600 mt-1 font-medium">{question.text}</p>
        </div>

        <div className="flex items-center space-x-3">
          {grade && (
            <div className="bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg flex items-center space-x-1.5 text-xs text-indigo-900 font-bold">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Score: {grade.score} / {grade.maxScore}</span>
            </div>
          )}

          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-xs"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1" /> Remap Answer
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <select
                value={selectedAnswerId}
                onChange={(e) => setSelectedAnswerId(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Mark Unanswered --</option>
                {allAnswers.map((ans) => (
                  <option key={ans.id} value={ans.id}>
                    {ans.detectedQuestionNumber ? `Q${ans.detectedQuestionNumber}: ` : ""}
                    {ans.text.substring(0, 45)}...
                  </option>
                ))}
              </select>
              <Button variant="primary" size="sm" onClick={handleSaveRemap}>
                <Check className="w-3.5 h-3.5" /> Save
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Answer Content or Empty Unanswered State */}
      <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
        {isUnanswered ? (
          <div className="flex items-center space-x-2 text-slate-500 italic py-1">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>No student answer detected for this question on the answer sheet.</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="font-semibold text-slate-700 flex items-center justify-between">
              <span>Extracted Student Answer:</span>
              <span className="text-[11px] font-normal text-slate-400">
                Method: {mapping?.method} (Confidence: {Math.round((mapping?.confidence || 0) * 100)}%)
              </span>
            </div>
            {answers.map((ans) => (
              <p key={ans.id} className="text-slate-800 leading-relaxed font-mono whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-200">
                {ans.text}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Optional AI Grade Feedback */}
      {grade && (
        <div className="mt-3 bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-900 flex items-start space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">AI Grading Feedback:</span>
            <p className="mt-0.5 text-slate-700">{grade.feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
};

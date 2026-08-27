import React, { useState } from "react";
import { Assessment, Question, Answer } from "@/types/assessment";
import { QuestionList } from "./QuestionList";
import { AnswerViewer } from "./AnswerViewer";
import { QuestionDetails } from "./QuestionDetails";
import { remapQuestion } from "@/lib/api";
import { ArrowLeft, CheckCircle2, AlertTriangle, HelpCircle, Award, FileSpreadsheet } from "lucide-react";
import Link from "next/link";

interface AssessmentViewerProps {
  initialAssessment: Assessment;
}

export const AssessmentViewer: React.FC<AssessmentViewerProps> = ({
  initialAssessment,
}) => {
  const [assessment, setAssessment] = useState<Assessment>(initialAssessment);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    initialAssessment.questions[0] || null
  );
  const [selectedUnmatchedAnswer, setSelectedUnmatchedAnswer] = useState<Answer | null>(null);

  const currentMapping = selectedQuestion
    ? assessment.mappings.find((m) => m.questionId === selectedQuestion.id)
    : undefined;

  const currentAnswers = currentMapping
    ? assessment.answers.filter((a) => currentMapping.answerIds.includes(a.id))
    : [];

  const currentRegions = selectedUnmatchedAnswer
    ? selectedUnmatchedAnswer.regions
    : currentAnswers.flatMap((a) => a.regions);

  const targetPage = currentRegions.length > 0 ? currentRegions[0].page : 1;

  const handleSelectQuestion = (q: Question) => {
    setSelectedQuestion(q);
    setSelectedUnmatchedAnswer(null);
  };

  const handleSelectUnmatchedAnswer = (ans: Answer) => {
    setSelectedUnmatchedAnswer(ans);
    setSelectedQuestion(null);
  };

  const handleManualRemap = async (questionId: string, answerIds: string[]) => {
    try {
      const updated = await remapQuestion(assessment.id, questionId, answerIds);
      setAssessment(updated);
    } catch (err) {
      console.error("Remap error:", err);
    }
  };

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

  const selectedGrade = selectedQuestion
    ? assessment.grades?.find((g) => g.questionId === selectedQuestion.id)
    : undefined;

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Standalone Workspace Header Bar (No sidebar, no account menu) */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 select-none z-20 shadow-xs">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Upload New</span>
          </Link>

          <div className="h-5 w-px bg-slate-200" />

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-extrabold text-base shadow-xs">
              V
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-900 leading-tight">
                {assessment.questionPaperFilename || "Assessment Review Workspace"}
              </h1>
              <p className="text-[11px] font-semibold text-slate-400">
                Student Sheet: {assessment.answerSheetFilename || "Student_Answers.pdf"}
              </p>
            </div>
          </div>
        </div>

        {/* Header Stats Bar */}
        <div className="flex items-center space-x-5 text-xs">
          <div className="flex items-center space-x-1.5 font-bold text-slate-700">
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
            <span>{totalQuestions} Questions</span>
          </div>

          <div className="flex items-center space-x-1.5 font-bold text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{answeredCount} Answered</span>
          </div>

          <div className="flex items-center space-x-1.5 font-bold text-slate-600">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>{unansweredCount} Unanswered</span>
          </div>

          <div className="flex items-center space-x-1.5 font-bold text-amber-700">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>{needsReviewCount} Needs Review</span>
          </div>

          {assessment.totalScore !== undefined && assessment.maxTotalScore !== undefined && (
            <div className="pl-3 border-l border-slate-200 flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-indigo-600" />
              <span className="font-extrabold text-indigo-900 text-sm">{assessment.totalScore}</span>
              <span className="text-slate-400 text-[11px] font-semibold">/ {assessment.maxTotalScore} pts</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Split Screen Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Extracted Question List */}
        <QuestionList
          questions={assessment.questions}
          answers={assessment.answers}
          mappings={assessment.mappings}
          grades={assessment.grades}
          warnings={assessment.warnings}
          selectedQuestionId={selectedQuestion?.id || null}
          selectedUnmatchedAnswerId={selectedUnmatchedAnswer?.id || null}
          onSelectQuestion={handleSelectQuestion}
          onSelectUnmatchedAnswer={handleSelectUnmatchedAnswer}
        />

        {/* Right Side: Document Viewer & Details Drawer */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <AnswerViewer
            assessmentId={assessment.id}
            totalPages={assessment.answerSheetTotalPages}
            activeRegions={currentRegions}
            questionNumber={selectedQuestion?.number}
            targetPage={targetPage}
          />

          {/* Question Details Panel at Bottom */}
          {selectedQuestion && (
            <QuestionDetails
              question={selectedQuestion}
              answers={currentAnswers}
              mapping={currentMapping}
              grade={selectedGrade}
              allAnswers={assessment.answers}
              onManualRemap={handleManualRemap}
            />
          )}
        </div>
      </div>
    </div>
  );
};

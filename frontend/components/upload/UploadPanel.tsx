import React, { useState } from "react";
import { FileDropzone } from "./FileDropzone";
import { ArrowRight, Sparkles, FileSpreadsheet, FileText, CheckCircle2 } from "lucide-react";

interface UploadPanelProps {
  onStartProcessing: (qpFile: File, ansFile: File) => void;
}

export const UploadPanel: React.FC<UploadPanelProps> = ({ onStartProcessing }) => {
  const [qpFile, setQpFile] = useState<File | null>(null);
  const [ansFile, setAnsFile] = useState<File | null>(null);

  const canProcess = qpFile !== null && ansFile !== null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qpFile && ansFile) {
      onStartProcessing(qpFile, ansFile);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      {/* Hero Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 text-xs font-extrabold mb-4 border border-indigo-200/80 shadow-xs">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          AI Document Intelligence & Answer Mapping
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Extract Questions & Map{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
            Student Answers
          </span>
        </h1>

        <p className="text-slate-500 text-base font-semibold max-w-2xl mx-auto mt-4 leading-relaxed">
          Upload printed question papers and handwritten answer sheets to parse questions, detect layout regions, and auto-highlight corresponding answers.
        </p>
      </div>

      {/* Upload Cards Grid */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FileDropzone
            title="Question Paper"
            subtitle="Printed PDF or high-res image paper with numbered questions"
            badge="STEP 1 • QUESTION PAPER"
            file={qpFile}
            onFileSelect={setQpFile}
          />

          <FileDropzone
            title="Student Answer Sheet"
            subtitle="Handwritten student response booklet (PDF, PNG, JPG)"
            badge="STEP 2 • ANSWER SHEET"
            file={ansFile}
            onFileSelect={setAnsFile}
          />
        </div>

        {/* Action Button & Features Bar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-glass flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4 text-xs font-bold text-slate-600">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>Sub-questions (11a, 11b)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>Out-of-order Answers</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>SVG Highlights</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!canProcess}
            className={`inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-extrabold text-sm transition-all duration-300 shadow-md select-none shrink-0 ${
              canProcess
                ? "bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-500/25 cursor-pointer transform hover:-translate-y-0.5 hover:shadow-lg"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            Analyze & Map Assessment <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

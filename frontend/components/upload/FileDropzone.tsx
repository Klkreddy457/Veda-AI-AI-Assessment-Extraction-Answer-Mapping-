import React, { useRef } from "react";
import { Upload, FileText, CheckCircle2, Trash2, FileCode } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

interface FileDropzoneProps {
  title: string;
  subtitle: string;
  badge: string;
  file: File | null;
  pageCount?: number;
  onFileSelect: (file: File | null) => void;
  acceptTypes?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  title,
  subtitle,
  badge,
  file,
  pageCount,
  onFileSelect,
  acceptTypes = ".pdf,.png,.jpg,.jpeg",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (isValidFile(droppedFile)) {
        onFileSelect(droppedFile);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (isValidFile(selectedFile)) {
        onFileSelect(selectedFile);
      }
    }
  };

  const isValidFile = (f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    return ["pdf", "png", "jpg", "jpeg"].includes(ext || "");
  };

  return (
    <div className="w-full">
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="group relative border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-white hover:bg-indigo-50/20 rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[240px] shadow-sm hover:shadow-glow"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleChange}
            accept={acceptTypes}
            className="hidden"
          />

          {/* Top Badge */}
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-[11px] mb-4 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
            {badge}
          </span>

          <div className="w-14 h-14 rounded-2xl bg-indigo-50 group-hover:bg-indigo-600 flex items-center justify-center text-indigo-600 group-hover:text-white mb-4 transition-all duration-300 shadow-xs group-hover:scale-110 group-hover:shadow-md">
            <Upload className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-semibold max-w-xs">
            {subtitle}
          </p>

          <div className="mt-4 inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 group-hover:underline">
            <span>Browse files</span>
            <span>or drag & drop</span>
          </div>
        </div>
      ) : (
        <div className="bg-white border-2 border-emerald-500/60 rounded-3xl p-6 flex items-center justify-between shadow-card relative overflow-hidden">
          <div className="flex items-center space-x-4 overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-6 h-6" />
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-extrabold text-slate-900 truncate">{file.name}</p>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1 font-semibold">
                <span>{formatFileSize(file.size)}</span>
                {pageCount && <span>• {pageCount} Pages</span>}
                <span className="text-emerald-600 font-bold">• Ready for extraction</span>
              </div>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFileSelect(null);
            }}
            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors shrink-0"
            title="Remove file"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

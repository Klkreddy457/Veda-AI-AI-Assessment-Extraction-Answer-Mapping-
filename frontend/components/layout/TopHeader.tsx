import React from "react";
import { ArrowLeft, ClipboardList, HelpCircle, Bell, Sparkles, ChevronDown } from "lucide-react";
import Link from "next/link";

interface TopHeaderProps {
  breadcrumb?: string;
  showBack?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  breadcrumb = "Exams",
  showBack = true,
}) => {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between shrink-0 select-none z-20 shadow-xs">
      {/* Left Navigation Breadcrumb */}
      <div className="flex items-center space-x-3">
        {showBack && (
          <Link
            href="/"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        )}
        <div className="flex items-center space-x-2.5 text-xs font-bold text-slate-700">
          <div className="w-6 h-6 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
            <ClipboardList className="w-3.5 h-3.5" />
          </div>
          <span className="tracking-tight">{breadcrumb}</span>
        </div>
      </div>

      {/* Right Controls & Profile */}
      <div className="flex items-center space-x-3.5">
        <button className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
          <HelpCircle className="w-4 h-4" />
        </button>

        <button className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-orange-500 absolute top-1.5 right-1.5 ring-2 ring-white animate-pulse" />
        </button>

        <button className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
          <Sparkles className="w-4 h-4 text-orange-500" />
        </button>

        {/* User Profile */}
        <div className="pl-3 border-l border-slate-200 flex items-center space-x-2.5 cursor-pointer hover:opacity-85 transition-opacity">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
            MR
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-tight">Madhur Rastogi</p>
            <p className="text-[10px] font-semibold text-slate-400">Senior Educator</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </header>
  );
};

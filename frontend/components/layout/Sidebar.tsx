import React, { useState } from "react";
import {
  Sparkles,
  LayoutDashboard,
  Users,
  FileText,
  ClipboardList,
  FolderKanban,
  Settings,
  ChevronLeft,
  ChevronRight,
  School,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab = "exams" }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: "home", label: "Home", icon: LayoutDashboard },
    { id: "classroom", label: "My Classroom", icon: Users },
    { id: "assignments", label: "Assignments", icon: FileText },
    { id: "exams", label: "Exams", icon: ClipboardList },
    { id: "library", label: "My Library", icon: FolderKanban },
  ];

  return (
    <aside
      className={cn(
        "bg-white border-r border-slate-200/80 flex flex-col justify-between p-3.5 transition-all duration-300 ease-in-out shrink-0 select-none z-30 h-screen shadow-xs",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Top Header & Logo */}
      <div>
        <div className="flex items-center justify-between px-1 py-2.5 mb-5">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-indigo-600 text-white flex items-center justify-center font-extrabold text-lg shrink-0 shadow-md">
              V
            </div>
            {!isCollapsed && (
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">
                Veda<span className="text-orange-500">AI</span>
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* AI Teacher's Toolkit Banner Pill */}
        <div
          className={cn(
            "mb-6 rounded-full border-2 border-orange-500 bg-slate-900 text-white flex items-center justify-center font-bold text-xs transition-all shadow-sm cursor-pointer hover:bg-slate-800",
            isCollapsed ? "p-2 rounded-full w-9 h-9 mx-auto" : "px-4 py-2.5 space-x-2.5"
          )}
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          {!isCollapsed && <span className="tracking-wide">AI Teacher's Toolkit</span>}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeTab;
            return (
              <button
                key={item.id}
                className={cn(
                  "w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all select-none",
                  isActive
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80",
                  isCollapsed && "justify-center px-0"
                )}
                title={item.label}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    isActive ? "text-orange-400" : "text-slate-400"
                  )}
                />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Settings */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <button
          className={cn(
            "w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 transition-colors",
            isCollapsed && "justify-center px-0"
          )}
        >
          <Settings className="w-4 h-4 text-slate-400 shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </button>

        {/* School Badge Card */}
        <div
          className={cn(
            "bg-gradient-to-r from-slate-50 to-slate-100/80 border border-slate-200/90 rounded-2xl p-3 flex items-center space-x-3 shadow-xs",
            isCollapsed && "justify-center p-2"
          )}
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
            <School className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div className="truncate text-left">
              <p className="text-xs font-extrabold text-slate-800 truncate">
                Delhi Public School
              </p>
              <p className="text-[10px] font-medium text-slate-400 truncate">
                Bokaro Steel City
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

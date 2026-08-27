import React from "react";
import { Badge } from "@/components/ui/Badge";
import { MappingMethod } from "@/types/assessment";
import { CheckCircle2, AlertTriangle, HelpCircle, Edit3 } from "lucide-react";

interface ConfidenceBadgeProps {
  confidence: number;
  method: MappingMethod;
  isUnanswered?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  method,
  isUnanswered,
}) => {
  if (isUnanswered) {
    return (
      <Badge variant="secondary" className="gap-1 bg-slate-100 text-slate-600">
        <HelpCircle className="w-3 h-3" /> Unanswered
      </Badge>
    );
  }

  if (method === "manual") {
    return (
      <Badge variant="default" className="gap-1 bg-indigo-50 text-indigo-700 border-indigo-200">
        <Edit3 className="w-3 h-3" /> Manually Mapped
      </Badge>
    );
  }

  if (confidence >= 0.9) {
    return (
      <Badge variant="success" className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200">
        <CheckCircle2 className="w-3 h-3" /> High ({Math.round(confidence * 100)}%)
      </Badge>
    );
  }

  if (confidence >= 0.7) {
    return (
      <Badge variant="warning" className="gap-1 bg-amber-50 text-amber-700 border-amber-200">
        <AlertTriangle className="w-3 h-3" /> Medium ({Math.round(confidence * 100)}%)
      </Badge>
    );
  }

  return (
    <Badge variant="danger" className="gap-1 bg-rose-50 text-rose-700 border-rose-200">
      <AlertTriangle className="w-3 h-3" /> Needs Review ({Math.round(confidence * 100)}%)
    </Badge>
  );
};

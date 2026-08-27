import React from "react";
import { AnswerRegion } from "@/types/assessment";
import { calculateScaledCoordinates } from "@/lib/coordinates";

interface AnswerHighlightProps {
  regions: AnswerRegion[];
  currentPage: number;
  renderedWidth: number;
  renderedHeight: number;
  questionNumber?: string;
}

export const AnswerHighlight: React.FC<AnswerHighlightProps> = ({
  regions,
  currentPage,
  renderedWidth,
  renderedHeight,
  questionNumber,
}) => {
  const pageRegions = regions.filter((r) => r.page === currentPage);

  if (pageRegions.length === 0 || renderedWidth <= 0 || renderedHeight <= 0) {
    return null;
  }

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
      style={{ width: renderedWidth, height: renderedHeight }}
      viewBox={`0 0 ${renderedWidth} ${renderedHeight}`}
    >
      {pageRegions.map((region, idx) => {
        const scaled = calculateScaledCoordinates(
          region.bbox,
          renderedWidth,
          renderedHeight
        );

        const labelText = questionNumber ? `Q${questionNumber}` : "Q";

        return (
          <g key={idx} className="transition-all duration-300">
            {/* Animated Glow Backdrop Box */}
            <rect
              x={scaled.left}
              y={scaled.top}
              width={scaled.width}
              height={scaled.height}
              fill="rgba(16, 185, 129, 0.08)"
              stroke="#10B981"
              strokeWidth="2.5"
              rx="12"
              className="animate-glow"
            />

            {/* Figma Green Floating Tag Pill sitting at top-left corner */}
            <g transform={`translate(${scaled.left - 2}, ${scaled.top - 16})`}>
              <rect
                x="0"
                y="0"
                width={Math.max(42, labelText.length * 9 + 18)}
                height="24"
                fill="#10B981"
                rx="7"
                filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.15))"
              />
              <text
                x="9"
                y="16"
                fill="#FFFFFF"
                fontSize="12"
                fontWeight="900"
                fontFamily="'Plus Jakarta Sans', sans-serif"
              >
                {labelText}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
};

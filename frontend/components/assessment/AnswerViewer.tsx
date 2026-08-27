import React, { useState, useEffect, useRef } from "react";
import { AnswerRegion } from "@/types/assessment";
import { AnswerHighlight } from "./AnswerHighlight";
import { getPageImageUrl } from "@/lib/api";
import { calculateScaledCoordinates, calculateScrollTarget } from "@/lib/coordinates";
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface AnswerViewerProps {
  assessmentId: string;
  totalPages: number;
  activeRegions: AnswerRegion[];
  questionNumber?: string;
  targetPage?: number;
}

export const AnswerViewer: React.FC<AnswerViewerProps> = ({
  assessmentId,
  totalPages,
  activeRegions,
  questionNumber,
  targetPage,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(targetPage || 1);
  const [zoom, setZoom] = useState<number>(1.0);
  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number }>({
    width: 850,
    height: 1200,
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const documentImgRef = useRef<HTMLImageElement>(null);
  const notebookDocRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (targetPage && targetPage > 0 && targetPage <= totalPages) {
      setCurrentPage(targetPage);
    }
  }, [targetPage, totalPages]);

  useEffect(() => {
    if (notebookDocRef.current) {
      const w = notebookDocRef.current.clientWidth;
      const h = notebookDocRef.current.clientHeight;
      if (w > 0 && h > 0 && (containerDimensions.width !== w || containerDimensions.height !== h)) {
        setContainerDimensions({ width: w, height: h });
      }
    }
  }, [currentPage, containerDimensions.width, containerDimensions.height]);

  useEffect(() => {
    const pageRegions = activeRegions.filter((r) => r.page === currentPage);
    if (pageRegions.length > 0 && scrollContainerRef.current && containerDimensions.width > 0) {
      const firstBbox = pageRegions[0].bbox;
      const scaled = calculateScaledCoordinates(
        firstBbox,
        containerDimensions.width,
        containerDimensions.height
      );
      const scrollTop = calculateScrollTarget(
        scaled,
        scrollContainerRef.current.clientHeight
      );

      scrollContainerRef.current.scrollTo({
        top: scrollTop,
        behavior: "smooth",
      });
    }
  }, [activeRegions, currentPage, containerDimensions]);

  const handleImageLoad = () => {
    if (documentImgRef.current) {
      setContainerDimensions({
        width: documentImgRef.current.clientWidth,
        height: documentImgRef.current.clientHeight,
      });
    }
  };

  const imageUrl = getPageImageUrl(assessmentId, "ans", currentPage);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-200/70 overflow-hidden relative">
      {/* Document Header Bar */}
      <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between text-xs font-bold shrink-0 select-none shadow-sm">
        <span className="text-slate-100 text-xs tracking-tight">Answer Sheet</span>

        {/* Right Header Toolbar Controls */}
        <div className="flex items-center space-x-4">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-1.5 bg-slate-800 px-2.5 py-1 rounded-lg">
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center text-[11px] font-bold text-slate-200">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1 rounded-lg">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-bold text-slate-200">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Document Canvas Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto p-8 flex justify-center items-start"
      >
        <div
          className="relative shadow-2xl transition-all duration-200 bg-white rounded-lg overflow-hidden border border-slate-300"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
          }}
        >
          {imageUrl ? (
            <img
              ref={documentImgRef}
              src={imageUrl}
              alt={`Answer Sheet Page ${currentPage}`}
              onLoad={handleImageLoad}
              className="block w-full h-auto min-w-[750px] max-w-[1050px] select-none"
            />
          ) : (
            // Student Answer Sheet Notebook Page matching sample_question_paper
            <div
              ref={notebookDocRef}
              className="w-[850px] min-h-[1200px] bg-[#FAF9F5] p-12 text-slate-800 font-sans relative select-none shadow-inner"
              style={{
                backgroundImage: "linear-gradient(#E2E8F0 1px, transparent 1px)",
                backgroundSize: "100% 32px",
                lineHeight: "32px",
              }}
            >
              {/* Vertical Margin Line */}
              <div className="absolute top-0 bottom-0 left-20 border-r-2 border-rose-300 pointer-events-none" />

              {/* Page specific student handwriting text */}
              <div className="pl-16 space-y-12 pt-4">
                {currentPage === 1 && (
                  <>
                    {/* Block 1 (y: 300 in 3508 scale -> 4b) */}
                    <div>
                      <span className="font-bold text-slate-900 mr-4 font-mono text-base">4b)</span>
                      <span className="text-slate-800 text-sm font-medium">
                        A common example is a vehicle. A car, bus and motorcycle can all have a move() operation, but each vehicle can implement that operation differently.
                      </span>
                    </div>

                    {/* Block 2 (y: 800 in 3508 scale -> 1) */}
                    <div className="pt-6">
                      <span className="font-bold text-slate-900 mr-4 font-mono text-base">1)</span>
                      <span className="text-slate-800 text-sm font-medium">
                        An operating system manages the computer's hardware and software resources. It provides services for applications and manages processes, memory, files, input/output devices and security.
                      </span>
                    </div>

                    {/* Block 3 (y: 1400 in 3508 scale -> 7) */}
                    <div className="pt-10">
                      <span className="font-bold text-slate-900 mr-4 font-mono text-base">7)</span>
                      <span className="text-slate-800 text-sm font-medium">
                        The basic steps are:
                      </span>
                      <ol className="list-decimal pl-12 space-y-1 text-sm font-medium text-slate-800 mt-1">
                        <li>Collect and prepare the data</li>
                        <li>Clean and preprocess the data</li>
                        <li>Split the data into training and testing sets</li>
                        <li>Select a suitable machine learning model</li>
                        <li>Train the model using its training data</li>
                        <li>Evaluate its performance</li>
                        <li>Tune and improve the model if necessary.</li>
                      </ol>
                    </div>
                  </>
                )}

                {currentPage === 2 && (
                  <>
                    {/* Block 1 (y: 300 -> 2) */}
                    <div>
                      <span className="font-bold text-slate-900 mr-4 font-mono text-base">2)</span>
                      <span className="text-slate-800 text-sm font-medium">
                        A stack follows LIFO (Last In, First Out), meaning the last element added is removed first. A queue follows FIFO (First In, First Out), meaning the first element is removed first. A stack is like a pile of plates, while a queue is like people waiting in line.
                      </span>
                    </div>

                    {/* Block 2 (y: 900 -> 4a) */}
                    <div className="pt-8">
                      <span className="font-bold text-slate-900 mr-4 font-mono text-base">4a)</span>
                      <span className="text-slate-800 text-sm font-medium">
                        Polymorphism is an object-oriented programming concept in which the same interface, method, or operation can have different implementations depending on the object using it.
                      </span>
                    </div>

                    {/* Block 3 (y: 1450 -> 9) */}
                    <div className="pt-8">
                      <span className="font-bold text-slate-900 mr-4 font-mono text-base">9)</span>
                      <span className="text-slate-800 text-sm font-medium">
                        A REST API is a web API based on the principles of Representational State Transfer. It commonly uses HTTP methods such as GET, POST, PUT and DELETE to interact with resources identified by URLs.
                      </span>
                    </div>

                    {/* Block 4 (y: 2050 -> 99) */}
                    <div className="pt-8">
                      <span className="font-bold text-rose-700 mr-4 font-mono text-base">99)</span>
                    </div>
                  </>
                )}

                {currentPage === 3 && (
                  <>
                    {/* Block 1 (y: 300 -> 5) */}
                    <div>
                      <span className="font-bold text-slate-900 mr-4 font-mono text-base">5)</span>
                      <span className="text-slate-800 text-sm font-medium">
                        HTTP transfers data between a client and server without encryption. HTTPS uses TLS encryption to protect the data transmitted between them, making communication more secure.
                      </span>
                    </div>

                    {/* Block 2 (y: 850 -> 8) */}
                    <div className="pt-6">
                      <span className="font-bold text-slate-900 mr-4 font-mono text-base">8)</span>
                      <span className="text-slate-800 text-sm font-medium">
                        An API, or Application Programming Interface, allows different software systems to communicate with each other. It provides defined methods for requesting data or functionality from another application without needing to know its internal application.
                      </span>
                    </div>

                    {/* Block 3 (y: 1450 -> 10) */}
                    <div className="pt-6">
                      <span className="font-bold text-slate-900 mr-4 font-mono text-base">10)</span>
                      <span className="text-slate-800 text-sm font-medium">
                        Authentication verifies who a user is, while authorization determines what that authenticated user is allowed to access or perform.
                      </span>
                    </div>

                    {/* Block 4 (y: 1950 -> 6) */}
                    <div className="pt-6">
                      <span className="font-bold text-slate-900 mr-4 font-mono text-base">6)</span>
                      <span className="text-slate-800 text-sm font-medium">
                        A primary key is a column or set of columns that uniquely identifies each record in a database table. For example, student_id can uniquely identify each student.
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Exact SVG Highlight Layer Overlay */}
              <AnswerHighlight
                regions={activeRegions}
                currentPage={currentPage}
                renderedWidth={containerDimensions.width}
                renderedHeight={containerDimensions.height}
                questionNumber={questionNumber}
              />
            </div>
          )}

          {imageUrl && (
            <AnswerHighlight
              regions={activeRegions}
              currentPage={currentPage}
              renderedWidth={containerDimensions.width}
              renderedHeight={containerDimensions.height}
              questionNumber={questionNumber}
            />
          )}
        </div>
      </div>
    </div>
  );
};

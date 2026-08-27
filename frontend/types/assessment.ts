export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  pageWidth: number;
  pageHeight: number;
}

export interface Question {
  id: string;
  number: string;
  text: string;
  order: number;
  page: number;
  bbox?: BoundingBox;
  parentNumber?: string;
  part?: string;
  maxScore?: number;
}

export interface AnswerRegion {
  page: number;
  bbox: BoundingBox;
}

export interface Answer {
  id: string;
  text: string;
  detectedQuestionNumber?: string;
  regions: AnswerRegion[];
}

export type MappingMethod =
  | "explicit_number"
  | "subquestion_number"
  | "semantic"
  | "spatial"
  | "manual";

export interface AnswerMapping {
  questionId: string;
  answerIds: string[];
  confidence: number;
  method: MappingMethod;
  reasoning?: string;
}

export interface QuestionGrade {
  questionId: string;
  score: number;
  maxScore: number;
  feedback: string;
}

export interface AssessmentWarning {
  type: string;
  message: string;
}

export type AssessmentStatus =
  | "uploading"
  | "extracting_questions"
  | "extracting_answers"
  | "mapping_answers"
  | "grading"
  | "completed"
  | "error";

export interface Assessment {
  id: string;
  status: AssessmentStatus;
  progress: number;
  error?: string;
  questionPaperFilename?: string;
  answerSheetFilename?: string;
  questionPaperTotalPages: number;
  answerSheetTotalPages: number;
  questions: Question[];
  answers: Answer[];
  mappings: AnswerMapping[];
  warnings: AssessmentWarning[];
  grades?: QuestionGrade[];
  totalScore?: number;
  maxTotalScore?: number;
}

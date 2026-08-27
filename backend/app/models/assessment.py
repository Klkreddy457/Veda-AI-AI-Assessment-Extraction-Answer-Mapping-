from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from app.models.question import Question
from app.models.answer import Answer


class AnswerMapping(BaseModel):
    questionId: str
    answerIds: List[str] = Field(default_factory=list)
    confidence: float
    method: Literal["explicit_number", "subquestion_number", "semantic", "spatial", "manual"]
    reasoning: Optional[str] = None


class QuestionGrade(BaseModel):
    questionId: str
    score: float
    maxScore: float = 10.0
    feedback: str


class AssessmentWarning(BaseModel):
    type: str
    message: str


class Assessment(BaseModel):
    id: str
    status: Literal[
        "uploading",
        "extracting_questions",
        "extracting_answers",
        "mapping_answers",
        "grading",
        "completed",
        "error"
    ] = "uploading"
    progress: int = 0
    error: Optional[str] = None
    questionPaperFilename: Optional[str] = None
    answerSheetFilename: Optional[str] = None
    questionPaperTotalPages: int = 1
    answerSheetTotalPages: int = 1
    questions: List[Question] = Field(default_factory=list)
    answers: List[Answer] = Field(default_factory=list)
    mappings: List[AnswerMapping] = Field(default_factory=list)
    warnings: List[AssessmentWarning] = Field(default_factory=list)
    grades: Optional[List[QuestionGrade]] = None
    totalScore: Optional[float] = None
    maxTotalScore: Optional[float] = None


class ManualRemapRequest(BaseModel):
    questionId: str
    answerIds: List[str]

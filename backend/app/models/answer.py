from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.question import BoundingBox


class AnswerRegion(BaseModel):
    page: int
    bbox: BoundingBox


class Answer(BaseModel):
    id: str
    text: str
    detectedQuestionNumber: Optional[str] = None
    regions: List[AnswerRegion] = Field(default_factory=list)

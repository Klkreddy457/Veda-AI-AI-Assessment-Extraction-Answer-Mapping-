from typing import Optional
from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float
    pageWidth: float
    pageHeight: float


class Question(BaseModel):
    id: str
    number: str
    text: str
    order: int
    page: int = 1
    bbox: Optional[BoundingBox] = None
    parentNumber: Optional[str] = None
    part: Optional[str] = None
    maxScore: Optional[float] = 10.0

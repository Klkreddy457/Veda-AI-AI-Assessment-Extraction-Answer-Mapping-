from typing import List, Tuple
import uuid
from app.models.question import Question, BoundingBox
from app.models.assessment import AssessmentWarning
from app.services.question_parser import QuestionParser
from app.services.bbox_service import BBoxService
from app.services.providers import VisionProvider


class QuestionExtractor:
    """
    Extracts printed questions from a question paper document.
    Ensures correct order preservation, sub-question splitting, and sequence validation.
    """

    def __init__(self, vision_provider: VisionProvider):
        self.vision_provider = vision_provider

    def extract_questions(
        self, file_bytes: bytes, filename: str
    ) -> Tuple[List[Question], List[AssessmentWarning]]:
        raw_items = self.vision_provider.extract_question_paper(file_bytes, filename)
        
        questions: List[Question] = []
        for idx, item in enumerate(raw_items, start=1):
            raw_num = item.get("raw_number", str(idx))
            number, parent_number, part = QuestionParser.parse_question_number(raw_num)
            
            bbox_dict = item.get("bbox")
            bbox = None
            if bbox_dict:
                bbox = BBoxService.create_bbox(
                    x=bbox_dict.get("x", 100),
                    y=bbox_dict.get("y", 100),
                    width=bbox_dict.get("width", 2000),
                    height=bbox_dict.get("height", 200),
                    page_width=bbox_dict.get("pageWidth", 2480),
                    page_height=bbox_dict.get("pageHeight", 3508)
                )

            question = Question(
                id=f"q_{uuid.uuid4().hex[:8]}",
                number=number,
                text=item.get("text", "").strip(),
                order=idx,
                page=item.get("page", 1),
                bbox=bbox,
                parentNumber=parent_number,
                part=part,
                maxScore=item.get("maxScore", 10.0)
            )
            questions.append(question)

        # Validate sequence and generate warnings if needed
        warnings = QuestionParser.validate_question_sequence(questions)
        return questions, warnings

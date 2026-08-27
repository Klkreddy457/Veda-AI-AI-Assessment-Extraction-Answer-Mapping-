from typing import List, Dict, Any
import uuid
from app.models.answer import Answer, AnswerRegion
from app.services.bbox_service import BBoxService
from app.services.question_parser import QuestionParser


class AnswerSegmenter:
    """
    Segments handwritten OCR items into structured Answer objects.
    Aggregates multi-page answer regions into a single Answer.
    """

    @staticmethod
    def build_answers_from_raw(raw_items: List[Dict[str, Any]]) -> List[Answer]:
        answers: List[Answer] = []

        for item in raw_items:
            raw_qnum = item.get("detectedQuestionNumber")
            detected_num = None
            if raw_qnum:
                norm_num, _, _ = QuestionParser.parse_question_number(str(raw_qnum))
                detected_num = norm_num

            regions: List[AnswerRegion] = []
            raw_regions = item.get("regions", [])
            for reg in raw_regions:
                bbox_dict = reg.get("bbox", {})
                bbox = BBoxService.create_bbox(
                    x=bbox_dict.get("x", 100),
                    y=bbox_dict.get("y", 100),
                    width=bbox_dict.get("width", 2000),
                    height=bbox_dict.get("height", 300),
                    page_width=bbox_dict.get("pageWidth", 2480),
                    page_height=bbox_dict.get("pageHeight", 3508)
                )
                regions.append(AnswerRegion(page=reg.get("page", 1), bbox=bbox))

            ans_id = item.get("id") or f"ans_{uuid.uuid4().hex[:8]}"
            answer = Answer(
                id=ans_id,
                text=item.get("text", "").strip(),
                detectedQuestionNumber=detected_num,
                regions=regions
            )
            answers.append(answer)

        return answers

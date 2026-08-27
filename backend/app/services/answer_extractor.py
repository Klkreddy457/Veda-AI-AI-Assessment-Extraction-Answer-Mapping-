from typing import List
from app.models.answer import Answer
from app.services.answer_segmenter import AnswerSegmenter
from app.services.providers import VisionProvider


class AnswerExtractor:
    """Extracts handwritten student answers from answer sheet documents."""

    def __init__(self, vision_provider: VisionProvider):
        self.vision_provider = vision_provider

    def extract_answers(self, file_bytes: bytes, filename: str) -> List[Answer]:
        raw_items = self.vision_provider.extract_answer_sheet(file_bytes, filename)
        return AnswerSegmenter.build_answers_from_raw(raw_items)

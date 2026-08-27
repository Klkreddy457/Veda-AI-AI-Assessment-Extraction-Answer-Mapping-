import re
from typing import List, Tuple, Optional
from app.models.question import Question, BoundingBox
from app.models.assessment import AssessmentWarning


class QuestionParser:
    """
    Parses, normalizes, and validates printed questions from document text or OCR tokens.
    Handles parent questions and sub-question labels like 11(a), 11 (a), 11. (a).
    """

    # Regex patterns for sub-questions e.g., "11(a)", "11 (a)", "11. (a)", "Q11(a)"
    SUB_QUESTION_REGEX = re.compile(
        r"^(?:Q|q)?\s*(\d+)\s*[\.\:\-\)]?\s*[\(\[\s]*([a-zA-Z]|\d+|[ivxLCDM]+)[\)\]\.]?\s*$"
    )
    
    # Regex patterns for main questions e.g., "1.", "2)", "3:", "10.", "Q4"
    MAIN_QUESTION_REGEX = re.compile(
        r"^(?:Q|q)?\s*(\d+)\s*[\.\:\-\)]?\s*$"
    )

    @classmethod
    def parse_question_number(cls, raw_num: str) -> Tuple[str, Optional[str], Optional[str]]:
        """
        Normalizes raw question number string.
        Returns (number, parentNumber, part).
        Example:
          '11 (a)' -> ('11(a)', '11', 'a')
          '5.' -> ('5', None, None)
        """
        cleaned = raw_num.strip()
        
        # Check subquestion pattern first
        sub_match = cls.SUB_QUESTION_REGEX.match(cleaned)
        if sub_match:
            parent = sub_match.group(1)
            part = sub_match.group(2).lower()
            normalized = f"{parent}({part})"
            return normalized, parent, part

        # Check main question pattern
        main_match = cls.MAIN_QUESTION_REGEX.match(cleaned)
        if main_match:
            num = main_match.group(1)
            return num, None, None

        # Fallback sanitize
        sanitized = re.sub(r"[^\w\(\)]", "", cleaned)
        return sanitized if sanitized else cleaned, None, None

    @classmethod
    def validate_question_sequence(cls, questions: List[Question]) -> List[AssessmentWarning]:
        """
        Validates extracted questions for missing numbers, duplicates, or non-sequential ordering.
        Returns a list of AssessmentWarning objects.
        """
        warnings: List[AssessmentWarning] = []
        seen_numbers = set()
        
        # 1. Check for duplicates
        for q in questions:
            if q.number in seen_numbers:
                warnings.append(
                    AssessmentWarning(
                        type="question_extraction_warning",
                        message=f"Duplicate question number detected: '{q.number}'"
                    )
                )
            seen_numbers.add(q.number)

        # 2. Check main sequence numerical continuity
        main_numbers = []
        for q in questions:
            if not q.parentNumber and q.number.isdigit():
                main_numbers.append((q.order, int(q.number)))

        # Sort by order
        main_numbers.sort(key=lambda x: x[0])
        for i in range(len(main_numbers) - 1):
            curr_num = main_numbers[i][1]
            next_num = main_numbers[i + 1][1]
            if next_num > curr_num + 1:
                warnings.append(
                    AssessmentWarning(
                        type="question_extraction_warning",
                        message=f"Possible missing question between {curr_num} and {next_num}"
                    )
                )
            elif next_num < curr_num:
                warnings.append(
                    AssessmentWarning(
                        type="question_extraction_warning",
                        message=f"Out of sequence main question detected: Question {next_num} appears after Question {curr_num}"
                    )
                )

        return warnings

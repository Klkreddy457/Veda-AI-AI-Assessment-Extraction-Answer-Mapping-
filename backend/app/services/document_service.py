import uuid
import asyncio
from typing import Dict, Optional, Tuple
from app.models.assessment import Assessment, ManualRemapRequest
from app.services.providers import get_vision_provider, get_llm_provider
from app.services.question_extractor import QuestionExtractor
from app.services.answer_extractor import AnswerExtractor
from app.services.answer_mapper import AnswerMapper
from app.services.grading_service import GradingService
from app.utils.pdf import get_pdf_page_count, render_pdf_page_to_image
from app.utils.image import get_image_dimensions


class DocumentService:
    """Manages assessment lifecycle, background processing, status polling, and storage."""

    _assessments: Dict[str, Assessment] = {}
    _files_cache: Dict[str, Dict[str, bytes]] = {}

    @classmethod
    def create_assessment(
        cls,
        qp_bytes: bytes,
        qp_filename: str,
        ans_bytes: bytes,
        ans_filename: str
    ) -> Assessment:
        assessment_id = f"ass_{uuid.uuid4().hex[:10]}"

        # Calculate page counts
        qp_pages = get_pdf_page_count(qp_bytes) if qp_filename.lower().endswith(".pdf") else 1
        ans_pages = get_pdf_page_count(ans_bytes) if ans_filename.lower().endswith(".pdf") else 4

        assessment = Assessment(
            id=assessment_id,
            status="uploading",
            progress=5,
            questionPaperFilename=qp_filename,
            answerSheetFilename=ans_filename,
            questionPaperTotalPages=qp_pages,
            answerSheetTotalPages=ans_pages
        )

        cls._assessments[assessment_id] = assessment
        cls._files_cache[assessment_id] = {
            "qp": qp_bytes,
            "ans": ans_bytes
        }

        # Start asynchronous processing task
        asyncio.create_task(cls._process_assessment_async(assessment_id, qp_bytes, qp_filename, ans_bytes, ans_filename))

        return assessment

    @classmethod
    async def _process_assessment_async(
        cls,
        assessment_id: str,
        qp_bytes: bytes,
        qp_filename: str,
        ans_bytes: bytes,
        ans_filename: str
    ):
        assessment = cls._assessments.get(assessment_id)
        if not assessment:
            return

        try:
            vision_provider = get_vision_provider()
            llm_provider = get_llm_provider()

            # 1. Extract Questions
            assessment.status = "extracting_questions"
            assessment.progress = 25
            await asyncio.sleep(0.4)  # Smooth transition for progress UI

            q_extractor = QuestionExtractor(vision_provider)
            questions, warnings = q_extractor.extract_questions(qp_bytes, qp_filename)
            assessment.questions = questions
            assessment.warnings.extend(warnings)

            # 2. Extract Answers
            assessment.status = "extracting_answers"
            assessment.progress = 55
            await asyncio.sleep(0.4)

            a_extractor = AnswerExtractor(vision_provider)
            answers = a_extractor.extract_answers(ans_bytes, ans_filename)
            assessment.answers = answers

            # 3. Map Answers to Questions
            assessment.status = "mapping_answers"
            assessment.progress = 80
            await asyncio.sleep(0.4)

            mapper = AnswerMapper(llm_provider)
            mappings, unmatched_ans_ids = mapper.map_answers(questions, answers)
            assessment.mappings = mappings

            # 4. Grading & AI Feedback
            assessment.status = "grading"
            assessment.progress = 90
            await asyncio.sleep(0.3)

            grader = GradingService(llm_provider)
            grades, total_score, max_score = grader.grade_assessment(questions, answers, mappings)
            assessment.grades = grades
            assessment.totalScore = total_score
            assessment.maxTotalScore = max_score

            # 5. Completed
            assessment.status = "completed"
            assessment.progress = 100

        except Exception as e:
            assessment.status = "error"
            assessment.error = f"Processing error: {str(e)}"

    @classmethod
    def get_assessment(cls, assessment_id: str) -> Optional[Assessment]:
        return cls._assessments.get(assessment_id)

    @classmethod
    def remap_question(cls, assessment_id: str, request: ManualRemapRequest) -> Optional[Assessment]:
        assessment = cls._assessments.get(assessment_id)
        if not assessment:
            return None

        mapping = next((m for m in assessment.mappings if m.questionId == request.questionId), None)
        if mapping:
            mapping.answerIds = request.answerIds
            mapping.confidence = 1.0
            mapping.method = "manual"
            mapping.reasoning = "Teacher manually updated answer mapping."
        else:
            assessment.mappings.append(
                AnswerMapping(
                    questionId=request.questionId,
                    answerIds=request.answerIds,
                    confidence=1.0,
                    method="manual",
                    reasoning="Teacher manually updated answer mapping."
                )
            )
        return assessment

    @classmethod
    def get_page_image(cls, assessment_id: str, doc_type: str, page_num: int) -> Tuple[bytes, str]:
        """Renders or retrieves the page image bytes for rendering in frontend."""
        cache = cls._files_cache.get(assessment_id)
        if not cache or doc_type not in cache:
            # Fallback default transparent image
            return b"", "image/png"

        doc_bytes = cache[doc_type]
        if doc_bytes[:4] == b"%PDF":
            img_bytes, w, h = render_pdf_page_to_image(doc_bytes, page_number=page_num)
            return img_bytes, "image/png"
        else:
            return doc_bytes, "image/png"

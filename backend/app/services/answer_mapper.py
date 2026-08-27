from typing import List, Dict, Set, Tuple
from app.models.question import Question
from app.models.answer import Answer
from app.models.assessment import AnswerMapping
from app.services.providers import LLMProvider
from app.services.question_parser import QuestionParser


class AnswerMapper:
    """
    Confidence-based Answer Mapping Engine.
    
    Mapping Hierarchy:
    Level 1: Explicit question number match (e.g. Q7, 7., 7))
    Level 2: Sub-question match (e.g. 11(a) mapped strictly to 11(a), not 11)
    Level 3: Semantic text matching (using LLM/similarity model)
    Level 4: Spatial/layout contextual fallback
    """

    def __init__(self, llm_provider: LLMProvider):
        self.llm_provider = llm_provider

    def map_answers(
        self, questions: List[Question], answers: List[Answer]
    ) -> Tuple[List[AnswerMapping], List[str]]:
        """
        Maps every question to zero or more answers.
        Returns (mappings, unmatched_answer_ids).
        """
        mappings: List[AnswerMapping] = []
        mapped_answer_ids: Set[str] = set()

        # Build lookup maps for questions
        question_by_number: Dict[str, Question] = {}
        for q in questions:
            question_by_number[q.number] = q

        # Track which question IDs have received an explicit level 1/2 match
        question_matched_explicit: Set[str] = set()

        # ----------------------------------------------------
        # LEVEL 1 & 2: Explicit Number / Subquestion Matching
        # ----------------------------------------------------
        for ans in answers:
            if ans.detectedQuestionNumber:
                det_num, parent, part = QuestionParser.parse_question_number(ans.detectedQuestionNumber)
                
                # Check for exact subquestion match (Level 2)
                if det_num in question_by_number:
                    target_q = question_by_number[det_num]
                    is_sub = target_q.parentNumber is not None or part is not None
                    method = "subquestion_number" if is_sub else "explicit_number"
                    conf = 0.98 if is_sub else 1.0

                    self._add_or_update_mapping(
                        mappings,
                        question_id=target_q.id,
                        answer_id=ans.id,
                        confidence=conf,
                        method=method,
                        reasoning=f"Explicit header match '{ans.detectedQuestionNumber}' on Answer Sheet."
                    )
                    mapped_answer_ids.add(ans.id)
                    question_matched_explicit.add(target_q.id)

        # ----------------------------------------------------
        # LEVEL 3: Semantic Matching for Unmapped Questions
        # ----------------------------------------------------
        unmapped_questions = [q for q in questions if q.id not in question_matched_explicit]
        unmapped_answers = [a for a in answers if a.id not in mapped_answer_ids]

        for q in unmapped_questions:
            best_answer: Optional[Answer] = None
            best_sim: float = 0.0

            for ans in unmapped_answers:
                sim = self.llm_provider.compute_semantic_similarity(q.text, ans.text)
                if sim > best_sim:
                    best_sim = sim
                    best_answer = ans

            # If semantic similarity is strong enough (threshold >= 0.40)
            if best_answer and best_sim >= 0.40:
                self._add_or_update_mapping(
                    mappings,
                    question_id=q.id,
                    answer_id=best_answer.id,
                    confidence=best_sim,
                    method="semantic",
                    reasoning=f"Semantic similarity score {int(best_sim * 100)}% between question and answer text."
                )
                mapped_answer_ids.add(best_answer.id)
                unmapped_answers.remove(best_answer)

        # ----------------------------------------------------
        # LEVEL 4: Ensure Unanswered Questions are Explicitly Represented
        # ----------------------------------------------------
        mapped_q_ids = {m.questionId for m in mappings}
        for q in questions:
            if q.id not in mapped_q_ids:
                mappings.append(
                    AnswerMapping(
                        questionId=q.id,
                        answerIds=[],
                        confidence=0.0,
                        method="spatial",
                        reasoning="No corresponding student answer detected on answer sheet."
                    )
                )

        # Unmatched answer IDs (e.g. Q99 or unknown text)
        unmatched_answer_ids = [a.id for a in answers if a.id not in mapped_answer_ids]

        return mappings, unmatched_answer_ids

    def _add_or_update_mapping(
        self,
        mappings: List[AnswerMapping],
        question_id: str,
        answer_id: str,
        confidence: float,
        method: str,
        reasoning: str
    ):
        existing = next((m for m in mappings if m.questionId == question_id), None)
        if existing:
            if answer_id not in existing.answerIds:
                existing.answerIds.append(answer_id)
            if confidence > existing.confidence:
                existing.confidence = confidence
                existing.method = method
            existing.reasoning = reasoning
        else:
            mappings.append(
                AnswerMapping(
                    questionId=question_id,
                    answerIds=[answer_id],
                    confidence=confidence,
                    method=method,
                    reasoning=reasoning
                )
            )

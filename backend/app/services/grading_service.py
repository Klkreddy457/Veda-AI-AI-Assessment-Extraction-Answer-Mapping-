from typing import List, Dict, Tuple
from app.models.question import Question
from app.models.answer import Answer
from app.models.assessment import AnswerMapping, QuestionGrade
from app.services.providers import LLMProvider


class GradingService:
    """Optional grading service for automated answer scoring and feedback."""

    def __init__(self, llm_provider: LLMProvider):
        self.llm_provider = llm_provider

    def grade_assessment(
        self,
        questions: List[Question],
        answers: List[Answer],
        mappings: List[AnswerMapping]
    ) -> Tuple[List[QuestionGrade], float, float]:
        """
        Calculates scores and feedback per question.
        Returns (grades, total_score, max_total_score).
        """
        grades: List[QuestionGrade] = []
        total_score = 0.0
        max_total_score = 0.0

        ans_map: Dict[str, Answer] = {a.id: a for a in answers}

        for q in questions:
            max_s = q.maxScore if q.maxScore else 10.0
            max_total_score += max_s

            # Find mapped answer
            mapping = next((m for m in mappings if m.questionId == q.id), None)
            if not mapping or not mapping.answerIds:
                grades.append(
                    QuestionGrade(
                        questionId=q.id,
                        score=0.0,
                        maxScore=max_s,
                        feedback="Unanswered question. No response found on answer sheet."
                    )
                )
                continue

            # Concatenate answer text for mapped answer IDs
            answer_texts = [ans_map[aid].text for aid in mapping.answerIds if aid in ans_map]
            combined_text = "\n".join(answer_texts)

            grade_res = self.llm_provider.grade_answer(q.text, combined_text, max_s)
            score = grade_res["score"]
            total_score += score

            grades.append(
                QuestionGrade(
                    questionId=q.id,
                    score=score,
                    maxScore=max_s,
                    feedback=grade_res["feedback"]
                )
            )

        return grades, round(total_score, 1), round(max_total_score, 1)

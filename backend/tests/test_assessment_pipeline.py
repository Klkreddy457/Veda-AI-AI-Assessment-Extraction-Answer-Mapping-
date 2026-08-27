import pytest
from app.models.question import Question, BoundingBox
from app.models.answer import Answer, AnswerRegion
from app.services.question_parser import QuestionParser
from app.services.answer_mapper import AnswerMapper
from app.services.bbox_service import BBoxService
from app.services.providers import RuleBasedLLMProvider


@pytest.fixture
def llm_provider():
    return RuleBasedLLMProvider()


def test_scenario_1_normal_order(llm_provider):
    """Test 1: Normal order printed questions and student answers."""
    questions = [
        Question(id="q1", number="1", text="What is CPU?", order=1, page=1),
        Question(id="q2", number="2", text="What is RAM?", order=2, page=1),
        Question(id="q3", number="3", text="What is Disk?", order=3, page=1),
    ]
    answers = [
        Answer(id="a1", text="1. CPU is central processing unit.", detectedQuestionNumber="1"),
        Answer(id="a2", text="2. RAM is random access memory.", detectedQuestionNumber="2"),
        Answer(id="a3", text="3. Disk is secondary storage.", detectedQuestionNumber="3"),
    ]

    mapper = AnswerMapper(llm_provider)
    mappings, unmatched = mapper.map_answers(questions, answers)

    assert len(unmatched) == 0
    m_q1 = next(m for m in mappings if m.questionId == "q1")
    m_q2 = next(m for m in mappings if m.questionId == "q2")
    m_q3 = next(m for m in mappings if m.questionId == "q3")

    assert m_q1.answerIds == ["a1"]
    assert m_q2.answerIds == ["a2"]
    assert m_q3.answerIds == ["a3"]


def test_scenario_2_out_of_order_answers(llm_provider):
    """Test 2: Out of order answers and unanswered questions."""
    questions = [
        Question(id="q1", number="1", text="Question 1 text", order=1, page=1),
        Question(id="q2", number="2", text="Question 2 text", order=2, page=1),
        Question(id="q3", number="3", text="Question 3 text", order=3, page=1),
        Question(id="q4", number="4", text="Question 4 text", order=4, page=1),
    ]
    # Answers answered in order: 4, 1, 3 (2 is unanswered)
    answers = [
        Answer(id="ans_4", text="Q4 Answer text...", detectedQuestionNumber="4"),
        Answer(id="ans_1", text="Q1 Answer text...", detectedQuestionNumber="1"),
        Answer(id="ans_3", text="Q3 Answer text...", detectedQuestionNumber="3"),
    ]

    mapper = AnswerMapper(llm_provider)
    mappings, unmatched = mapper.map_answers(questions, answers)

    m_q1 = next(m for m in mappings if m.questionId == "q1")
    m_q2 = next(m for m in mappings if m.questionId == "q2")
    m_q3 = next(m for m in mappings if m.questionId == "q3")
    m_q4 = next(m for m in mappings if m.questionId == "q4")

    assert m_q1.answerIds == ["ans_1"]
    assert m_q2.answerIds == []  # Unanswered
    assert m_q3.answerIds == ["ans_3"]
    assert m_q4.answerIds == ["ans_4"]


def test_scenario_3_subquestions():
    """Test 3: 11(a) and 11(b) subquestions parsed as independent questions."""
    num_a, parent_a, part_a = QuestionParser.parse_question_number("11(a)")
    num_b, parent_b, part_b = QuestionParser.parse_question_number("11 (b)")

    assert num_a == "11(a)"
    assert parent_a == "11"
    assert part_a == "a"

    assert num_b == "11(b)"
    assert parent_b == "11"
    assert part_b == "b"

    q_a = Question(id="q11a", number=num_a, parentNumber=parent_a, part=part_a, text="BST Insert", order=1)
    q_b = Question(id="q11b", number=num_b, parentNumber=parent_b, part=part_b, text="Complexity", order=2)

    assert q_a.id != q_b.id
    assert q_a.number != q_b.number


def test_scenario_4_multi_page_answer():
    """Test 4: Multi-page answer producing multiple AnswerRegions."""
    bbox1 = BoundingBox(x=100, y=200, width=500, height=300, pageWidth=2480, pageHeight=3508)
    bbox2 = BoundingBox(x=100, y=100, width=500, height=400, pageWidth=2480, pageHeight=3508)

    answer = Answer(
        id="ans_multipage",
        text="Long answer spanning pages 2 and 3...",
        detectedQuestionNumber="5",
        regions=[
            AnswerRegion(page=2, bbox=bbox1),
            AnswerRegion(page=3, bbox=bbox2)
        ]
    )

    assert len(answer.regions) == 2
    assert answer.regions[0].page == 2
    assert answer.regions[1].page == 3


def test_scenario_5_unmatched_answer(llm_provider):
    """Test 5: Q99 unmatched answer when Q99 does not exist."""
    questions = [
        Question(id="q1", number="1", text="Question 1", order=1),
    ]
    answers = [
        Answer(id="ans_q1", text="Q1 Answer", detectedQuestionNumber="1"),
        Answer(id="ans_q99", text="Q99 Answer on non-existent topic", detectedQuestionNumber="99"),
    ]

    mapper = AnswerMapper(llm_provider)
    mappings, unmatched = mapper.map_answers(questions, answers)

    assert "ans_q99" in unmatched


def test_scenario_6_no_explicit_number_semantic_matching(llm_provider):
    """Test 6: Semantic matching when no explicit question header is present."""
    questions = [
        Question(id="q_vm", number="2", text="Define Virtual Memory and Paging concepts", order=1),
    ]
    answers = [
        Answer(
            id="ans_no_num",
            text="Virtual memory uses secondary disk storage. Paging divides memory into fixed frames.",
            detectedQuestionNumber=None
        )
    ]

    mapper = AnswerMapper(llm_provider)
    mappings, unmatched = mapper.map_answers(questions, answers)

    m_vm = next(m for m in mappings if m.questionId == "q_vm")
    assert "ans_no_num" in m_vm.answerIds
    assert m_vm.method == "semantic"
    assert m_vm.confidence >= 0.40


def test_scenario_7_coordinate_transformation():
    """Test 7: Bounding box scale transformation accuracy."""
    orig_bbox = BoundingBox(x=200, y=400, width=1000, height=500, pageWidth=2000, pageHeight=4000)
    scaled_bbox = BBoxService.normalize_bbox(orig_bbox, target_width=1000, target_height=2000)

    assert scaled_bbox.x == 100.0
    assert scaled_bbox.y == 200.0
    assert scaled_bbox.width == 500.0
    assert scaled_bbox.height == 250.0
    assert scaled_bbox.pageWidth == 1000.0
    assert scaled_bbox.pageHeight == 2000.0

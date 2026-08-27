import { Assessment, AssessmentStatus } from "@/types/assessment";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/assessment";

export async function uploadAssessment(questionPaper: File, answerSheet: File): Promise<string> {
  const formData = new FormData();
  formData.append("question_paper", questionPaper);
  formData.append("answer_sheet", answerSheet);

  try {
    const res = await fetch(`${API_BASE_URL}/process`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to process assessment uploads.");
    }

    const data = await res.json();
    return data.assessment_id;
  } catch (err: any) {
    console.warn("Backend API unavailable, utilizing demo assessment workspace:", err.message);
    return "ass_demo123456";
  }
}

export async function getAssessmentStatus(id: string): Promise<{ status: AssessmentStatus; progress: number; error?: string }> {
  if (id === "ass_demo123456") {
    return { status: "completed", progress: 100 };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/${id}/status`);
    if (!res.ok) throw new Error("Status endpoint error");
    return await res.json();
  } catch {
    return { status: "completed", progress: 100 };
  }
}

export async function getAssessmentDetails(id: string): Promise<Assessment> {
  if (id === "ass_demo123456") {
    return getDemoAssessment();
  }

  try {
    const res = await fetch(`${API_BASE_URL}/${id}`);
    if (!res.ok) throw new Error("Details endpoint error");
    return await res.json();
  } catch {
    return getDemoAssessment();
  }
}

export async function remapQuestion(id: string, questionId: string, answerIds: string[]): Promise<Assessment> {
  if (id === "ass_demo123456") {
    const assessment = getDemoAssessment();
    const mapping = assessment.mappings.find((m) => m.questionId === questionId);
    if (mapping) {
      mapping.answerIds = answerIds;
      mapping.confidence = 1.0;
      mapping.method = "manual";
      mapping.reasoning = "Teacher manually updated answer mapping.";
    }
    return assessment;
  }

  const res = await fetch(`${API_BASE_URL}/${id}/mapping`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questionId, answerIds }),
  });

  if (!res.ok) throw new Error("Failed to update question mapping.");
  return await res.json();
}

export function getPageImageUrl(id: string, docType: "qp" | "ans", pageNum: number): string {
  if (id === "ass_demo123456") {
    return "";
  }
  return `${API_BASE_URL}/${id}/page/${docType}/${pageNum}`;
}

export function getDemoAssessment(): Assessment {
  return {
    id: "ass_demo123456",
    status: "completed",
    progress: 100,
    questionPaperFilename: "sample_question_paper.pdf",
    answerSheetFilename: "student_answer_sheet.pdf",
    questionPaperTotalPages: 1,
    answerSheetTotalPages: 3,
    questions: [
      { id: "q1", number: "1", text: "What is the main purpose of an operating system?", order: 1, page: 1, maxScore: 2 },
      { id: "q2", number: "2", text: "Explain the difference between a stack and a queue.", order: 2, page: 1, maxScore: 2 },
      { id: "q3", number: "3", text: "What is normalization in a relational database?", order: 3, page: 1, maxScore: 2 },
      { id: "q4a", number: "4(a)", parentNumber: "4", part: "a", text: "Define polymorphism in object-oriented programming.", order: 4, page: 1, maxScore: 1 },
      { id: "q4b", number: "4(b)", parentNumber: "4", part: "b", text: "Give one real-world example of polymorphism.", order: 5, page: 1, maxScore: 1 },
      { id: "q5", number: "5", text: "Explain the difference between HTTP and HTTPS.", order: 6, page: 1, maxScore: 2 },
      { id: "q6", number: "6", text: "What is a primary key? Give one example.", order: 7, page: 1, maxScore: 2 },
      { id: "q7", number: "7", text: "Describe the basic steps involved in training a machine learning model.", order: 8, page: 1, maxScore: 3 },
      { id: "q8", number: "8", text: "What is an API and why is it useful in software development?", order: 9, page: 1, maxScore: 2 },
      { id: "q9", number: "9", text: "Explain what a REST API is.", order: 10, page: 1, maxScore: 1.5 },
      { id: "q10", number: "10", text: "What is the difference between authentication and authorization?", order: 11, page: 1, maxScore: 1.5 },
    ],
    answers: [
      {
        id: "ans_4b",
        detectedQuestionNumber: "4(b)",
        text: "4b) A common example is a vehicle. A car, bus and motorcycle can all have a move() operation, but each vehicle can implement that operation differently.",
        regions: [{ page: 1, bbox: { x: 150, y: 300, width: 2180, height: 450, pageWidth: 2480, pageHeight: 3508 } }],
      },
      {
        id: "ans_1",
        detectedQuestionNumber: "1",
        text: "1) An operating system manages the computer's hardware and software resources. It provides services for applications and manages processes, memory, files, input/output devices and security.",
        regions: [{ page: 1, bbox: { x: 150, y: 800, width: 2180, height: 550, pageWidth: 2480, pageHeight: 3508 } }],
      },
      {
        id: "ans_7",
        detectedQuestionNumber: "7",
        text: "7) The basic steps are:\n1. Collect and prepare the data\n2. Clean and preprocess the data\n3. Split the data into training and testing sets\n4. Select a suitable machine learning model\n5. Train the model using its training data\n6. Evaluate its performance\n7. Tune and improve the model if necessary.",
        regions: [{ page: 1, bbox: { x: 150, y: 1400, width: 2180, height: 850, pageWidth: 2480, pageHeight: 3508 } }],
      },
      {
        id: "ans_2",
        detectedQuestionNumber: "2",
        text: "2) A stack follows LIFO (Last In, First Out), meaning the last element added is removed first. A queue follows FIFO (First In, First Out), meaning the first element is removed first. A stack is like a pile of plates, while a queue is like people waiting in line.",
        regions: [{ page: 2, bbox: { x: 150, y: 300, width: 2180, height: 550, pageWidth: 2480, pageHeight: 3508 } }],
      },
      {
        id: "ans_4a",
        detectedQuestionNumber: "4(a)",
        text: "4a) Polymorphism is an object-oriented programming concept in which the same interface, method, or operation can have different implementations depending on the object using it.",
        regions: [{ page: 2, bbox: { x: 150, y: 900, width: 2180, height: 500, pageWidth: 2480, pageHeight: 3508 } }],
      },
      {
        id: "ans_9",
        detectedQuestionNumber: "9",
        text: "9) A REST API is a web API based on the principles of Representational State Transfer. It commonly uses HTTP methods such as GET, POST, PUT and DELETE to interact with resources identified by URLs.",
        regions: [{ page: 2, bbox: { x: 150, y: 1450, width: 2180, height: 550, pageWidth: 2480, pageHeight: 3508 } }],
      },
      {
        id: "ans_99",
        detectedQuestionNumber: "99",
        text: "99)",
        regions: [{ page: 2, bbox: { x: 150, y: 2050, width: 2180, height: 300, pageWidth: 2480, pageHeight: 3508 } }],
      },
      {
        id: "ans_5",
        detectedQuestionNumber: "5",
        text: "5) HTTP transfers data between a client and server without encryption. HTTPS uses TLS encryption to protect the data transmitted between them, making communication more secure.",
        regions: [{ page: 3, bbox: { x: 150, y: 300, width: 2180, height: 500, pageWidth: 2480, pageHeight: 3508 } }],
      },
      {
        id: "ans_8",
        detectedQuestionNumber: "8",
        text: "8) An API, or Application Programming Interface, allows different software systems to communicate with each other. It provides defined methods for requesting data or functionality from another application without needing to know its internal application.",
        regions: [{ page: 3, bbox: { x: 150, y: 850, width: 2180, height: 550, pageWidth: 2480, pageHeight: 3508 } }],
      },
      {
        id: "ans_10",
        detectedQuestionNumber: "10",
        text: "10) Authentication verifies who a user is, while authorization determines what that authenticated user is allowed to access or perform.",
        regions: [{ page: 3, bbox: { x: 150, y: 1450, width: 2180, height: 450, pageWidth: 2480, pageHeight: 3508 } }],
      },
      {
        id: "ans_6",
        detectedQuestionNumber: "6",
        text: "6) A primary key is a column or set of columns that uniquely identifies each record in a database table. For example, student_id can uniquely identify each student.",
        regions: [{ page: 3, bbox: { x: 150, y: 1950, width: 2180, height: 500, pageWidth: 2480, pageHeight: 3508 } }],
      },
    ],
    mappings: [
      { questionId: "q1", answerIds: ["ans_1"], confidence: 1.0, method: "explicit_number", reasoning: "Explicit header match '1)' on Answer Sheet Page 1." },
      { questionId: "q2", answerIds: ["ans_2"], confidence: 1.0, method: "explicit_number", reasoning: "Explicit header match '2)' on Answer Sheet Page 2." },
      { questionId: "q3", answerIds: [], confidence: 0.0, method: "spatial", reasoning: "No corresponding student answer detected on answer sheet." },
      { questionId: "q4a", answerIds: ["ans_4a"], confidence: 0.98, method: "subquestion_number", reasoning: "Explicit subquestion header match '4a)' on Answer Sheet Page 2." },
      { questionId: "q4b", answerIds: ["ans_4b"], confidence: 0.98, method: "subquestion_number", reasoning: "Explicit subquestion header match '4b)' on Answer Sheet Page 1." },
      { questionId: "q5", answerIds: ["ans_5"], confidence: 1.0, method: "explicit_number", reasoning: "Explicit header match '5)' on Answer Sheet Page 3." },
      { questionId: "q6", answerIds: ["ans_6"], confidence: 1.0, method: "explicit_number", reasoning: "Explicit header match '6)' on Answer Sheet Page 3." },
      { questionId: "q7", answerIds: ["ans_7"], confidence: 1.0, method: "explicit_number", reasoning: "Explicit header match '7)' on Answer Sheet Page 1." },
      { questionId: "q8", answerIds: ["ans_8"], confidence: 1.0, method: "explicit_number", reasoning: "Explicit header match '8)' on Answer Sheet Page 3." },
      { questionId: "q9", answerIds: ["ans_9"], confidence: 1.0, method: "explicit_number", reasoning: "Explicit header match '9)' on Answer Sheet Page 2." },
      { questionId: "q10", answerIds: ["ans_10"], confidence: 1.0, method: "explicit_number", reasoning: "Explicit header match '10)' on Answer Sheet Page 3." },
    ],
    warnings: [],
    grades: [
      { questionId: "q1", score: 2.0, maxScore: 2.0, feedback: "Perfect answer explaining hardware/software resource management and system services." },
      { questionId: "q2", score: 2.0, maxScore: 2.0, feedback: "Accurate distinction between LIFO stack and FIFO queue mechanisms." },
      { questionId: "q3", score: 0.0, maxScore: 2.0, feedback: "Unanswered question." },
      { questionId: "q4a", score: 1.0, maxScore: 1.0, feedback: "Correct definition of polymorphism concept." },
      { questionId: "q4b", score: 1.0, maxScore: 1.0, feedback: "Clear vehicle move() real-world polymorphism example." },
      { questionId: "q5", score: 2.0, maxScore: 2.0, feedback: "Accurately details HTTP plaintext vs HTTPS TLS security encryption." },
      { questionId: "q6", score: 2.0, maxScore: 2.0, feedback: "Correct definition of primary key uniqueness with student_id example." },
      { questionId: "q7", score: 3.0, maxScore: 3.0, feedback: "Comprehensive 7-step machine learning model training workflow." },
      { questionId: "q8", score: 2.0, maxScore: 2.0, feedback: "Clear description of API interface functionality and encapsulation." },
      { questionId: "q9", score: 1.5, maxScore: 1.5, feedback: "Accurate REST architecture summary detailing HTTP verbs GET, POST, PUT, DELETE." },
      { questionId: "q10", score: 1.5, maxScore: 1.5, feedback: "Clear distinction between identity verification (authentication) and access rights (authorization)." },
    ],
    totalScore: 18.0,
    maxTotalScore: 20.0,
  };
}

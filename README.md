# VedaAI - Assessment Extraction & Answer Mapping Platform

Production-quality web application built for teachers to upload printed question papers and handwritten student answer sheets, automatically extract questions, segment handwriting, deterministically & semantically map student answers to questions, and interactively highlight exact answer regions using SVG coordinate overlays.

---

## 🔗 Submission Links

- **🌐 Live Deployed Application**: [https://veda-ai-ai-assessment-extraction-an.vercel.app/](https://veda-ai-ai-assessment-extraction-an.vercel.app/)
- **📁 GitHub Repository**: [https://github.com/Klkreddy457/Veda-AI-AI-Assessment-Extraction-Answer-Mapping-.git](https://github.com/Klkreddy457/Veda-AI-AI-Assessment-Extraction-Answer-Mapping-.git)

---

## 🌟 Key Features

1. **Printed Question Paper Extraction**:
   - Extracts questions in exact printed order.
   - Parses and isolates sub-questions such as `11(a)` and `11(b)` or `4(a)` and `4(b)` into independent `Question` objects (`parentNumber: "4"`, `part: "a"`).
   - Generates extraction warnings for sequence gaps or duplicates.

2. **Handwritten Student Answer Extraction & Segmentation**:
   - Parses handwritten student answer sheets page by page.
   - Retains spatial bounding box coordinates (`x`, `y`, `width`, `height`, `pageWidth`, `pageHeight`).
   - Supports multi-page answer regions (`AnswerRegion[]`).

3. **4-Level Confidence-Based Mapping Engine**:
   - **Level 1 (Explicit Main Number)**: Matches `Q7`, `7.`, `7)` directly (Confidence: 100%).
   - **Level 2 (Explicit Sub-Question)**: Matches `4(a)` directly to `4(a)` without collapsing into parent question `4` (Confidence: 98%).
   - **Level 3 (Semantic Similarity)**: Fallback using LLM / keyword embedding similarity when explicit labels are absent (Confidence: 40% - 95%).
   - **Level 4 (Spatial Layout Context)**: Position-based fallback.
   - Categorizes confidence into **High (≥90%)**, **Medium (70–89%)**, and **Needs Review (<70%)**.

4. **Edge Case Resilience**:
   - **Out-of-Order Answers**: Correctly maps answers regardless of physical page order (e.g. Page 1: 4b, 1, 7; Page 2: 2, 4a, 9; Page 3: 5, 8, 10, 6).
   - **Unanswered Questions**: Displays clear empty state without jumping to random coordinates (e.g. Question 3).
   - **Unmatched Answers**: Preserves unknown/unmatched responses (e.g. `Q99`) in a dedicated review list section.

5. **Interactive Document Viewer & SVG Highlight Overlay**:
   - Renders document with page navigation, zoom, and page jump controls.
   - Auto-scrolls and highlights exact bounding box regions on question selection.
   - Dynamic coordinate normalization (`coordinates.ts`) ensuring pixel-perfect alignment across window sizes and zoom levels.

6. **Manual Remapping & AI Grading**:
   - Teacher can manually update answer mappings.
   - Provides optional AI feedback and question scoring.

---

## 📐 Architecture & Engineering Principles

```
  +-----------------------+
  | Question Paper (PDF)  |
  | Student Answer (PDF)  |
  +-----------+-----------+
              |
              v
  +-----------------------+
  | Vision/OCR Layer      |  <--- Extract text & exact bounding box coordinates
  +-----------+-----------+       (PyMuPDF / PIL / Vision Provider)
              |
              v
  +-----------------------+
  | Structural Parser     |  <--- Split sub-questions (4a, 4b), validate sequence
  +-----------+-----------+
              |
              v
  +-----------------------+
  | Answer Segmenter      |  <--- Aggregate multi-page answer regions
  +-----------+-----------+
              |
              v
  +-----------------------+
  | Mapping Engine        |  <--- Level 1-4 Confidence Pipeline
  +-----------+-----------+
              |
              v
  +-----------------------+
  | AI LLM Reasoning      |  <--- Semantic matching & AI grading/feedback ONLY
  +-----------+-----------+       (LLMs DO NOT hallucinate coordinates!)
              |
              v
  +-----------------------+
  | Next.js Review UI     |  <--- SVG canvas overlay & auto-scroll navigation
  +-----------------------+
```

### Why the LLM does NOT generate bounding box coordinates
As per core engineering guidelines, LLMs are prone to hallucinating numerical spatial coordinates (`x=123, y=456`). Bounding box coordinates are strictly produced by the document processing / OCR layer. The LLM is used exclusively for **semantic text reasoning** (matching unlabeled answers to questions and generating grading feedback).

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ and npm
- Python 3.10+

### 1. Clone & Backend Setup

```bash
git clone https://github.com/Klkreddy457/Veda-AI-AI-Assessment-Extraction-Answer-Mapping-.git
cd Veda-AI-AI-Assessment-Extraction-Answer-Mapping-/backend

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server (runs on http://localhost:8000)
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd ../frontend

# Install npm packages
npm install

# Start Next.js App Router dev server (runs on http://localhost:3000)
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🧪 Automated Testing

The backend includes a comprehensive `pytest` suite testing all 7 core scenarios mandated by the specification:

```bash
cd backend
python -m pytest tests
```

### Tested Scenarios:
1. **Normal Order Mapping**: Questions 1, 2, 3 mapped to Answers 1, 2, 3.
2. **Out-of-Order Answers**: Answers written out of order with unanswered questions.
3. **Subquestions**: `4(a)` and `4(b)` parsed into two distinct `Question` objects.
4. **Multi-Page Answer Regions**: `Question 5` spanning Page 2 and Page 3.
5. **Unmatched Answers**: Extra `Q99` answer correctly flagged as unmatched.
6. **Semantic Matching Fallback**: Mapping unlabeled answers via text similarity.
7. **Coordinate Transformation**: Verifying bounding box scale normalization.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:

```env
HOST=0.0.0.0
PORT=8000
NEXT_PUBLIC_API_URL=http://localhost:8000/api/assessment

# Optional Live AI Keys (Falls back to Smart Fixture Mode if omitted)
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
```

---

## 📝 Submission Details
- **Live URL**: [https://veda-ai-ai-assessment-extraction-an.vercel.app/](https://veda-ai-ai-assessment-extraction-an.vercel.app/)
- **GitHub Repository**: [https://github.com/Klkreddy457/Veda-AI-AI-Assessment-Extraction-Answer-Mapping-.git](https://github.com/Klkreddy457/Veda-AI-AI-Assessment-Extraction-Answer-Mapping-.git)

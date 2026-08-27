from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.assessment import router as assessment_router

app = FastAPI(
    title="VedaAI Assessment Extraction & Mapping API",
    description="Document Intelligence API for question extraction, handwriting OCR parsing, and answer mapping.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows Next.js local & deployed ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assessment_router)


@app.get("/")
def root():
    return {
        "service": "VedaAI Assessment Backend API",
        "status": "online",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

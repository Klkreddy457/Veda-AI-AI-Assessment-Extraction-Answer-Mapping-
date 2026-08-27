from fastapi import APIRouter, UploadFile, File, HTTPException, Response
from app.models.assessment import Assessment, ManualRemapRequest
from app.services.document_service import DocumentService

router = APIRouter(prefix="/api/assessment", tags=["assessment"])


@router.post("/process")
async def process_assessment(
    question_paper: UploadFile = File(...),
    answer_sheet: UploadFile = File(...)
):
    """
    Upload question paper and answer sheet documents and initiate async extraction pipeline.
    """
    qp_bytes = await question_paper.read()
    ans_bytes = await answer_sheet.read()

    if not qp_bytes or not ans_bytes:
        raise HTTPException(status_code=400, detail="Both question paper and answer sheet files are required.")

    assessment = DocumentService.create_assessment(
        qp_bytes=qp_bytes,
        qp_filename=question_paper.filename or "question_paper.pdf",
        ans_bytes=ans_bytes,
        ans_filename=answer_sheet.filename or "answer_sheet.pdf"
    )

    return {"assessment_id": assessment.id, "status": assessment.status}


@router.get("/{id}/status")
async def get_assessment_status(id: str):
    """Get current status and progress of an assessment."""
    assessment = DocumentService.get_assessment(id)
    if not assessment:
        raise HTTPException(status_code=404, detail=f"Assessment '{id}' not found.")
    
    return {
        "id": assessment.id,
        "status": assessment.status,
        "progress": assessment.progress,
        "error": assessment.error
    }


@router.get("/{id}")
async def get_assessment_details(id: str):
    """Get full assessment details including questions, answers, and mappings."""
    assessment = DocumentService.get_assessment(id)
    if not assessment:
        raise HTTPException(status_code=404, detail=f"Assessment '{id}' not found.")
    return assessment


@router.post("/{id}/mapping")
async def remap_question(id: str, request: ManualRemapRequest):
    """Manually update or correct an answer mapping for a question."""
    assessment = DocumentService.remap_question(id, request)
    if not assessment:
        raise HTTPException(status_code=404, detail=f"Assessment '{id}' not found.")
    return assessment


@router.get("/{id}/page/{doc_type}/{page_num}")
async def get_page_image(id: str, doc_type: str, page_num: int):
    """Serves the rendered page image for visual document overlay rendering."""
    if doc_type not in ["qp", "ans"]:
        raise HTTPException(status_code=400, detail="Invalid doc_type. Must be 'qp' or 'ans'.")
        
    img_bytes, media_type = DocumentService.get_page_image(id, doc_type, page_num)
    if not img_bytes:
        raise HTTPException(status_code=404, detail="Page image not found.")

    return Response(content=img_bytes, media_type=media_type)

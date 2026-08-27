import io
import fitz  # PyMuPDF
from typing import List, Tuple
from PIL import Image


def get_pdf_page_count(pdf_bytes: bytes) -> int:
    """Extract total page count from PDF bytes."""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        count = doc.page_count
        doc.close()
        return count
    except Exception:
        return 1


def render_pdf_page_to_image(pdf_bytes: bytes, page_number: int = 1, dpi: int = 150) -> Tuple[bytes, int, int]:
    """
    Renders a 1-indexed page of a PDF document into PNG bytes, width, and height.
    """
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        idx = max(0, min(page_number - 1, doc.page_count - 1))
        page = doc.load_page(idx)
        
        pix = page.get_pixmap(dpi=dpi)
        img_bytes = pix.tobytes("png")
        w, h = pix.width, pix.height
        doc.close()
        return img_bytes, w, h
    except Exception:
        # Fallback placeholder image if PDF rendering fails
        img = Image.new("RGB", (2480, 3508), color=(245, 247, 250))
        output = io.BytesIO()
        img.save(output, format="PNG")
        return output.getvalue(), 2480, 3508

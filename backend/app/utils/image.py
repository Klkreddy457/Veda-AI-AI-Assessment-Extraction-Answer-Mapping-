import io
from typing import Tuple
from PIL import Image


def get_image_dimensions(image_bytes: bytes) -> Tuple[int, int]:
    """Return (width, height) of an image byte stream."""
    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            return img.width, img.height
    except Exception:
        return 2480, 3508  # Standard A4 300 DPI fallback


def convert_image_to_png_bytes(image_bytes: bytes) -> bytes:
    """Ensure image is converted to PNG format."""
    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            output = io.BytesIO()
            img.save(output, format="PNG")
            return output.getvalue()
    except Exception:
        return image_bytes

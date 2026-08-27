from app.models.question import BoundingBox


class BBoxService:
    @staticmethod
    def create_bbox(x: float, y: float, width: float, height: float, page_width: float = 2480.0, page_height: float = 3508.0) -> BoundingBox:
        """Create a validated BoundingBox object."""
        return BoundingBox(
            x=max(0.0, float(x)),
            y=max(0.0, float(y)),
            width=max(10.0, float(width)),
            height=max(10.0, float(height)),
            pageWidth=float(page_width),
            pageHeight=float(page_height)
        )

    @staticmethod
    def normalize_bbox(bbox: BoundingBox, target_width: float, target_height: float) -> BoundingBox:
        """Scale bounding box coordinates to a target width and height."""
        scale_x = target_width / bbox.pageWidth if bbox.pageWidth > 0 else 1.0
        scale_y = target_height / bbox.pageHeight if bbox.pageHeight > 0 else 1.0

        return BoundingBox(
            x=bbox.x * scale_x,
            y=bbox.y * scale_y,
            width=bbox.width * scale_x,
            height=bbox.height * scale_y,
            pageWidth=target_width,
            pageHeight=target_height
        )

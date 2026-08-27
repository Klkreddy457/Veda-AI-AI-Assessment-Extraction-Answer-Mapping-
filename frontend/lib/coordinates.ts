import { BoundingBox } from "@/types/assessment";

export interface ScaledBoundingBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Transforms original document OCR bounding box coordinates to browser container canvas/SVG scale.
 */
export function calculateScaledCoordinates(
  bbox: BoundingBox,
  renderedWidth: number,
  renderedHeight: number
): ScaledBoundingBox {
  const scaleX = bbox.pageWidth > 0 ? renderedWidth / bbox.pageWidth : 1;
  const scaleY = bbox.pageHeight > 0 ? renderedHeight / bbox.pageHeight : 1;

  return {
    left: bbox.x * scaleX,
    top: bbox.y * scaleY,
    width: bbox.width * scaleX,
    height: bbox.height * scaleY,
  };
}

/**
 * Returns scroll offset target for auto-scrolling to highlighted answer region.
 */
export function calculateScrollTarget(
  scaledBbox: ScaledBoundingBox,
  containerHeight: number
): number {
  // Center the bounding box vertically within viewer container
  const targetTop = scaledBbox.top - containerHeight / 3;
  return Math.max(0, targetTop);
}

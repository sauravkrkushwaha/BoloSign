import { useCallback } from "react";

/**
 * Convert HTML pixel coordinates → PDF points (72 DPI).
 * Default A4 page size = 595 × 842 points.
 */
export default function usePdfCoordinates(pdfPageSize = { width: 595, height: 842 }) {

  /**
   * field = { x, y, width, height }
   * renderedSize = { width: renderedWidthPx, height: renderedHeightPx }
   */
  const convertToPdf = useCallback((field, renderedSize) => {
    if (!field || !renderedSize) return null;

    const { x, y, width, height } = field;

    // --- SCALE FACTORS ---
    const scaleX = pdfPageSize.width / renderedSize.width;   // px → pt (width)
    const scaleY = pdfPageSize.height / renderedSize.height; // px → pt (height)

    // --- CONVERSION FROM HTML → PDF COORDINATES ---
    const pdfX = x * scaleX;

    // Convert from TOP-LEFT origin → BOTTOM-LEFT origin
    const pdfY = (renderedSize.height - y - height) * scaleY;

    return {
      x: pdfX,
      y: pdfY,
      width: width * scaleX,
      height: height * scaleY,
      page: 1,
    };
  }, [pdfPageSize]);

  return { convertToPdf };
}

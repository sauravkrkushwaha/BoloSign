// src/utils/coordinateConverter.js

// A4 page size in PDF points (72 DPI)
export const A4_PAGE_SIZE = {
  width: 595, // points
  height: 842, // points
};

/**
 * Calculate scale factors between rendered HTML size and real PDF size.
 * renderedSize = { width: number, height: number }
 */
export function getScaleFactors(renderedSize, pdfPageSize = A4_PAGE_SIZE) {
  if (!renderedSize || !renderedSize.width || !renderedSize.height) {
    return { scaleX: 1, scaleY: 1 };
  }

  const scaleX = pdfPageSize.width / renderedSize.width;
  const scaleY = pdfPageSize.height / renderedSize.height;

  return { scaleX, scaleY };
}

/**
 * Convert a field from HTML pixels → PDF points.
 *
 * field = {
 *   x, y, width, height
 * }
 *
 * renderedSize = {
 *   width, height
 * }
 */
export function fieldPxToPdf(
  field,
  renderedSize,
  pdfPageSize = A4_PAGE_SIZE,
  page = 1
) {
  if (!field || !renderedSize) return null;

  const { x, y, width, height } = field;
  const { scaleX, scaleY } = getScaleFactors(renderedSize, pdfPageSize);

  // PDF coordinate system: origin at bottom-left
  const pdfX = x * scaleX;
  const pdfY = (renderedSize.height - y - height) * scaleY;

  return {
    x: pdfX,
    y: pdfY,
    width: width * scaleX,
    height: height * scaleY,
    page,
  };
}

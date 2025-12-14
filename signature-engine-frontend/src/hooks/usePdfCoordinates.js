/**
 * usePdfCoordinates
 *
 * Core idea:
 * - UI works in pixels for smooth interaction
 * - State is stored in percentages relative to PDF page
 * - Backend converts percentages → PDF points
 *
 * This guarantees:
 * - Device independence
 * - No coordinate drift
 * - Exact backend rendering
 */

export function usePdfCoordinates() {
  /**
   * Convert pixel values → percentage values
   * Called AFTER drag / resize
   */
  const pxToPct = ({
    x,
    y,
    width,
    height,
    pageWidth,
    pageHeight,
  }) => {
    return {
      xPct: clamp(x / pageWidth),
      yPct: clamp(y / pageHeight),
      widthPct: clamp(width / pageWidth),
      heightPct: clamp(height / pageHeight),
    };
  };

  /**
   * Convert percentage values → pixel values
   * Called during render
   */
  const pctToPx = ({
    xPct,
    yPct,
    widthPct,
    heightPct,
    pageWidth,
    pageHeight,
  }) => {
    return {
      x: xPct * pageWidth,
      y: yPct * pageHeight,
      width: widthPct * pageWidth,
      height: heightPct * pageHeight,
    };
  };

  /**
   * Clamp pixel values so field never leaves page
   */
  const clampToPage = ({
    x,
    y,
    width,
    height,
    pageWidth,
    pageHeight,
  }) => {
    return {
      x: clamp(x, 0, pageWidth - width),
      y: clamp(y, 0, pageHeight - height),
      width,
      height,
    };
  };

  return {
    pxToPct,
    pctToPx,
    clampToPage,
  };
}

/**
 * Clamp helper
 * Default range: 0 → 1 (for percentages)
 */
function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

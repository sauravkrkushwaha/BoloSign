/**
 * coordinateUtils.js
 *
 * Pure utility functions for coordinate math.
 * No React, no DOM — just deterministic logic.
 */

/**
 * Clamp a value between min and max
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Normalize pixel values to percentages
 */
export function normalizeToPct({
  x,
  y,
  width,
  height,
  pageWidth,
  pageHeight,
}) {
  return {
    xPct: clamp(x / pageWidth, 0, 1),
    yPct: clamp(y / pageHeight, 0, 1),
    widthPct: clamp(width / pageWidth, 0, 1),
    heightPct: clamp(height / pageHeight, 0, 1),
  };
}

/**
 * Convert percentages back to pixels
 */
export function denormalizeToPx({
  xPct,
  yPct,
  widthPct,
  heightPct,
  pageWidth,
  pageHeight,
}) {
  return {
    x: xPct * pageWidth,
    y: yPct * pageHeight,
    width: widthPct * pageWidth,
    height: heightPct * pageHeight,
  };
}

/**
 * Ensure field stays inside page bounds
 */
export function clampToPage({
  x,
  y,
  width,
  height,
  pageWidth,
  pageHeight,
}) {
  return {
    x: clamp(x, 0, pageWidth - width),
    y: clamp(y, 0, pageHeight - height),
    width,
    height,
  };
}

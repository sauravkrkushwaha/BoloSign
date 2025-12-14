/**
 * constants.js
 *
 * Central place for:
 * - Field types
 * - Default sizes
 * - UI configuration
 *
 * This keeps the app consistent and maintainable.
 */

/**
 * Supported field types
 */
export const FIELD_TYPES = {
  SIGNATURE: "signature",
  TEXT: "text",
  DATE: "date",
  RADIO: "radio",
};

/**
 * Default field sizes (percentage-based)
 * These values work well on A4 PDFs
 */
export const DEFAULT_FIELD_SIZES = {
  [FIELD_TYPES.SIGNATURE]: {
    widthPct: 0.25,
    heightPct: 0.1,
  },

  [FIELD_TYPES.TEXT]: {
    widthPct: 0.2,
    heightPct: 0.06,
  },

  [FIELD_TYPES.DATE]: {
    widthPct: 0.18,
    heightPct: 0.06,
  },

  [FIELD_TYPES.RADIO]: {
    widthPct: 0.05,
    heightPct: 0.05,
  },
};

/**
 * Default starting position for new fields
 */
export const DEFAULT_FIELD_POSITION = {
  xPct: 0.1,
  yPct: 0.1,
};

/**
 * Minimum field size in pixels (UI constraint)
 */
export const MIN_FIELD_SIZE_PX = {
  width: 40,
  height: 24,
};

/**
 * Mobile breakpoint
 */
export const MOBILE_BREAKPOINT = 768;

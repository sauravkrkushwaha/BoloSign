import { useRef } from "react";
import { usePdfCoordinates } from "./usePdfCoordinates";

/**
 * useDrag
 *
 * Responsibilities:
 * - Handle drag (move) and resize interactions
 * - Work in pixel space for smooth UI
 * - Persist state ONLY in percentage space
 *
 * Props:
 * - field: { x, y, width, height }  // pixel values
 * - pageWidth, pageHeight
 * - onChange(updatedPctCoords)
 */
export function useDrag({
  field,
  pageWidth,
  pageHeight,
  onChange,
}) {
  const startRef = useRef(null);
  const modeRef = useRef("move"); // "move" | "resize"

  const {
    pxToPct,
    clampToPage,
  } = usePdfCoordinates();

  /**
   * Pointer down (start move / resize)
   */
  const onPointerDown = (e, mode = "move") => {
    e.preventDefault();
    e.stopPropagation();

    modeRef.current = mode;

    const point = getPoint(e);

    startRef.current = {
      startX: point.x,
      startY: point.y,
      initial: { ...field },
    };

    window.addEventListener(
      "pointermove",
      onPointerMove
    );
    window.addEventListener(
      "pointerup",
      onPointerUp
    );
  };

  /**
   * Pointer move (drag / resize)
   */
  const onPointerMove = (e) => {
    if (!startRef.current) return;

    const { startX, startY, initial } =
      startRef.current;

    const point = getPoint(e);

    const dx = point.x - startX;
    const dy = point.y - startY;

    let next = {};

    if (modeRef.current === "move") {
      next = {
        x: initial.x + dx,
        y: initial.y + dy,
        width: initial.width,
        height: initial.height,
      };
    } else {
      next = {
        x: initial.x,
        y: initial.y,
        width: Math.max(40, initial.width + dx),
        height: Math.max(24, initial.height + dy),
      };
    }

    // Prevent overflow outside PDF page
    const clamped = clampToPage({
      ...next,
      pageWidth,
      pageHeight,
    });

    // Convert pixels → percentages (FINAL STATE)
    const pct = pxToPct({
      ...clamped,
      pageWidth,
      pageHeight,
    });

    onChange(pct);
  };

  /**
   * Pointer up (end interaction)
   */
  const onPointerUp = () => {
    startRef.current = null;

    window.removeEventListener(
      "pointermove",
      onPointerMove
    );
    window.removeEventListener(
      "pointerup",
      onPointerUp
    );
  };

  return {
    onPointerDown,
  };
}

/**
 * Normalize pointer coordinates
 */
function getPoint(e) {
  return {
    x: e.clientX,
    y: e.clientY,
  };
}

import React from "react";
import { useDrag } from "../hooks/useDrag";
import { usePdfCoordinates } from "../hooks/usePdfCoordinates";

/**
 * DraggableField
 *
 * Responsibilities:
 * - Render one interactive field on a PDF page
 * - Convert % → px for rendering
 * - Delegate drag/resize to useDrag hook
 *
 * Props:
 * - field: { id, type, xPct, yPct, widthPct, heightPct }
 * - pageWidth, pageHeight
 * - selected: boolean
 * - onSelect(fieldId)
 * - onChange(updatedPctCoords)
 * - children: inner UI (SignatureBox, Text, etc.)
 */
export default function DraggableField({
  field,
  pageWidth,
  pageHeight,
  selected,
  onSelect,
  onChange,
  children,
}) {
  const { pctToPx } = usePdfCoordinates();

  /**
   * Convert percentage coords to pixels for rendering
   */
  const { x, y, width, height } = pctToPx({
    xPct: field.xPct,
    yPct: field.yPct,
    widthPct: field.widthPct,
    heightPct: field.heightPct,
    pageWidth,
    pageHeight,
  });

  /**
   * Hook handling drag & resize
   */
  const { onPointerDown } = useDrag({
    field: { x, y, width, height },
    pageWidth,
    pageHeight,
    onChange,
  });

  return (
    <div
      className={`draggable-field ${
        selected ? "selected" : ""
      }`}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        pointerEvents: "auto",
      }}
      onPointerDown={(e) => {
        onSelect?.(field.id);
        onPointerDown(e, "move");
      }}
    >
      {/* Inner content */}
      <div className="draggable-field-content">
        {children}
      </div>

      {/* Resize handle */}
      {selected && (
        <div
          className="resize-handle"
          onPointerDown={(e) => {
            e.stopPropagation();
            onPointerDown(e, "resize");
          }}
        />
      )}
    </div>
  );
}

import React from "react";
import { useDrag } from "../hooks/useDrag";
import { usePdfCoordinates } from "../hooks/usePdfCoordinates";

export default function DraggableField({
  field,
  pageWidth,
  pageHeight,
  selected,
  onSelect,
  onChange,
  onRemove, // 👈 NEW
  children,
}) {
  const { pctToPx } = usePdfCoordinates();

  const { x, y, width, height } = pctToPx({
    xPct: field.xPct,
    yPct: field.yPct,
    widthPct: field.widthPct,
    heightPct: field.heightPct,
    pageWidth,
    pageHeight,
  });

  const { onPointerDown } = useDrag({
    field: { x, y, width, height },
    pageWidth,
    pageHeight,
    onChange,
  });

  return (
    <div
      className={`draggable-field ${selected ? "selected" : ""}`}
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
      {/* ❌ Remove button */}
      {selected && (
        <button
          className="field-remove-btn"
          onClick={(e) => {
            e.stopPropagation(); // prevent drag
            onRemove(field.id);
          }}
        >
          ✕
        </button>
      )}

      <div className="draggable-field-content">
        {children}
      </div>

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

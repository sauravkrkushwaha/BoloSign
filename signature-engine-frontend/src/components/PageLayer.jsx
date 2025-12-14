import React from "react";

/**
 * PageLayer
 *
 * Responsibilities:
 * - Acts as a coordinate reference for ONE PDF page
 * - Holds overlay fields for that page
 * - Keeps PDF rendering & field rendering cleanly separated
 *
 * Props:
 * - pageIndex: number (0-based, backend-aligned)
 * - pageWidth: number (rendered width in px)
 * - pageHeight: number (rendered height in px)
 * - children: FieldLayer / DraggableField components
 */
export default function PageLayer({
  pageIndex,
  pageWidth,
  pageHeight,
  children,
}) {
  return (
    <div
      className="page-layer"
      data-page-index={pageIndex}
      style={{
        position: "relative",
        width: pageWidth,
        height: pageHeight,
      }}
    >
      {/* Overlay fields for this page */}
      {children}
    </div>
  );
}

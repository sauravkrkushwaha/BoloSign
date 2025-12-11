// src/hooks/useDrag.js

import { useState, useEffect, useRef } from "react";

/**
 * For dragging toolbox items into PDF viewer.
 * NOT for dragging on the PDF (that is handled inside DraggableField.jsx).
 */
export default function useDrag() {
  const [dragType, setDragType] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragPreviewRef = useRef(null);

  const startDrag = (type) => {
    setDragType(type);
    setIsDragging(true);
  };

  const endDrag = () => {
    setDragType(null);
    setIsDragging(false);
  };

  // Create floating preview while dragging
  useEffect(() => {
    if (!isDragging || !dragType) return;

    const preview = document.createElement("div");
    preview.innerHTML = dragType.toUpperCase();
    preview.style.position = "fixed";
    preview.style.pointerEvents = "none";
    preview.style.padding = "6px 10px";
    preview.style.background = "white";
    preview.style.borderRadius = "6px";
    preview.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
    preview.style.fontSize = "12px";
    preview.style.zIndex = "9999";

    dragPreviewRef.current = preview;
    document.body.appendChild(preview);

    const moveHandler = (e) => {
      if (!dragPreviewRef.current) return;
      dragPreviewRef.current.style.left = e.clientX + 10 + "px";
      dragPreviewRef.current.style.top = e.clientY + 10 + "px";
    };

    window.addEventListener("mousemove", moveHandler);

    return () => {
      window.removeEventListener("mousemove", moveHandler);
      if (dragPreviewRef.current) {
        dragPreviewRef.current.remove();
        dragPreviewRef.current = null;
      }
    };
  }, [isDragging, dragType]);

  return {
    dragType,
    isDragging,
    startDrag,
    endDrag,
  };
}

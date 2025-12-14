import React, { useEffect, useRef, useState } from "react";

/**
 * SignatureBox
 *
 * Responsibilities:
 * - Capture user-drawn signature
 * - Support mouse + touch (pointer events)
 * - Export base64 PNG for backend
 *
 * Props:
 * - onChange(base64Image | null)
 */
export default function SignatureBox({ onChange }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawingRef = useRef(false);

  const [hasSignature, setHasSignature] = useState(false);

  /**
   * Initialize canvas for crisp rendering
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2;

    ctxRef.current = ctx;
  }, []);

  const startDraw = (e) => {
    e.preventDefault();
    const point = getPoint(e);
    drawingRef.current = true;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(point.x, point.y);
  };

  const draw = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const point = getPoint(e);
    ctxRef.current.lineTo(point.x, point.y);
    ctxRef.current.stroke();
  };

  const endDraw = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    setHasSignature(true);

    const dataUrl =
      canvasRef.current.toDataURL("image/png");
    onChange?.(dataUrl);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    ctxRef.current.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
    setHasSignature(false);
    onChange?.(null);
  };

  return (
    <div className="signature-box">
      <canvas
        ref={canvasRef}
        className="signature-canvas"
        onPointerDown={startDraw}
        onPointerMove={draw}
        onPointerUp={endDraw}
        onPointerLeave={endDraw}
      />

      {hasSignature && (
        <button
          type="button"
          className="signature-clear-btn"
          onClick={clear}
        >
          Clear
        </button>
      )}
    </div>
  );
}

/**
 * Normalize pointer coordinates
 */
function getPoint(e) {
  const rect = e.target.getBoundingClientRect();

  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

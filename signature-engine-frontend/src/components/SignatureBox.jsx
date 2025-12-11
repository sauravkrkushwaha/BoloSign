import React, { useState, useEffect } from "react";

const baseStyles = {
  container: (field, selected) => ({
    position: "absolute",
    left: field.x,
    top: field.y,
    width: field.width,
    height: field.height,
    minWidth: 220,
    minHeight: 100,
    boxSizing: "border-box",
    padding: "10px 12px",
    borderRadius: 12,
    border: selected
      ? "2px dashed rgba(37,99,235,0.9)"
      : "1.5px dashed rgba(148,163,184,0.9)",
    backgroundColor: "rgba(255,255,255,0.98)",
    boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    userSelect: "none",
    cursor: "grab",
  }),
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#0f172a",
  },
  typeBadge: {
    fontSize: 10,
    padding: "3px 10px",
    borderRadius: 999,
    backgroundColor: "#e5edff",
    color: "#1d4ed8",
    fontWeight: 600,
  },
  closeBtn: {
    width: 18,
    height: 18,
    borderRadius: "999px",
    border: "none",
    backgroundColor: "rgba(15,23,42,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    cursor: "pointer",
    color: "#6b7280",
  },
  body: {
    flex: 1,
    display: "flex",
    alignItems: "stretch",
    gap: 8,
    minHeight: 0,
  },
  previewBox: {
    flex: 1,
    minWidth: 0,
    borderRadius: 10,
    border: "1px dashed rgba(148,163,184,0.9)",
    background:
      "repeating-linear-gradient(45deg, #f9fafb, #f9fafb 8px, #eef2ff 8px, #eef2ff 16px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    color: "#64748b",
    overflow: "hidden",
  },
  previewImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    borderRadius: 10,
    pointerEvents: "none",
  },
  sideCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 6,
  },
  uploadButton: {
    border: "none",
    borderRadius: 999,
    padding: "6px 14px",
    fontSize: 11,
    fontWeight: 600,
    background:
      "linear-gradient(135deg, rgba(59,130,246,1), rgba(56,189,248,1))",
    color: "#fff",
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(37,99,235,0.35)",
  },
  requiredRow: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 11,
    color: "#6b7280",
  },
  resizeHandle: {
    position: "absolute",
    width: 11,
    height: 11,
    borderRadius: 3,
    right: 4,
    bottom: 4,
    backgroundColor: "#1d4ed8",
    cursor: "nwse-resize",
    boxShadow: "0 0 0 2px #e5e7eb",
  },
};

function SignatureBox({
  id,
  x,
  y,
  width,
  height,
  label = "Signature",
  selected,
  signatureImage,
  onChange,
  onSelect,
  onDelete, // optional
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [sizeStart, setSizeStart] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(signatureImage || null);
  const [required, setRequired] = useState(false);

  useEffect(() => {
    setPreviewSrc(signatureImage || null);
  }, [signatureImage]);

  // ---- Drag / resize handlers ----
  const startDrag = (e) => {
    e.stopPropagation();
    onSelect?.(id);
    setIsDragging(true);
    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: x,
      startY: y,
    });
  };

  const startResize = (e) => {
    e.stopPropagation();
    onSelect?.(id);
    setIsResizing(true);
    setSizeStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      startW: width,
      startH: height,
    });
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (isDragging && dragStart && onChange) {
        const dx = e.clientX - dragStart.mouseX;
        const dy = e.clientY - dragStart.mouseY;
        const newX = Math.max(0, dragStart.startX + dx);
        const newY = Math.max(0, dragStart.startY + dy);
        onChange({
          id,
          x: newX,
          y: newY,
          width,
          height,
          signatureImage: previewSrc,
          required,
        });
      }
      if (isResizing && sizeStart && onChange) {
        const dx = e.clientX - sizeStart.mouseX;
        const dy = e.clientY - sizeStart.mouseY;
        const newW = Math.max(220, sizeStart.startW + dx);
        const newH = Math.max(100, sizeStart.startH + dy);
        onChange({
          id,
          x,
          y,
          width: newW,
          height: newH,
          signatureImage: previewSrc,
          required,
        });
      }
    };
    const stopAll = () => {
      setIsDragging(false);
      setIsResizing(false);
    };
    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", stopAll);
    }
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stopAll);
    };
  }, [isDragging, isResizing, dragStart, sizeStart, id, x, y, width, height, onChange, previewSrc, required]);

  // ---- Upload ----
  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setPreviewSrc(dataUrl);
      onChange?.({
        id,
        x,
        y,
        width,
        height,
        signatureImage: dataUrl,
        required,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRequiredToggle = () => {
    const next = !required;
    setRequired(next);
    onChange?.({
      id,
      x,
      y,
      width,
      height,
      signatureImage: previewSrc,
      required: next,
    });
  };

  return (
    <div
      style={baseStyles.container({ x, y, width, height }, selected)}
      onMouseDown={startDrag}
    >
      <div style={baseStyles.headerRow}>
        <div style={baseStyles.headerLeft}>
          <span style={baseStyles.label}>{label}</span>
          <span style={baseStyles.typeBadge}>SIGNATURE</span>
        </div>
        {onDelete && (
          <button
            type="button"
            style={baseStyles.closeBtn}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => onDelete(id)}
          >
            ×
          </button>
        )}
      </div>

      <div style={baseStyles.body}>
        <div style={baseStyles.previewBox}>
          {previewSrc ? (
            <img
              src={previewSrc}
              alt="Signature"
              style={baseStyles.previewImg}
            />
          ) : (
            <span>Upload signer signature</span>
          )}
        </div>
        <div style={baseStyles.sideCol}>
          <label style={baseStyles.uploadButton}>
            Upload
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleUpload}
              onClick={(e) => e.stopPropagation()}
            />
          </label>
          <div style={baseStyles.requiredRow}>
            <input
              type="checkbox"
              checked={required}
              onChange={handleRequiredToggle}
              onClick={(e) => e.stopPropagation()}
            />
            <span>Required</span>
          </div>
        </div>
      </div>

      <div style={baseStyles.resizeHandle} onMouseDown={startResize} />
    </div>
  );
}

export default SignatureBox;

import React, { useState, useRef, useEffect } from "react";

/**
 * DraggableField.jsx
 * - props expected (pixel coords): id, x, y, width, height, selected, onChange, onSelect, onDelete, label, meta
 * - onChange should be called with updated pixel object { id, x, y, width, height, ...metaFields }
 *
 * This component keeps local state for inputs (text/date/radio/image) and returns them via onChange
 * whenever position/size changes (so parent persists those fields in normalized form).
 */

const baseStyles = {
  container: (x, y, width, height, selected) => ({
    position: "absolute",
    left: x,
    top: y,
    width,
    height,
    minWidth: 160,
    boxSizing: "border-box",
    padding: 12,
    borderRadius: 12,
    border: selected ? "2px dashed rgba(37,99,235,0.9)" : "1.5px dashed rgba(148,163,184,0.9)",
    backgroundColor: "rgba(255,255,255,0.98)",
    boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 8,
    userSelect: "none",
    cursor: "grab",
    overflow: "hidden",
  }),
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: "#0f172a" },
  typeBadge: { fontSize: 10, padding: "3px 10px", borderRadius: 999, backgroundColor: "#e5edff", color: "#1d4ed8", fontWeight: 600 },
  closeBtn: { width: 20, height: 20, borderRadius: "999px", border: "none", backgroundColor: "rgba(15,23,42,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, cursor: "pointer", color: "#6b7280" },

  mainRow: { flex: 1, display: "flex", alignItems: "center" },

  // text input look
  textInput: { width: "100%", padding: "8px 10px", fontSize: 13, borderRadius: 999, border: "1px solid #e6edf3", outline: "none", backgroundColor: "#f8fafc" },

  // date
  dateRow: { width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 999, border: "1px solid #e6edf3", backgroundColor: "#f8fafc" },
  dateInput: { flex: 1, border: "none", outline: "none", fontSize: 13, background: "transparent" },

  // radio
  radioGroup: { display: "flex", gap: 8 },
  radioPill: (active) => ({ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, border: active ? "1px solid #1d4ed8" : "1px solid #e6edf3", backgroundColor: active ? "#eff6ff" : "#fff", cursor: "pointer", fontSize: 13 }),
  radioDot: (active) => ({ width: 12, height: 12, borderRadius: 999, border: active ? "3px solid #1d4ed8" : "1px solid #cbd5e1", background: active ? "#1d4ed8" : "#fff" }),

  // image preview
  imagePreview: { width: "100%", height: "100%", maxHeight: 220, borderRadius: 12, border: "1px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#64748b", overflow: "hidden", background: "repeating-linear-gradient(135deg,#f3f4ff 0,#f3f4ff 8px,#ffffff 8px,#ffffff 16px)" },
  image: { width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" },

  footer: { display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, fontSize: 13, color: "#6b7280" },

  resizeHandle: { position: "absolute", width: 12, height: 12, borderRadius: 3, right: 8, bottom: 8, backgroundColor: "#1d4ed8", cursor: "nwse-resize", boxShadow: "0 0 0 2px #e5e7eb" },
};

function DraggableField({
  id,
  type = "text",
  x = 0,
  y = 0,
  width = 200,
  height = 110,
  selected = false,
  onChange,
  onSelect,
  onDelete,
  label = "Field",
  meta = {},
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);

  // content state
  const [textValue, setTextValue] = useState(meta.textValue || "");
  const [dateValue, setDateValue] = useState(meta.dateValue || "");
  const [radioValue, setRadioValue] = useState(meta.radioValue || "");
  const [imageSrc, setImageSrc] = useState(meta.imageSrc || null);
  const [required, setRequired] = useState(!!meta.required);

  // start dragging
  const onMouseDownDrag = (e) => {
    e.stopPropagation();
    onSelect?.(id);
    setIsDragging(true);
    dragRef.current = { startX: x, startY: y, mouseX: e.clientX, mouseY: e.clientY };
  };
  // start resize
  const onMouseDownResize = (e) => {
    e.stopPropagation();
    onSelect?.(id);
    setIsResizing(true);
    resizeRef.current = { startW: width, startH: height, mouseX: e.clientX, mouseY: e.clientY };
  };

  useEffect(() => {
    const onMove = (e) => {
      if (isDragging && dragRef.current) {
        const dx = e.clientX - dragRef.current.mouseX;
        const dy = e.clientY - dragRef.current.mouseY;
        const nx = Math.max(4, Math.round(dragRef.current.startX + dx));
        const ny = Math.max(4, Math.round(dragRef.current.startY + dy));
        onChange?.({
          id,
          x: nx,
          y: ny,
          width,
          height,
          textValue,
          dateValue,
          radioValue,
          imageSrc,
          required,
        });
      }
      if (isResizing && resizeRef.current) {
        const dx = e.clientX - resizeRef.current.mouseX;
        const dy = e.clientY - resizeRef.current.mouseY;
        const nw = Math.max(120, Math.round(resizeRef.current.startW + dx));
        const nh = Math.max(60, Math.round(resizeRef.current.startH + dy));
        onChange?.({
          id,
          x,
          y,
          width: nw,
          height: nh,
          textValue,
          dateValue,
          radioValue,
          imageSrc,
          required,
        });
      }
    };
    const onUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      dragRef.current = null;
      resizeRef.current = null;
    };
    if (isDragging || isResizing) {
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging, isResizing, id, x, y, width, height, onChange, textValue, dateValue, radioValue, imageSrc, required]);

  // helpers to update meta when content changes
  useEffect(() => {
    onChange?.({ id, x, y, width, height, textValue, dateValue, radioValue, imageSrc, required });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textValue, dateValue, radioValue, imageSrc, required]);

  const stopDrag = (e) => e.stopPropagation();

  // content
  let mainContent = null;
  if (type === "text") {
    mainContent = (
      <div style={baseStyles.mainRow} onMouseDown={stopDrag}>
        <input style={baseStyles.textInput} placeholder="Enter text..." value={textValue} onChange={(e) => setTextValue(e.target.value)} />
      </div>
    );
  } else if (type === "date") {
    mainContent = (
      <div style={baseStyles.mainRow} onMouseDown={stopDrag}>
        <div style={baseStyles.dateRow}>
          <input type="date" style={baseStyles.dateInput} value={dateValue} onChange={(e) => setDateValue(e.target.value)} />
          <span>📅</span>
        </div>
      </div>
    );
  } else if (type === "radio") {
    mainContent = (
      <div style={baseStyles.mainRow} onMouseDown={stopDrag}>
        <div style={baseStyles.radioGroup}>
          <div style={baseStyles.radioPill(radioValue === "Yes")} onClick={() => setRadioValue("Yes")}>
            <div style={baseStyles.radioDot(radioValue === "Yes")} /> Yes
          </div>
          <div style={baseStyles.radioPill(radioValue === "No")} onClick={() => setRadioValue("No")}>
            <div style={baseStyles.radioDot(radioValue === "No")} /> No
          </div>
        </div>
      </div>
    );
  } else if (type === "image" || type === "signature") {
    mainContent = (
      <div style={baseStyles.mainRow} onMouseDown={stopDrag}>
        <div style={{ ...baseStyles.imagePreview, height: Math.max(80, height - 80) }}>
          {imageSrc ? <img src={imageSrc} alt="preview" style={baseStyles.image} /> : (
            <label style={{ cursor: "pointer" }}>
              Upload image
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setImageSrc(reader.result);
                reader.readAsDataURL(file);
              }} />
            </label>
          )}
        </div>
      </div>
    );
  } else {
    mainContent = <div style={baseStyles.mainRow}><span>Field</span></div>;
  }

  return (
    <div style={baseStyles.container(x, y, width, height, selected)} onMouseDown={onMouseDownDrag}>
      <div style={baseStyles.headerRow}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={baseStyles.label}>{label}</div>
          <div style={baseStyles.typeBadge}>{type.toUpperCase()}</div>
        </div>
        {onDelete && <button type="button" style={baseStyles.closeBtn} onMouseDown={(e) => e.stopPropagation()} onClick={() => onDelete(id)}>×</button>}
      </div>

      {mainContent}

      <div style={baseStyles.footer}>
        <label style={{ display: "flex", gap: 6, alignItems: "center", cursor: "pointer" }}>
          <input type="checkbox" checked={required} onChange={() => setRequired((s) => !s)} />
          <span>Required</span>
        </label>
      </div>

      {/* resize handle */}
      <div style={baseStyles.resizeHandle} onMouseDown={(e) => { e.stopPropagation(); onMouseDownResize(e); }} />
    </div>
  );
}

export default DraggableField;

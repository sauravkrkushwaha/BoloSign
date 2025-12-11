import React from "react";

const styles = {
  sidebar: {
    width: "220px",
    minWidth: "200px",
    borderRight: "1px solid rgba(0,0,0,0.08)",
    padding: "16px 12px",
    boxSizing: "border-box",
    backgroundColor: "#fafafa",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  heading: {
    fontSize: "14px",
    fontWeight: 600,
    marginBottom: "4px",
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    color: "#555",
  },
  item: {
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "13px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "3px",
    border: "1px solid rgba(0,0,0,0.08)",
    backgroundColor: "#fff",
    cursor: "grab",
    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
    transition: "transform 0.08s ease, box-shadow 0.08s ease, border 0.08s ease",
  },
  itemLabel: {
    fontWeight: 500,
  },
  itemHint: {
    fontSize: "11px",
    color: "#777",
  },
};

const FIELD_TYPES = [
  { type: "signature", label: "Signature Field", hint: "Place signer signature" },
  { type: "text", label: "Text Field", hint: "Name, address, etc." },
  { type: "date", label: "Date Field", hint: "Signing date" },
  { type: "image", label: "Image Box", hint: "Stamp or logo" },
  { type: "radio", label: "Radio Button", hint: "Yes / No choice" },
];

function Toolbar({ onAddField }) {
  const handleDragStart = (e, fieldType) => {
    // Custom MIME type for our drag data
    e.dataTransfer.setData("application/x-field-type", fieldType);
    e.dataTransfer.effectAllowed = "copyMove";
  };

  const handleClickAdd = (fieldType) => {
    // Fallback: click to add at default position
    onAddField && onAddField(fieldType);
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.heading}>Fields</div>
      {FIELD_TYPES.map((field) => (
        <div
          key={field.type}
          style={styles.item}
          draggable
          onDragStart={(e) => handleDragStart(e, field.type)}
          onClick={() => handleClickAdd(field.type)}
        >
          <span style={styles.itemLabel}>{field.label}</span>
          <span style={styles.itemHint}>{field.hint}</span>
        </div>
      ))}
    </aside>
  );
}

export default Toolbar;

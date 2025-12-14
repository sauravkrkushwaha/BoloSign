import React from "react";

/**
 * Toolbar
 *
 * Responsibilities:
 * - Display available field types
 * - Trigger creation of fields
 * - Adapt UI for desktop & mobile
 *
 * Props:
 * - onAddField(type)
 * - isMobile: boolean
 * - open: boolean (mobile bottom sheet)
 * - onClose(): function (mobile only)
 */
export default function Toolbar({
  onAddField,
  isMobile = false,
  open = true,
  onClose,
}) {
  return (
    <aside
      className={`toolbar ${
        isMobile ? "toolbar-mobile" : "toolbar-desktop"
      } ${open ? "open" : ""}`}
    >
      {isMobile && (
        <div className="toolbar-header">
          <span>Add Fields</span>
          <button
            className="toolbar-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
      )}

      <div className="toolbar-items">
        <ToolbarItem
          label="Signature"
          onClick={() => onAddField("signature")}
        />
        <ToolbarItem
          label="Text"
          onClick={() => onAddField("text")}
        />
        <ToolbarItem
          label="Date"
          onClick={() => onAddField("date")}
        />
        <ToolbarItem
          label="Radio"
          onClick={() => onAddField("radio")}
        />
      </div>
    </aside>
  );
}

/**
 * Individual toolbar button
 */
function ToolbarItem({ label, onClick }) {
  return (
    <button
      className="toolbar-item"
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

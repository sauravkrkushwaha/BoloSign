import React from "react";
import DraggableField from "./DraggableField";
import SignatureBox from "./SignatureBox";

export default function FieldLayer({
  fields,
  pageIndex,
  pageWidth,
  pageHeight,
  selectedId,
  onSelect,
  onUpdate,
  onFieldValueChange,
  onSignatureChange,
}) {
  return (
    <>
      {fields
        .filter((field) => field.page === pageIndex)
        .map((field) => (
          <DraggableField
            key={field.id}
            field={field}
            pageWidth={pageWidth}
            pageHeight={pageHeight}
            selected={field.id === selectedId}
            onSelect={onSelect}
            onChange={(pct) =>
              onUpdate(field.id, pct)
            }
          >
            {renderFieldContent(
              field,
              onFieldValueChange,
              onSignatureChange
            )}
          </DraggableField>
        ))}
    </>
  );
}

function renderFieldContent(
  field,
  onFieldValueChange,
  onSignatureChange
) {
  switch (field.type) {
    case "signature":
      return (
        <SignatureBox
          onChange={onSignatureChange}
        />
      );

    case "text":
      return (
        <input
          className="text-input"
          placeholder="Enter text"
          value={field.value || ""}
          onChange={(e) =>
            onFieldValueChange(field.id, e.target.value)
          }
        />
      );

    case "date":
      return <span>{new Date().toLocaleDateString()}</span>;

    case "radio":
      return <span>☑</span>;

    default:
      return null;
  }
}

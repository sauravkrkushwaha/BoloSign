import React from "react";

/**
 * Loader
 *
 * Responsibilities:
 * - Show loading / processing state
 * - Reusable across app (PDF load, API calls, signing)
 *
 * Props:
 * - text?: string (optional message)
 * - fullscreen?: boolean (overlay mode)
 */
export default function Loader({
  text = "Loading…",
  fullscreen = false,
}) {
  if (fullscreen) {
    return (
      <div className="loader-overlay">
        <LoaderContent text={text} />
      </div>
    );
  }

  return (
    <div className="loader-inline">
      <LoaderContent text={text} />
    </div>
  );
}

function LoaderContent({ text }) {
  return (
    <div className="loader-content">
      <span className="loader-spinner" />
      <span className="loader-text">{text}</span>
    </div>
  );
}

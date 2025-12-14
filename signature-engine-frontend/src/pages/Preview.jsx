import React from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";

export default function Preview() {
  const location = useLocation();
  const pdfUrl = location.state?.pdfUrl;

  if (!pdfUrl) {
    return (
      <div className="preview-root">
        <Header />
        <div className="preview-empty">
          <p>No signed PDF available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-root">
      <Header />

      <div className="preview-container">
        <iframe
          title="Signed PDF Preview"
          src={pdfUrl}
          className="preview-iframe"
        />
      </div>

      <div className="preview-actions">
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="preview-btn"
        >
          Open in New Tab
        </a>

        <a
          href={pdfUrl}
          download
          className="preview-btn primary"
        >
          Download PDF
        </a>
      </div>
    </div>
  );
}

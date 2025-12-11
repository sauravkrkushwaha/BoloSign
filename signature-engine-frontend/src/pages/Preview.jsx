import React from "react";

const styles = {
  root: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    backgroundColor: "#f3f4f6",
  },
  header: {
    padding: "10px 16px",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    backgroundColor: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: "15px",
    fontWeight: 600,
  },
  subtitle: {
    fontSize: "12px",
    color: "#777",
  },
  backButton: {
    fontSize: "12px",
    padding: "6px 10px",
    borderRadius: "16px",
    border: "1px solid rgba(0,0,0,0.14)",
    backgroundColor: "#fff",
    cursor: "pointer",
  },
  body: {
    flex: 1,
    padding: "16px",
    boxSizing: "border-box",
  },
  frame: {
    width: "100%",
    height: "100%",
    borderRadius: "8px",
    border: "1px solid rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
  },
  emptyState: {
    height: "100%",
    borderRadius: "8px",
    border: "1px dashed rgba(0,0,0,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#777",
    fontSize: "13px",
    backgroundColor: "#fafafa",
  },
};

function Preview({ pdfUrl, onBack }) {
  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <div>
          <div style={styles.title}>Signed PDF Preview</div>
          <div style={styles.subtitle}>
            This is the final document after signature injection.
          </div>
        </div>
        {onBack && (
          <button type="button" style={styles.backButton} onClick={onBack}>
            ← Back to Editor
          </button>
        )}
      </header>

      <div style={styles.body}>
        {pdfUrl ? (
          <iframe
            title="Signed PDF Preview"
            src={pdfUrl}
            style={styles.frame}
          />
        ) : (
          <div style={styles.emptyState}>
            No signed PDF provided. Generate a signed PDF from the editor first.
          </div>
        )}
      </div>
    </div>
  );
}

export default Preview;

// src/components/PDFViewer.jsx
import React, { useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

const A4_RATIO = 842 / 595; // height / width

function PDFViewer({ file = "/sample.pdf", children, pageWidth = 700, pageHeight }) {
  const containerRef = useRef(null);
  // allow caller to override computed height; otherwise compute from ratio
  const computedHeight = pageHeight || Math.round(pageWidth * A4_RATIO);

  const styles = {
    wrapper: {
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      padding: 16,
      boxSizing: "border-box",
      width: "100%",
      height: "100%",
    },
    // crucial: set explicit size equal to the page canvas size
    viewerContainer: {
      position: "relative",           // anchor for absolute overlay children
      width: pageWidth,
      height: computedHeight,
      boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
      borderRadius: 8,
      overflow: "hidden",             // prevent children spilling out
      backgroundColor: "#f5f5f5",
      boxSizing: "border-box",
    },
    overlayLayer: {
      position: "absolute",
      left: 0,
      top: 0,
      width: pageWidth,
      height: computedHeight,
      pointerEvents: "auto",          // allow dragging / clicking overlay children
      zIndex: 10,
    },
  };

  return (
    <div style={styles.wrapper}>
      <div ref={containerRef} style={styles.viewerContainer}>
        <Document file={file} loading={<div>Loading PDF...</div>}>
          <Page
            pageNumber={1}
            width={pageWidth}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>

        {/* Overlay layer — now exactly same size as PDF canvas */}
        <div style={styles.overlayLayer}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default PDFViewer;

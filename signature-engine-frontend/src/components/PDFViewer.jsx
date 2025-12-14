import { Document, Page, pdfjs } from "react-pdf";
import { useEffect, useRef, useState } from "react";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

/**
 * PDFViewer
 *
 * Responsibilities:
 * 1. Render PDF responsively
 * 2. Measure rendered page dimensions
 * 3. Expose page metadata to parent
 * 4. Provide a stable overlay container
 *
 * Props:
 * - file: PDF URL / File
 * - onPageReady({ pageIndex, width, height })
 * - children: overlay layers (fields)
 */
export default function PDFViewer({
  file,
  onPageReady,
  children,
}) {
  const wrapperRef = useRef(null);
  const pageContainerRef = useRef(null);

  const [numPages, setNumPages] = useState(0);
  const [renderWidth, setRenderWidth] = useState(0);

  /**
   * Track container width (responsive)
   */
  useEffect(() => {
    if (!wrapperRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setRenderWidth(rect.width);
    });

    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="pdf-viewer-root">
      <div
        ref={wrapperRef}
        className="pdf-viewer-wrapper"
      >
        <Document
          file={file}
          loading={<div className="pdf-loading">Loading PDF…</div>}
          onLoadSuccess={({ numPages }) =>
            setNumPages(numPages)
          }
        >
          {/* 🔒 Single page rendering (page 0) */}
          <div
            ref={pageContainerRef}
            className="pdf-page-container"
          >
            <Page
              pageNumber={1}
              width={renderWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              onLoadSuccess={(page) => {
                const viewport = page.getViewport({
                  scale: renderWidth / page.view[2],
                });

                onPageReady?.({
                  pageIndex: 0, // 0-based index (LOCKED)
                  width: viewport.width,
                  height: viewport.height,
                });
              }}
            />

            {/* 🔥 Overlay Layer (fields live here) */}
            <div className="pdf-overlay-layer">
              {children}
            </div>
          </div>
        </Document>
      </div>
    </div>
  );
}

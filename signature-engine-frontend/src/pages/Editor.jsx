import React, { useState, useMemo, useEffect } from "react";
import Toolbar from "../components/Toolbar";
import PDFViewer from "../components/PDFViewer";
import SignatureBox from "../components/SignatureBox";
import DraggableField from "../components/DraggableField";
import Loader from "../components/Loader";
import useWindowSize from "../hooks/useWindowSize";
import usePdfCoordinates from "../hooks/usePdfCoordinates";
import { signPdf, API_ORIGIN } from "../utils/api";

/**
 * Editor.jsx
 * - Fields stored as normalized fractions (xPct, yPct, wPct, hPct)
 * - For rendering we convert normalized -> pixel using current pageSize
 * - On drag/resize DraggableField returns pixel coords -> we convert back to normalized and save
 * - On pageSize change we recompute pixel positions from normalized (so fields scale with page)
 */

const styles = {
  root: { display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#f3f4f6" },
  header: { padding: "10px 16px", borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" },
  titleBlock: { display: "flex", flexDirection: "column" },
  title: { fontSize: 15, fontWeight: 600 },
  subtitle: { fontSize: 12, color: "#777" },
  actions: { display: "flex", gap: 8 },
  btnGhost: { padding: "6px 10px", borderRadius: 16, border: "1px solid rgba(0,0,0,0.14)", background: "#fff", cursor: "pointer", fontSize: 12 },
  btnPrimary: { padding: "6px 14px", borderRadius: 16, border: "none", background: "linear-gradient(135deg,#3b82f6,#38bdf8)", color: "#fff", cursor: "pointer", fontSize: 12 },
  body: { display: "flex", flex: 1, minHeight: 0 },
  toolbarDesktop: { width: 260, borderRight: "1px solid rgba(0,0,0,0.06)", background: "#f9fafb" },
  toolbarMobile: { width: "100%", borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#f9fafb" },
  canvasArea: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
  hint: { padding: "6px 14px", fontSize: 11, color: "#555", borderBottom: "1px solid rgba(0,0,0,0.06)" },
};

let idCounter = 1;
const newId = () => `field_${idCounter++}`;

// Normalized <-> Pixel helpers
function pixelToNormalized(pixel, pageSize) {
  return {
    xPct: Math.max(0, Math.min(1, pixel.x / pageSize.width)),
    yPct: Math.max(0, Math.min(1, pixel.y / pageSize.height)),
    wPct: Math.max(0, Math.min(1, pixel.width / pageSize.width)),
    hPct: Math.max(0, Math.min(1, pixel.height / pageSize.height)),
  };
}
function normalizedToPixel(norm, pageSize) {
  return {
    id: norm.id,
    type: norm.type,
    label: norm.label,
    x: Math.round((norm.xPct || 0) * pageSize.width),
    y: Math.round((norm.yPct || 0) * pageSize.height),
    width: Math.round((norm.wPct || 0) * pageSize.width),
    height: Math.round((norm.hPct || 0) * pageSize.height),
    meta: norm.meta || {},
  };
}

/** Simple collision resolver & clamp inside page (returns pixel list) */
function resolveCollisionsAndClamp(normalizedFields, pageSize) {
  const PAD = 8;
  const pixels = normalizedFields.map((f) => normalizedToPixel(f, pageSize));

  // clamp within page
  pixels.forEach((p) => {
    if (p.x < PAD) p.x = PAD;
    if (p.y < PAD) p.y = PAD;
    if (p.x + p.width > pageSize.width - PAD) p.x = Math.max(PAD, pageSize.width - PAD - p.width);
    if (p.y + p.height > pageSize.height - PAD) p.y = Math.max(PAD, pageSize.height - PAD - p.height);
  });

  // push down simple algorithm
  pixels.sort((a, b) => a.y - b.y || a.x - b.x);
  const gap = 10;
  for (let i = 0; i < pixels.length; i++) {
    const a = pixels[i];
    for (let j = 0; j < i; j++) {
      const b = pixels[j];
      const overlapX = !(a.x + a.width <= b.x || b.x + b.width <= a.x);
      const overlapY = !(a.y + a.height <= b.y || b.y + b.height <= a.y);
      if (overlapX && overlapY) {
        a.y = b.y + b.height + gap;
        if (a.y + a.height > pageSize.height - PAD) {
          a.y = Math.max(PAD, pageSize.height - PAD - a.height);
        }
      }
    }
  }

  return pixels;
}

const DUMMY_SIGNATURE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

function Editor({ onSigned }) {
  const { width: windowWidth } = useWindowSize();
  const isMobile = (windowWidth || 0) < 768;

  // store normalized fields
  const [fields, setFields] = useState([]); // each: { id, type, label, xPct,yPct,wPct,hPct, meta }
  const [selectedId, setSelectedId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSignedUrl, setLastSignedUrl] = useState(null);

  // page size responsive
  const pageWidth = useMemo(() => {
    if (!windowWidth) return 700;
    const max = 760, min = 360;
    if (isMobile) return Math.max(min, Math.min(max, windowWidth - 32));
    return Math.max(min, Math.min(max, windowWidth - 260));
  }, [windowWidth, isMobile]);

  const pageSize = useMemo(() => {
    const ratio = 842 / 595;
    return { width: Math.round(pageWidth), height: Math.round(pageWidth * ratio) };
  }, [pageWidth]);

  const { convertToPdf } = usePdfCoordinates();

  // Add field => create normalized from pixel defaults
  const handleAddField = (type) => {
    const basePx = 60;
    const basePy = 60 + fields.length * 40;
    let width = 200, height = 80, label = "Field";
    if (type === "signature") { width = 260; height = 140; label = "Signature"; }
    if (type === "text") { width = 240; height = 110; label = "Text"; }
    if (type === "date") { width = 220; height = 100; label = "Date"; }
    if (type === "image") { width = 220; height = 220; label = "Image"; }
    if (type === "radio") { width = 200; height = 90; label = "Option"; }

    const normalized = pixelToNormalized({ x: basePx, y: basePy, width, height }, pageSize);
    const obj = { id: newId(), type, label, ...normalized, meta: {} };
    setFields((p) => [...p, obj]);
    setSelectedId(obj.id);
  };

  // on child change (pixel coords) -> convert to normalized and save
  const handleFieldChange = (pixel) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id !== pixel.id) return f;
        const normalized = pixelToNormalized(pixel, pageSize);
        return { ...f, ...normalized, meta: { ...(f.meta || {}), ...(pixel.meta || {}) } };
      })
    );
  };

  const handleDelete = (id) => {
    setFields((p) => p.filter((f) => f.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  // ensure collision resolution & clamping when page size changes or fields change initially
  useEffect(() => {
    if (fields.length === 0) return;
    const pixels = resolveCollisionsAndClamp(fields, pageSize);
    // update normalized positions if changed
    let changed = false;
    const newNormalized = fields.map((f) => {
      const p = pixels.find((px) => px.id === f.id);
      if (!p) return f;
      const nx = pixelToNormalized(p, pageSize);
      if (Math.abs((f.xPct || 0) - nx.xPct) > 0.0001 || Math.abs((f.yPct || 0) - nx.yPct) > 0.0001) {
        changed = true;
        return { ...f, ...nx };
      }
      return f;
    });
    if (changed) setFields(newNormalized);
    // run when page size changes or fields count changes
  }, [pageSize.width, pageSize.height, fields.length]);

  // Sign PDF
  const handleSignPdf = async () => {
    if (!fields.length) return alert("Place at least one field.");
    if (!fields.some((f) => f.type === "signature")) return alert("Add a signature field.");

    setIsProcessing(true);
    try {
      const pdfId = "sample-1";
      const mapped = fields.map((f) => {
        const pixel = normalizedToPixel(f, pageSize);
        const geo = convertToPdf(pixel, pageSize); // convert to PDF points
        return { ...geo, type: f.type };
      });

      const payload = { pdfId, signatureImage: DUMMY_SIGNATURE, fields: mapped };
      const response = await signPdf(payload);
      const fullUrl = API_ORIGIN + response.url;
      setLastSignedUrl(fullUrl);
      if (onSigned) onSigned(fullUrl, pdfId); else window.open(fullUrl, "_blank");
    } catch (err) {
      console.error(err);
      alert("Error while signing: " + (err.message || err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePreview = () => {
    if (!lastSignedUrl) return alert("No signed PDF yet.");
    if (onSigned) onSigned(lastSignedUrl, "sample-1"); else window.open(lastSignedUrl, "_blank");
  };

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <div style={styles.titleBlock}>
          <div style={styles.title}>Signature Injection Editor</div>
          <div style={styles.subtitle}>Drag fields from the left and place them on the PDF</div>
        </div>

        <div style={styles.actions}>
          <button style={styles.btnGhost} onClick={handlePreview}>Preview</button>
          <button style={styles.btnPrimary} onClick={handleSignPdf}>Sign PDF</button>
        </div>
      </header>

      <div style={{ ...styles.body, flexDirection: isMobile ? "column" : "row" }}>
        <div style={isMobile ? styles.toolbarMobile : styles.toolbarDesktop}>
          <Toolbar onAddField={handleAddField} />
        </div>

        <div style={styles.canvasArea}>
          <div style={styles.hint}>Tip: Drag fields onto the page. On mobile toolbar moves on top.</div>

          <PDFViewer file="/sample.pdf" pageWidth={pageSize.width}>
            {(() => {
              // resolved pixels for display
              const pixels = resolveCollisionsAndClamp(fields, pageSize);
              const map = new Map(pixels.map((p) => [p.id, p]));
              // render in stored order (so z-order stable)
              return fields.map((f) => {
                const p = map.get(f.id) || normalizedToPixel(f, pageSize);
                const common = {
                  key: f.id,
                  id: f.id,
                  x: p.x,
                  y: p.y,
                  width: p.width,
                  height: p.height,
                  selected: selectedId === f.id,
                  onChange: handleFieldChange,
                  onSelect: () => setSelectedId(f.id),
                  onDelete: () => handleDelete(f.id),
                  meta: f.meta || {},
                  label: f.label,
                };
                return f.type === "signature" ? <SignatureBox {...common} /> : <DraggableField {...common} />;
              });
            })()}
          </PDFViewer>
        </div>
      </div>

      {isProcessing && <Loader text="Signing PDF on server…" />}
    </div>
  );
}

export default Editor;

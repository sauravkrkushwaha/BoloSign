import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import PDFViewer from "../components/PDFViewer";
import PageLayer from "../components/PageLayer";
import FieldLayer from "../components/FieldLayer";
import Toolbar from "../components/Toolbar";
import Loader from "../components/Loader";

import { signPdf } from "../utils/api";
import {
  DEFAULT_FIELD_POSITION,
  DEFAULT_FIELD_SIZES,
} from "../utils/constants";
import { useWindowSize } from "../hooks/useWindowSize";

import { v4 as uuidv4 } from "uuid";

export default function Editor() {
  const { isMobile } = useWindowSize();
  const navigate = useNavigate();

  const [pageMeta, setPageMeta] = useState(null);
  const [fields, setFields] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [signatureImage, setSignatureImage] = useState(null);

  const [toolbarOpen, setToolbarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const addField = (type) => {
    if (!pageMeta) return;

    const size = DEFAULT_FIELD_SIZES[type];

    const newField = {
      id: uuidv4(),
      type,
      page: pageMeta.pageIndex,
      ...DEFAULT_FIELD_POSITION,
      ...size,
      value: "",
    };

    setFields((prev) => [...prev, newField]);
    setSelectedId(newField.id);
    setToolbarOpen(false);
  };

  const updateField = (fieldId, updatedPct) => {
    setFields((prev) =>
      prev.map((f) =>
        f.id === fieldId ? { ...f, ...updatedPct } : f
      )
    );
  };

  const updateFieldValue = (fieldId, value) => {
    setFields((prev) =>
      prev.map((f) =>
        f.id === fieldId ? { ...f, value } : f
      )
    );
  };

  // ❌ REMOVE FIELD
  const removeField = (fieldId) => {
    setFields((prev) =>
      prev.filter((f) => f.id !== fieldId)
    );

    if (selectedId === fieldId) {
      setSelectedId(null);
    }
  };

  const handleSign = async () => {
    try {
      setLoading(true);

      const payload = {
        pdfId: "sample-001",
        signatureImage,
        fields: fields.map(({ id, ...rest }) => rest),
      };

      const result = await signPdf(payload);
      navigate("/preview", {
        state: { pdfUrl: result.url },
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-root">
      <Header />

      <div className="editor-layout">
        {!isMobile && <Toolbar onAddField={addField} />}

        <div className="editor-canvas">
          <PDFViewer
            file="/sample.pdf"
            onPageReady={setPageMeta}
          >
            {pageMeta && (
              <PageLayer
                pageIndex={pageMeta.pageIndex}
                pageWidth={pageMeta.width}
                pageHeight={pageMeta.height}
              >
                <FieldLayer
                  fields={fields}
                  pageIndex={pageMeta.pageIndex}
                  pageWidth={pageMeta.width}
                  pageHeight={pageMeta.height}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onUpdate={updateField}
                  onRemove={removeField} // 👈 HERE
                  onFieldValueChange={updateFieldValue}
                  onSignatureChange={setSignatureImage}
                />
              </PageLayer>
            )}
          </PDFViewer>
        </div>

        {isMobile && (
          <button
            className="fab"
            onClick={() => setToolbarOpen(true)}
          >
            +
          </button>
        )}

        {isMobile && (
          <Toolbar
            isMobile
            open={toolbarOpen}
            onClose={() => setToolbarOpen(false)}
            onAddField={addField}
          />
        )}
      </div>

      <button
        className="sign-btn"
        onClick={handleSign}
        disabled={loading}
      >
        Sign PDF
      </button>

      {loading && (
        <Loader fullscreen text="Signing document…" />
      )}
    </div>
  );
}

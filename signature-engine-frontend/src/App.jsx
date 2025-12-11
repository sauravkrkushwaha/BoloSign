import React, { useState } from "react";
import Editor from "./pages/Editor";
import Preview from "./pages/Preview";

function App() {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [mode, setMode] = useState("editor"); // "editor" | "preview"
  const [currentPdfId, setCurrentPdfId] = useState(null);

  const handleOpenPreview = (url, pdfId) => {
    setPreviewUrl(url);
    setCurrentPdfId(pdfId || null);
    setMode("preview");
  };

  const handleBackToEditor = () => {
    setMode("editor");
  };

  return (
    <>
      {mode === "editor" && <Editor onSigned={handleOpenPreview} />}
      {mode === "preview" && (
        <Preview pdfUrl={previewUrl} onBack={handleBackToEditor} pdfId={currentPdfId} />
      )}
    </>
  );
}

export default App;

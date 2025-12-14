import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Editor from "./pages/Editor";
import Preview from "./pages/Preview";

/**
 * App
 *
 * Responsibilities:
 * - Application routing
 * - Page-level separation
 *
 * Routes:
 * - /          → Editor
 * - /preview   → Signed PDF preview
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Editor />} />
        <Route path="/preview" element={<Preview />} />
      </Routes>
    </BrowserRouter>
  );
}

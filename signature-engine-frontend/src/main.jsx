import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * Application Entry Point
 *
 * Responsibilities:
 * - Bootstrap React
 * - Attach app to DOM
 * - Load global styles
 */

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

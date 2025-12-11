// src/utils/api.js

// API base URL (Vite env se ya default localhost)
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Backend origin (without /api) → static /uploads URLs ke liye
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

/**
 * Generic HTTP request helper
 */
async function request(path, options = {}) {
  const url =
    path.startsWith("http://") || path.startsWith("https://")
      ? path
      : `${API_BASE_URL}${path}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  const finalOptions = {
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
    ...options,
  };

  const res = await fetch(url, finalOptions);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error: ${res.status} ${res.statusText} ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

/**
 * Call backend to sign PDF.
 * payload example:
 * {
 *   pdfId: "sample-1",
 *   signatureImage: "data:image/png;base64,...",
 *   fields: [ { x, y, width, height, page, type } ]
 * }
 */
export function signPdf(payload) {
  return request("/sign-pdf", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Optional: fetch audit trail for a PDF
 */
export function getAuditTrail(pdfId) {
  return request(`/audit/${encodeURIComponent(pdfId)}`, {
    method: "GET",
  });
}

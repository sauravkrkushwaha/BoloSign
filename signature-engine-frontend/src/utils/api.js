/**
 * api.js
 *
 * Centralized backend communication layer
 * Keeps pages & components clean
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

/**
 * Sign PDF
 *
 * Payload format (LOCKED with backend):
 * {
 *   pdfId: string,
 *   signatureImage: base64 | null,
 *   fields: [
 *     {
 *       page,
 *       type,
 *       xPct,
 *       yPct,
 *       widthPct,
 *       heightPct,
 *       value?
 *     }
 *   ]
 * }
 */
export async function signPdf(payload) {
  const response = await fetch(
    `${API_BASE_URL}/sign-pdf`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await safeJson(response);
    throw new Error(
      error?.error || "Failed to sign PDF"
    );
  }

  return response.json();
}

/**
 * Fetch audit trail (optional feature)
 */
export async function getAuditTrail(pdfId) {
  const response = await fetch(
    `${API_BASE_URL}/audit/${pdfId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch audit trail");
  }

  return response.json();
}

/**
 * Safe JSON parser
 */
async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

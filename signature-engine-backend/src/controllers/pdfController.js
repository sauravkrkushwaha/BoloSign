// src/controllers/pdfController.js

import path from "path";
import PdfRecord from "../models/PdfRecord.js";
import AuditTrail from "../models/AuditTrail.js";
import { signPdfOnDisk } from "../services/pdfService.js";
import { ENV } from "../config/env.js";

function buildSignedFileName(pdfId) {
  const timestamp = Date.now();
  return `${pdfId}-signed-${timestamp}.pdf`;
}

/**
 * POST /api/sign-pdf
 *
 * Expected JSON body:
 * {
 *   "pdfId": "sample-1",
 *   "signatureImage": "data:image/png;base64,...",
 *   "fields": [
 *      { "x": 120, "y": 240, "width": 150, "height": 60, "page": 1, "type": "signature" }
 *   ]
 * }
 */
export const signPdf = async (req, res) => {
  try {
    const { pdfId, signatureImage, fields } = req.body || {};

    if (!pdfId) {
      return res.status(400).json({ error: "pdfId is required" });
    }
    if (!signatureImage) {
      return res
        .status(400)
        .json({ error: "signatureImage (base64) is required" });
    }
    if (!Array.isArray(fields) || fields.length === 0) {
      return res
        .status(400)
        .json({ error: "fields array with at least one signature is required" });
    }

    // 1) Find the PDF record in DB (we stored filePath earlier or you can hardcode for prototype)
    let pdfRecord = await PdfRecord.findOne({ pdfId });

    // For quick prototype: if record not found, assume a default original PDF
    if (!pdfRecord) {
      // You can change this path to wherever your original PDF exists on backend
      // For example: "src/uploads/original-sample.pdf"
      const defaultOriginalPath = path.join(process.cwd(), "src", "uploads", "original-sample.pdf");

      pdfRecord = await PdfRecord.create({
        pdfId,
        originalHash: "TEMP_PLACEHOLDER", // will be updated after signing
        filePath: defaultOriginalPath,
      });
    }

    const pdfPath = pdfRecord.filePath;
    const outputFileName = buildSignedFileName(pdfId);

    // 2) Use pdfService to actually sign the PDF on disk
    const { originalHash, signedHash, signedFilePath } = await signPdfOnDisk({
      pdfPath,
      outputFileName,
      signatureImage,
      fields,
    });

    // 3) Update PdfRecord with hashes and signed path
    pdfRecord.originalHash = originalHash;
    pdfRecord.signedHash = signedHash;
    pdfRecord.signedFilePath = signedFilePath;
    await pdfRecord.save();

    // 4) Create audit trail entry
    await AuditTrail.create({
      pdfId,
      action: "SIGNED",
      details: {
        fieldsCount: fields.length,
        signedFilePath,
      },
    });

    // 5) Build public URL (for Render/any host you will later use)
    // For local dev, we'll just return the path; in real deploy, you'd map uploads folder as static.
    const publicUrl = `/uploads/${path.basename(signedFilePath)}`;

    return res.status(200).json({
      message: "PDF signed successfully",
      pdfId,
      originalHash,
      signedHash,
      signedFilePath,
      url: publicUrl,
    });
  } catch (error) {
    console.error("Error in signPdf controller:", error);
    return res.status(500).json({
      error: "Failed to sign PDF",
      details: error.message,
    });
  }
};

// src/controllers/pdfController.js

import path from "path";
import { fileURLToPath } from "url";

import PdfRecord from "../models/PdfRecord.js";
import AuditTrail from "../models/AuditTrail.js";
import { signPdfOnDisk } from "../services/pdfService.js";

/**
 * Resolve __dirname in ESM (VERY IMPORTANT)
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Build signed PDF filename
 */
function buildSignedFileName(pdfId) {
  return `${pdfId}-signed-${Date.now()}.pdf`;
}

export const signPdf = async (req, res) => {
  try {
    const { pdfId, signatureImage, fields } = req.body;

    // --------------------
    // Validation
    // --------------------
    if (!pdfId || !Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    for (const field of fields) {
      if (
        typeof field.page !== "number" ||
        typeof field.xPct !== "number" ||
        typeof field.yPct !== "number" ||
        typeof field.widthPct !== "number" ||
        typeof field.heightPct !== "number"
      ) {
        return res.status(400).json({
          error: "Invalid field coordinate format",
        });
      }
    }

    // --------------------
    // Fetch or create PDF record
    // --------------------
    let pdfRecord = await PdfRecord.findOne({ pdfId });

    if (!pdfRecord) {
      /**
       * IMPORTANT:
       * assets/original-sample.pdf
       * is located at:
       * signature-engine-backend/assets/original-sample.pdf
       */
      const defaultPdfPath = path.resolve(
        process.cwd(),
        "signature-engine-backend",
        "assets",
        "original-sample.pdf"
      );
      pdfRecord = await PdfRecord.create({
        pdfId,
        originalHash: "TEMP",
        filePath: defaultPdfPath,
      });
    }

    // --------------------
    // Sign PDF
    // --------------------
    const result = await signPdfOnDisk({
      pdfPath: pdfRecord.filePath,
      outputFileName: buildSignedFileName(pdfId),
      signatureImage,
      fields,
    });

    // --------------------
    // Persist hashes
    // --------------------
    pdfRecord.originalHash = result.originalHash;
    pdfRecord.signedHash = result.signedHash;
    pdfRecord.signedFilePath = result.signedFilePath;
    await pdfRecord.save();

    await AuditTrail.create({
      pdfId,
      action: "SIGNED",
      details: { fieldsCount: fields.length },
    });

    // --------------------
    // Response
    // --------------------
    return res.status(200).json({
      message: "PDF signed successfully",
      url: `/uploads/${path.basename(result.signedFilePath)}`,
      hashes: {
        before: result.originalHash,
        after: result.signedHash,
      },
    });
  } catch (err) {
    console.error("❌ PDF signing failed:", err);
    return res.status(500).json({ error: "PDF signing failed" });
  }
};

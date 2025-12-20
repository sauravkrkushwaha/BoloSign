// src/controllers/pdfController.js

import path from "path";
import fs from "fs";

import PdfRecord from "../models/PdfRecord.js";
import AuditTrail from "../models/AuditTrail.js";
import { signPdfOnDisk } from "../services/pdfService.js";

function buildSignedFileName(pdfId) {
  return `${pdfId}-signed-${Date.now()}.pdf`;
}

export const signPdf = async (req, res) => {
  try {
    const { pdfId, signatureImage, fields } = req.body;

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

    let pdfRecord = await PdfRecord.findOne({ pdfId });

    // 🔥 CREATE NEW RECORD WITH LINUX-SAFE PATH
    if (!pdfRecord) {
      const defaultPdfPath = path.resolve(
        process.cwd(),
        "assets",
        "original-sample.pdf"
      );

      // SAFETY CHECK
      if (!fs.existsSync(defaultPdfPath)) {
        return res.status(500).json({
          error: "Default PDF not found on server",
        });
      }

      pdfRecord = await PdfRecord.create({
        pdfId,
        originalHash: "TEMP",
        filePath: defaultPdfPath,
      });
    }

    const result = await signPdfOnDisk({
      pdfPath: pdfRecord.filePath,
      outputFileName: buildSignedFileName(pdfId),
      signatureImage,
      fields,
    });

    pdfRecord.originalHash = result.originalHash;
    pdfRecord.signedHash = result.signedHash;
    pdfRecord.signedFilePath = result.signedFilePath;
    await pdfRecord.save();

    await AuditTrail.create({
      pdfId,
      action: "SIGNED",
      details: { fieldsCount: fields.length },
    });

    const publicUrl = `${req.protocol}://${req.get("host")}/uploads/${path.basename(
      result.signedFilePath
    )}`;

    return res.status(200).json({
      message: "PDF signed successfully",
      url: publicUrl,
      hashes: {
        before: result.originalHash,
        after: result.signedHash,
      },
    });

  } catch (err) {
    console.error("❌ PDF signing failed");
    console.error(err.message);
    console.error(err.stack);

    return res.status(500).json({ error: err.message });
  }
};

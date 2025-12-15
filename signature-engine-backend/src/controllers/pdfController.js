import path from "path";
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

    if (!pdfRecord) {
      const defaultPath = path.join(
        process.cwd(),
        "assets",
        "original-sample.pdf"
      );


      pdfRecord = await PdfRecord.create({
        pdfId,
        originalHash: "TEMP",
        filePath: defaultPath,
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

    res.status(200).json({
      message: "PDF signed successfully",
      url: `/uploads/${path.basename(result.signedFilePath)}`,
      hashes: {
        before: result.originalHash,
        after: result.signedHash,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "PDF signing failed" });
  }
};

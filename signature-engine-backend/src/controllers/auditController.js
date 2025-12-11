// src/controllers/auditController.js

import PdfRecord from "../models/PdfRecord.js";
import AuditTrail from "../models/AuditTrail.js";

/**
 * GET /api/audit/:pdfId
 *
 * Returns:
 * {
 *   pdf: { ...PdfRecord },
 *   auditTrail: [ ...AuditTrail[] ]
 * }
 */
export const getAuditTrail = async (req, res) => {
  try {
    const { pdfId } = req.params;

    if (!pdfId) {
      return res.status(400).json({ error: "pdfId parameter is required" });
    }

    const pdf = await PdfRecord.findOne({ pdfId });
    if (!pdf) {
      return res.status(404).json({ error: "PDF record not found" });
    }

    const auditTrail = await AuditTrail.find({ pdfId }).sort({
      createdAt: 1,
    });

    return res.status(200).json({
      pdf,
      auditTrail,
    });
  } catch (error) {
    console.error("Error in getAuditTrail controller:", error);
    return res.status(500).json({
      error: "Failed to fetch audit trail",
      details: error.message,
    });
  }
};

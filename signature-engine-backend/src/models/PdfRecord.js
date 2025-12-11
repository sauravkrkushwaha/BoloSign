// src/models/PdfRecord.js

import mongoose from "mongoose";

const PdfRecordSchema = new mongoose.Schema(
  {
    pdfId: {
      type: String,
      required: true,
      unique: true,
    },

    originalHash: {
      type: String,
      required: true,
    },

    signedHash: {
      type: String,
    },

    filePath: {
      type: String,
      required: true, // original PDF path
    },

    signedFilePath: {
      type: String, // signed output PDF path
    },
  },
  {
    timestamps: true, // createdAt, updatedAt automatically
  }
);

export default mongoose.model("PdfRecord", PdfRecordSchema);

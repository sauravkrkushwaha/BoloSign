// src/models/AuditTrail.js

import mongoose from "mongoose";

const AuditTrailSchema = new mongoose.Schema(
  {
    pdfId: {
      type: String,
      required: true,
    },

    action: {
      type: String,
      enum: ["UPLOADED", "SIGNED"],
      required: true,
    },

    details: {
      type: Object, // any extra info
      default: {},
    },
  },
  {
    timestamps: true, // stores timestamp of the action
  }
);

export default mongoose.model("AuditTrail", AuditTrailSchema);

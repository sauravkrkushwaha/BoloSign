// src/routes/auditRoutes.js

import { Router } from "express";
import { getAuditTrail } from "../controllers/auditController.js";

const router = Router();

// GET /api/audit/:pdfId  (mounted later in index.js)
router.get("/:pdfId", getAuditTrail);

export default router;

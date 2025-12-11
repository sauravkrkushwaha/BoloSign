// src/routes/index.js

import { Router } from "express";
import pdfRoutes from "./pdfRoutes.js";
import auditRoutes from "./auditRoutes.js";

const router = Router();

// All API routes will be under /api
router.use("/", pdfRoutes);            // /api/sign-pdf
router.use("/audit", auditRoutes);     // /api/audit/:pdfId

export default router;

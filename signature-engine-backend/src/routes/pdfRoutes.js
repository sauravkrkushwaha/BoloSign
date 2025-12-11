// src/routes/pdfRoutes.js

import { Router } from "express";
import { signPdf } from "../controllers/pdfController.js";

const router = Router();

// POST /api/sign-pdf
router.post("/sign-pdf", signPdf);

export default router;

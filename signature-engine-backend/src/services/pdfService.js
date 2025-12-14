// src/services/pdfService.js

import fs from "fs";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { ENV } from "../config/env.js";
import { hashFile, hashBuffer } from "./hashService.js";

/**
 * Ensure upload directory exists
 */
function ensureUploadDir() {
  if (!fs.existsSync(ENV.UPLOAD_DIR)) {
    fs.mkdirSync(ENV.UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Strip base64 prefix
 */
function stripBase64Prefix(dataUrl) {
  if (!dataUrl) return null;
  return dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
}

/**
 * Draw signature image inside a box (aspect-ratio safe)
 */
async function drawSignature(pdfDoc, page, imageBytes, box) {
  const image = await pdfDoc
    .embedPng(imageBytes)
    .catch(() => pdfDoc.embedJpg(imageBytes));

  const scale = Math.min(
    box.width / image.width,
    box.height / image.height
  );

  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;

  const x = box.x + (box.width - drawWidth) / 2;
  const y = box.y + (box.height - drawHeight) / 2;

  page.drawImage(image, { x, y, width: drawWidth, height: drawHeight });
}

/**
 * Draw text/date/radio
 */
function drawText(page, text, box, font) {
  page.drawText(text, {
    x: box.x + 4,
    y: box.y + box.height / 2 - 6,
    size: 12,
    font,
    color: rgb(0, 0, 0),
  });
}

/**
 * Main signing service
 */
export async function signPdfOnDisk({
  pdfPath,
  outputFileName,
  signatureImage,
  fields = [],
}) {
  ensureUploadDir();

  const originalHash = hashFile(pdfPath);

  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const signatureBytes = signatureImage
    ? Buffer.from(stripBase64Prefix(signatureImage), "base64")
    : null;

  for (const field of fields) {
    const pageIndex = field.page; // 0-based
    if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) continue;

    const page = pdfDoc.getPage(pageIndex);

    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();

    // 🔥 CORE LOGIC: % → PDF points + Y-axis flip
    const box = {
      x: field.xPct * pageWidth,
      width: field.widthPct * pageWidth,
      height: field.heightPct * pageHeight,
      y:
        pageHeight -
        field.yPct * pageHeight -
        field.heightPct * pageHeight,
    };

    switch (field.type) {
      case "signature":
        if (signatureBytes) {
          await drawSignature(pdfDoc, page, signatureBytes, box);
        }
        break;

      case "text":
        drawText(page, field.value || "", box, font);
        break;

      case "date":
        drawText(
          page,
          new Date().toLocaleDateString(),
          box,
          font
        );
        break;

      case "radio":
        drawText(
          page,
          field.value === "checked" ? "✔" : "",
          box,
          font
        );
        break;

      default:
        break;
    }
  }

  const signedPdfBytes = await pdfDoc.save();
  const signedHash = hashBuffer(signedPdfBytes);

  const signedFilePath = path.join(ENV.UPLOAD_DIR, outputFileName);
  fs.writeFileSync(signedFilePath, signedPdfBytes);

  return {
    originalHash,
    signedHash,
    signedFilePath,
  };
}

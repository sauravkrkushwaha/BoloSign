// src/services/pdfService.js

import fs from "fs";
import path from "path";
import { PDFDocument, rgb } from "pdf-lib";
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
 * Strip base64 data URL prefix and return raw base64 string
 * e.g. "data:image/png;base64,AAAA..." -> "AAAA..."
 */
function stripBase64Prefix(dataUrl) {
  if (!dataUrl) return null;
  const parts = dataUrl.split(",");
  return parts.length === 2 ? parts[1] : dataUrl;
}

/**
 * Draw signature image inside a given box while preserving aspect ratio.
 * Box is defined in PDF points: { x, y, width, height, page }
 */
async function drawSignatureInBox(pdfDoc, page, signatureImageBytes, box) {
  // 1) Embed image (PNG first, fallback JPG)
  const signatureImage = await pdfDoc
    .embedPng(signatureImageBytes)
    .catch(async () => await pdfDoc.embedJpg(signatureImageBytes));

  const imgWidth = signatureImage.width;
  const imgHeight = signatureImage.height;

  const boxWidth = box.width;
  const boxHeight = box.height;

  // 2) Scale factor to fit inside box
  const scale = Math.min(boxWidth / imgWidth, boxHeight / imgHeight);

  const drawWidth = imgWidth * scale;
  const drawHeight = imgHeight * scale;

  // 3) Center image inside the box
  const drawX = box.x + (boxWidth - drawWidth) / 2;
  const drawY = box.y + (boxHeight - drawHeight) / 2;

  // 🔴 DEBUG VISUAL: filled light-red rectangle with red border
  page.drawRectangle({
    x: box.x,
    y: box.y,
    width: boxWidth,
    height: boxHeight,
    color: rgb(1, 0.9, 0.9),        // light red fill
    borderColor: rgb(1, 0, 0),      // red border
    borderWidth: 1,
  });

  // 4) Draw the actual signature image
  page.drawImage(signatureImage, {
    x: drawX,
    y: drawY,
    width: drawWidth,
    height: drawHeight,
  });
}

/**
 * Main service: take an existing PDF on disk, overlay signatures,
 * calculate hashes, and save a new signed PDF.
 *
 * @param {Object} params
 * @param {string} params.pdfPath          - original PDF file path
 * @param {string} params.outputFileName   - file name for signed PDF
 * @param {string} params.signatureImage   - data URL or raw base64 PNG/JPG
 * @param {Array}  params.fields           - array of { x, y, width, height, page, type }
 *
 * @returns {Promise<{ originalHash, signedHash, signedFilePath }>}
 */
export async function signPdfOnDisk({
  pdfPath,
  outputFileName,
  signatureImage,
  fields = [],
}) {
  ensureUploadDir();

  // 1) Hash of original PDF
  const originalHash = hashFile(pdfPath);

  // 2) Load original PDF
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  console.log(
    "Loaded PDF from:",
    pdfPath,
    "Pages:",
    pdfDoc.getPageCount()
  );

  // 3) Prepare signature image bytes
  if (!signatureImage) {
    throw new Error("signatureImage is required to sign the PDF.");
  }

  const base64String = stripBase64Prefix(signatureImage);
  const signatureBytes = Buffer.from(base64String, "base64");

  // 4) For each signature-type field, draw signature
  for (const field of fields) {
    if (field.type !== "signature") continue;

    const pageIndex = (field.page || 1) - 1;

    // Guard: page index must be valid
    if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) {
      console.warn(
        "Skipping field with invalid page index:",
        field,
        "pageIndex:",
        pageIndex
      );
      continue;
    }

    const page = pdfDoc.getPage(pageIndex);

    await drawSignatureInBox(pdfDoc, page, signatureBytes, field);
  }

  // 5) Save modified PDF to bytes
  const signedPdfBytes = await pdfDoc.save();

  // 6) Hash of signed PDF
  const signedHash = hashBuffer(signedPdfBytes);

  // 7) Save signed PDF to disk
  const signedFilePath = path.join(ENV.UPLOAD_DIR, outputFileName);
  fs.writeFileSync(signedFilePath, signedPdfBytes);

  return {
    originalHash,
    signedHash,
    signedFilePath,
  };
}

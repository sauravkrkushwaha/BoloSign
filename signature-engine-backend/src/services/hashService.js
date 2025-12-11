// src/services/hashService.js

import crypto from "crypto";
import fs from "fs";

/**
 * Hash any Buffer using SHA-256
 */
export function hashBuffer(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Hash a file on disk (sync, simple enough for our case)
 */
export function hashFile(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return hashBuffer(fileBuffer);
}

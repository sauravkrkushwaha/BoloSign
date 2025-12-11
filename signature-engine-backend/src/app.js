// src/app.js

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { ENV } from "./config/env.js";
import apiRoutes from "./routes/index.js";

const app = express();

// For resolving paths correctly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(
  cors({
    origin: "*", // development ke liye open; prod mein restrict kar sakte ho
  })
);

app.use(
  express.json({
    limit: "10mb", // base64 signature ke liye thoda zyada
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

// Static serving of signed PDFs
const uploadsAbsolutePath = path.resolve(__dirname, "..", ENV.UPLOAD_DIR);
app.use("/uploads", express.static(uploadsAbsolutePath));

// Health check / root
app.get("/", (req, res) => {
  res.send("Signature Injection Engine Backend is running.");
});

// API Routes
app.use("/api", apiRoutes);

export default app;

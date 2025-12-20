import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { ENV } from "./config/env.js";
import apiRoutes from "./routes/index.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: "*",
  })
);

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

// const uploadsAbsolutePath = path.resolve(__dirname, "..", ENV.UPLOAD_DIR);
// app.use("/uploads", express.static(uploadsAbsolutePath));

app.use("/uploads", express.static(ENV.UPLOAD_DIR));


app.get("/", (req, res) => {
  res.send("Signature Injection Engine Backend is running.");
});

app.use("/api", apiRoutes);

export default app;

import dotenv from "dotenv";
import path from "path";

// Load .env from config folder
dotenv.config({
  path: path.resolve("src/config/.env"),
});

export const ENV = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  UPLOAD_DIR: process.env.UPLOAD_DIR || "src/uploads",
};

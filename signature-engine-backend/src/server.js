// src/server.js

import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { ENV } from "./config/env.js";

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    server.listen(ENV.PORT, () => {
      console.log(`🚀 Server listening on port ${ENV.PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

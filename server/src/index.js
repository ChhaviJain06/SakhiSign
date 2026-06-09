import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/auth.js";
import signRoutes from "./routes/signs.js";
import practiceRoutes from "./routes/practice.js";
import dashboardRoutes from "./routes/dashboard.js";

const app = express();

app.use(cors({ origin: env.corsOrigins, credentials: true }));
app.use(express.json({ limit: "10mb" })); // landmark payloads can be sizeable

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/signs", signRoutes);
app.use("/api/practice", practiceRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Centralized error handler
app.use((err, _req, res, _next) => {
  console.error("[error]", err);
  res.status(500).json({ error: "Internal server error" });
});

async function start() {
  await connectDB();
  app.listen(env.port, () => console.log(`[server] listening on :${env.port}`));
}

start().catch((e) => {
  console.error("Failed to start server:", e);
  process.exit(1);
});

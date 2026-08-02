import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { logger } from "./utils/logger.js";
import { rateLimiter } from "./utils/rateLimiter.js";
import downloaderRoutes from "./routes/downloader.js";
import searchRoutes from "./routes/search.js";

const app = express();

app.use(cors()); // tighten to your deployed frontend's origin in production
app.use(express.json());
app.use("/api", rateLimiter(config.rateLimit));
app.use("/api", downloaderRoutes);
app.use("/api", searchRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use((err, _req, res, _next) => {
  logger.error("unhandled error", { error: err.message });
  res.status(500).json({ success: false, error: "Internal server error." });
});

app.listen(config.port, () => {
  logger.info(`Omega downloader service listening`, { port: config.port });
});

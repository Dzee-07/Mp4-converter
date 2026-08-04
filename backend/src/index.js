import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { logger } from "./utils/logger.js";
import { rateLimiter } from "./utils/rateLimiter.js";
import downloaderRoutes from "./routes/downloader.js";
import searchRoutes from "./routes/search.js";
import { YouTubePlatform } from "./platforms/youtube.js";

const app = express();

const yt = new YouTubePlatform();

app.use(cors()); // tighten to your deployed frontend's origin in production
app.use(express.json());
app.use("/api", rateLimiter(config.rateLimit));
app.use("/api", downloaderRoutes);
app.use("/api", searchRoutes);

// Add these endpoint hooks to your primary backend server index routing file
// Add these endpoint hooks to your primary backend server index routing file

app.post("/api/convert", async (req, res) => {
  try {
    const { url, resolution } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "Video URL is required.",
      });
    }

    const result = await yt.getDownloadInfo(
      url,
      resolution || "1080p"
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.note || "yt-dlp conversion failed.",
      });
    }

    return res.json({
      success: true,
      title: result.title,
      downloadUrl: result.downloadUrl,
      formats: result.formats,
    });
  } catch (error) {
    console.error("Convert error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use((err, _req, res, _next) => {
  logger.error("unhandled error", { error: err.message });
  res.status(500).json({ success: false, error: "Internal server error." });
});

app.listen(config.port, () => {
  logger.info(`Omega downloader service listening`, { port: config.port });
});

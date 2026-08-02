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
// Add these endpoint hooks to your primary backend server index routing file
app.post("/api/convert", async (req, res) => {
  try {
    const { url, resolution } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, error: "Missing source video URL target pointer." });
    }

    // 1. Utilize a streamlined, high-speed extraction engine to handle format parsing
    // This circumvents signature throttling and provides a direct, packaged MP4 media mirror link.
    const extractionResponse = await fetch("https://cobalt.tools", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        url: url,
        videoQuality: resolution === "1080p" ? "1080" : "720", 
        filenamePattern: "basic"
      })
    });

    if (!extractionResponse.ok) {
      throw new Error("The downstream video rendering pipeline cluster timed out.");
    }

    const data = await extractionResponse.json();

    // 2. Validate that the container link layout actually returned media stream parameters
    if (data.status === "error" || !data.url) {
      return res.status(500).json({ 
        success: false, 
        error: data.text || "Failed to compile specific resolution tracks into an MP4 block." 
      });
    }

    // 3. Return the fully executable target download download link cleanly back to the client
    return res.json({
      success: true,
      title: data.filename || "Converted Media File Stream",
      downloadUrl: data.url // Direct raw audio/video mirror address destination
    });

  } catch (error) {
    console.error("Downloader operational exception:", error);
    return res.status(500).json({ success: false, error: error.message });
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

import express from "express";
import { getDownloadUrl } from "../lib/downloads.js";

const router = express.Router();

router.post("/", (req, res) => {
  try {
    const { slug } = req.body;

    if (!slug) {
      return res.status(400).json({ success: false, message: "Product slug is required." });
    }

    const downloadUrl = getDownloadUrl(slug);

    if (!downloadUrl) {
      return res.status(404).json({ success: false, message: "Download not found." });
    }

    return res.json({ success: true, downloadUrl });

  } catch (error) {
    console.error("[get-download] Error:", error);
    return res.status(500).json({ success: false, message: "Unable to generate download." });
  }
});

export default router;

import express from "express";
import { verifyDownloadToken } from "../lib/jwt.js";
import { getProductBySlug } from "../lib/products.js";
import { getDownloadUrl } from "../lib/downloads.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const { token, slug: querySlug } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required." });
    }

    const payload = verifyDownloadToken(token);
    const requestSlug = querySlug || payload.slug;

    if (!requestSlug) {
      return res.status(400).json({ success: false, message: "Product slug is required." });
    }

    // Verify the token authorises this slug
    const isAuthorized =
      payload.slug === requestSlug ||
      (Array.isArray(payload.slugs) && payload.slugs.includes(requestSlug));

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: "Token not authorised for this product." });
    }

    const product = getProductBySlug(requestSlug);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const downloadUrl = getDownloadUrl(product.downloadId);
    if (!downloadUrl) {
      return res.status(404).json({ success: false, message: "Download unavailable." });
    }

    return res.json({ success: true, downloadUrl });

  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
});

export default router;

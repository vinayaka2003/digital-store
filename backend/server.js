import express from "express";
import cors from "cors";
import "dotenv/config";

import createOrderRoute from "./routes/createOrder.js";
import verifyPaymentRoute from "./routes/verifyPayment.js";
import downloadRoute from "./routes/download.js";

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const allowedOrigins = [
  FRONTEND_URL,
  process.env.NEXT_PUBLIC_SITE_URL,
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (
        allowedOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "WaveLabs Backend API", port: PORT });
});

app.use("/api/create-order", createOrderRoute);
app.use("/api/verify-payment", verifyPaymentRoute);
app.use("/api/download", downloadRoute);

app.listen(PORT, () => {
  console.log(`✅ WaveLabs Backend running on http://localhost:${PORT}`);
  console.log(`   CORS allowed origin: ${FRONTEND_URL}`);
});

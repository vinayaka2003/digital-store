import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_unsafe_secret";

export function createDownloadToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyDownloadToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

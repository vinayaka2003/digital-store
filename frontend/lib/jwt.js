import jwt from "jsonwebtoken";
import "dotenv/config";

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error("Missing JWT_SECRET in environment variables.");
}

export function createDownloadToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "30m" });
}

export function verifyDownloadToken(token) {
  return jwt.verify(token, SECRET);
}

import jwt from "jsonwebtoken";

const ADMIN_SECRET = process.env.ADMIN_SECRET || process.env.JWT_SECRET || "admin_fallback_secret_key_9f8a2b3c";

export function createAdminSession(username) {
  return jwt.sign({ username }, ADMIN_SECRET, { expiresIn: "12h" });
}

export function verifyAdminSession(token) {
  if (!token) return false;

  try {
    const payload = jwt.verify(token, ADMIN_SECRET);
    const expectedUser = process.env.ADMIN_USER || "admin";
    
    return payload && payload.username === expectedUser;
  } catch (error) {
    console.error("[Auth] Session validation failed:", error.message);
    return false;
  }
}

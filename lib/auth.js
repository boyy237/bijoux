import crypto from "crypto";

// Secret utilisé pour signer les cookies de session.
// En production, définir SESSION_SECRET dans les variables d'environnement.
const SECRET = process.env.SESSION_SECRET || "bijoux-pro-dev-secret-change-me";

// Identifiants admin de démonstration (comme dans le projet original).
// A terme : à remplacer par une vraie table "admins" côté backend.
export const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || "admin@bijoux.pro",
  password: process.env.ADMIN_PASSWORD || "admin123",
};

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const check = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(check, "hex"));
}

function sign(payload) {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function createSessionToken(data) {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function readSessionToken(token) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  if (sign(payload) !== signature) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = "bijoux_session";

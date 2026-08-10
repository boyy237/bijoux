import { verifyToken, COOKIE_NAME } from "../utils/jwt.js";

function extractToken(req) {
  if (req.cookies?.[COOKIE_NAME]) return req.cookies[COOKIE_NAME];
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return null;
}

export function attachSession(req, res, next) {
  const token = extractToken(req);
  req.session = token ? verifyToken(token) : null;
  next();
}

export function requireClient(req, res, next) {
  if (!req.session || req.session.role !== "client") {
    return res.status(401).json({ error: "Connectez-vous à votre compte client." });
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.session || req.session.role !== "admin") {
    return res.status(403).json({ error: "Accès réservé à l'administrateur." });
  }
  next();
}

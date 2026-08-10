import jwt from "jsonwebtoken";

// Doit être identique à JWT_SECRET dans le backend, pour pouvoir lire la
// session émise par le backend sans appel réseau supplémentaire.
const SECRET = process.env.JWT_SECRET || "change-me";

// Nom de cookie utilisé par le backend (src/utils/jwt.js -> COOKIE_NAME).
export const SESSION_COOKIE = "bijoux_token";

export function readSessionToken(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

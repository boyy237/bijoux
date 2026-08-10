import { cookies } from "next/headers";
import { readSessionToken, SESSION_COOKIE } from "./auth";

// À utiliser uniquement dans des Server Components / Route Handlers.
export function getSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return readSessionToken(token);
}

export function requireAdminSession() {
  const session = getSession();
  if (!session || session.role !== "admin") return null;
  return session;
}

export function requireClientSession() {
  const session = getSession();
  if (!session || session.role !== "client") return null;
  return session;
}

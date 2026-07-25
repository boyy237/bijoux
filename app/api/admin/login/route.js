import { NextResponse } from "next/server";
import { ADMIN_CREDENTIALS, createSessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request) {
  const { email, password } = await request.json();

  if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
    return NextResponse.json({ error: "Email ou mot de passe incorrect." }, { status: 401 });
  }

  const token = createSessionToken({ role: "admin", email });
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createSessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request) {
  const { email, password } = await request.json();

  const clients = db.getAll("clients");
  const client = clients.find((c) => c.email.toLowerCase() === (email || "").toLowerCase());

  if (!client || !verifyPassword(password, client.password)) {
    return NextResponse.json({ error: "Email ou mot de passe incorrect." }, { status: 401 });
  }

  const token = createSessionToken({ role: "client", id: client.id, email: client.email, name: client.name });
  const response = NextResponse.json({
    client: { id: client.id, name: client.name, email: client.email },
  });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

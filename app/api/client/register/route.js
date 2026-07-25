import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createSessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request) {
  const { name, email, password } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères." }, { status: 400 });
  }

  const clients = db.getAll("clients");
  if (clients.some((c) => c.email.toLowerCase() === email.toLowerCase())) {
    return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
  }

  const client = db.insert("clients", {
    name,
    email,
    password: hashPassword(password),
    createdAt: new Date().toISOString(),
  });

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

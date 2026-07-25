import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  let orders = db.getAll("orders").sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (session.role === "client") {
    orders = orders.filter((o) => o.clientId === session.id);
  }
  // role === 'admin' → toutes les commandes

  return NextResponse.json({ orders });
}

export async function POST(request) {
  const session = getSession();
  if (!session || session.role !== "client") {
    return NextResponse.json({ error: "Connectez-vous à votre compte client pour commander." }, { status: 401 });
  }

  const body = await request.json();
  const { items, type, paymentMethod } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Le panier est vide." }, { status: 400 });
  }
  if (!["reservation", "achat"].includes(type)) {
    return NextResponse.json({ error: "Type de commande invalide." }, { status: 400 });
  }

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const order = db.insert("orders", {
    clientId: session.id,
    clientName: session.name,
    clientEmail: session.email,
    items,
    total,
    type, // "reservation" (à régler en boutique) ou "achat" (payé en ligne)
    paymentMethod: type === "achat" ? paymentMethod || "carte" : null,
    status: type === "achat" ? "confirmee" : "en_attente",
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ order }, { status: 201 });
}

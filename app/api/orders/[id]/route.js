import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function PUT(request, { params }) {
  const session = getSession();
  const order = db.getById("orders", params.id);
  if (!order) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });

  const body = await request.json();

  if (session?.role === "admin") {
    const updated = db.update("orders", params.id, { status: body.status });
    return NextResponse.json({ order: updated });
  }

  if (session?.role === "client" && order.clientId === session.id) {
    // Un client ne peut qu'annuler sa propre réservation en attente
    if (order.status !== "en_attente" || body.status !== "annulee") {
      return NextResponse.json({ error: "Action non autorisée." }, { status: 403 });
    }
    const updated = db.update("orders", params.id, { status: "annulee" });
    return NextResponse.json({ order: updated });
  }

  return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
}

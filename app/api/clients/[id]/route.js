import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function DELETE(request, { params }) {
  const session = getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Accès réservé à l'administrateur." }, { status: 403 });
  }

  const ok = db.remove("clients", params.id);
  if (!ok) return NextResponse.json({ error: "Client introuvable." }, { status: 404 });

  // On supprime aussi ses commandes pour rester cohérent.
  db.removeWhere("orders", (o) => String(o.clientId) === String(params.id));

  return NextResponse.json({ success: true });
}

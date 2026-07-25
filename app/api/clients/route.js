import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Accès réservé à l'administrateur." }, { status: 403 });
  }

  const clients = db.getAll("clients");
  const orders = db.getAll("orders");

  const clientsWithStats = clients.map(({ password, ...client }) => ({
    ...client,
    ordersCount: orders.filter((o) => o.clientId === client.id).length,
  }));

  return NextResponse.json({ clients: clientsWithStats, total: clients.length });
}

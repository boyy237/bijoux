import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(request, { params }) {
  const product = db.getById("products", params.id);
  if (!product) return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(request, { params }) {
  const session = getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Accès réservé à l'administrateur." }, { status: 403 });
  }

  const body = await request.json();
  const patch = {};
  ["name", "category", "subcategory", "description", "image"].forEach((key) => {
    if (body[key] !== undefined) patch[key] = body[key];
  });
  if (body.price !== undefined) patch.price = Number(body.price);
  if (body.inStock !== undefined) patch.inStock = Boolean(body.inStock);

  const product = db.update("products", params.id, patch);
  if (!product) return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
  return NextResponse.json({ product });
}

export async function DELETE(request, { params }) {
  const session = getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Accès réservé à l'administrateur." }, { status: 403 });
  }

  const ok = db.remove("products", params.id);
  if (!ok) return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
  return NextResponse.json({ success: true });
}

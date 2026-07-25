import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const subcategory = searchParams.get("subcategory");
  const search = searchParams.get("search")?.toLowerCase();

  let products = db.getAll("products");

  if (category) products = products.filter((p) => p.category === category);
  if (subcategory) products = products.filter((p) => p.subcategory === subcategory);
  if (search) {
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({ products });
}

export async function POST(request) {
  const session = getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Accès réservé à l'administrateur." }, { status: 403 });
  }

  const body = await request.json();
  const { name, category, subcategory, price, image, description, inStock } = body;

  if (!name || !category || !subcategory || price == null || !image) {
    return NextResponse.json({ error: "Champs manquants." }, { status: 400 });
  }

  const product = db.insert("products", {
    name,
    category,
    subcategory,
    price: Number(price),
    image,
    description: description || "",
    inStock: inStock !== false,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ product }, { status: 201 });
}

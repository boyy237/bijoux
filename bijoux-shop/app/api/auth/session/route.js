import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// Lu localement (JWT partagé avec le backend) : pas besoin d'un aller-retour réseau.
export async function GET() {
  const session = getSession();
  return NextResponse.json({ session });
}

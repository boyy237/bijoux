import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backendProxy";

// Route dédiée (pas de JSON) : on relaie le multipart/form-data tel quel.
export async function POST(request) {
  const cookie = request.headers.get("cookie") || "";
  const contentType = request.headers.get("content-type") || "";

  const backendRes = await fetch(`${BACKEND_URL}/api/upload`, {
    method: "POST",
    headers: { cookie, "content-type": contentType },
    body: request.body,
    duplex: "half",
  });

  const data = await backendRes.json().catch(() => ({}));
  return NextResponse.json(data, { status: backendRes.status });
}

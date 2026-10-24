import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4400";

// Relaie une requête vers le backend Express, en transmettant le cookie de

// session du navigateur, et en relayant tout Set-Cookie renvoyé par le
// backend (login/logout) vers le navigateur. Ainsi, tout le reste du
// frontend continue d'appeler ses propres routes /api/... sans changement.
export async function proxyToBackend(request, path, { method } = {}) {
  const cookie = request.headers.get("cookie") || "";
  const finalMethod = method || request.method;

  const init = { method: finalMethod, headers: { cookie } };

  if (!["GET", "HEAD"].includes(finalMethod)) {
    const text = await request.text();
    if (text) {
      init.body = text;
      init.headers["Content-Type"] = "application/json";
    }
  }

  const backendRes = await fetch(`${BACKEND_URL}${path}`, init);
  const data = await backendRes.json().catch(() => ({}));

  const response = NextResponse.json(data, { status: backendRes.status });

  const setCookie = backendRes.headers.get("set-cookie");
  if (setCookie) response.headers.set("set-cookie", setCookie);

  return response;
}

export { BACKEND_URL };

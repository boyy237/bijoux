import { cookies } from "next/headers";
import { BACKEND_URL } from "./backendProxy";
import { normalizeProduct, normalizeOrder, normalizeClient } from "./normalize";

// À utiliser uniquement dans des Server Components (pas de "use client").
// Appelle directement le backend (plus efficace qu'un aller-retour par nos
// propres routes /api/...), en transmettant le cookie de session.
async function serverFetch(path, options = {}) {
  const cookieHeader = cookies()
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: { ...options.headers, cookie: cookieHeader },
    cache: "no-store",
  });

  if (!res.ok) return { ok: false, status: res.status, data: null };
  const data = await res.json().catch(() => ({}));
  return { ok: true, status: res.status, data };
}

export async function getProducts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const { data } = await serverFetch(`/api/products${qs ? `?${qs}` : ""}`);
  return (data?.products || []).map(normalizeProduct);
}

export async function getProduct(id) {
  const { ok, data } = await serverFetch(`/api/products/${id}`);
  return ok ? normalizeProduct(data.product) : null;
}

export async function getOrders() {
  const { data } = await serverFetch("/api/orders");
  return (data?.orders || []).map(normalizeOrder);
}

export async function getClients() {
  const { data } = await serverFetch("/api/clients");
  return { clients: (data?.clients || []).map(normalizeClient), total: data?.total || 0 };
}

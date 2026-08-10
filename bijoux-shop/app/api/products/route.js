import { proxyToBackend } from "@/lib/backendProxy";

export async function GET(request) {
  const { search } = new URL(request.url);
  return proxyToBackend(request, `/api/products${search}`);
}

export async function POST(request) {
  return proxyToBackend(request, "/api/products");
}

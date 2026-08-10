import { proxyToBackend } from "@/lib/backendProxy";

export async function PUT(request, { params }) {
  return proxyToBackend(request, `/api/orders/${params.id}`);
}

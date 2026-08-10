import { proxyToBackend } from "@/lib/backendProxy";

export async function DELETE(request, { params }) {
  return proxyToBackend(request, `/api/clients/${params.id}`);
}

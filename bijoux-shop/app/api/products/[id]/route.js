import { proxyToBackend } from "@/lib/backendProxy";

export async function GET(request, { params }) {
  return proxyToBackend(request, `/api/products/${params.id}`);
}

export async function PUT(request, { params }) {
  return proxyToBackend(request, `/api/products/${params.id}`);
}

export async function DELETE(request, { params }) {
  return proxyToBackend(request, `/api/products/${params.id}`);
}

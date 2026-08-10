import { proxyToBackend } from "@/lib/backendProxy";

export async function GET(request, { params }) {
  return proxyToBackend(request, `/api/payments/cinetpay/status/${params.orderId}`);
}

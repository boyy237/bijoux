"use client";

import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";

const STATUS_LABELS = {
  en_attente: { label: "En attente", cls: "badge-gold" },
  confirmee: { label: "Confirmée", cls: "badge-success" },
  en_livraison: { label: "En livraison", cls: "badge-gold" },
  livree: { label: "Livrée", cls: "badge-success" },
  annulee: { label: "Annulée", cls: "badge-muted" },
};

export default function ClientOrdersList({ orders }) {
  const router = useRouter();

  async function handleCancel(orderId) {
    await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "annulee" }),
    });
    router.refresh();
  }

  if (orders.length === 0) {
    return <p className="empty-state">Vous n'avez pas encore de commande ou réservation.</p>;
  }

  return (
    <div className="orders-list">
      {orders.map((order) => {
        const status = STATUS_LABELS[order.status] || STATUS_LABELS.en_attente;
        return (
          <div key={order.id} className="card order-card">
            <div className="order-head">
              <div>
                <p className="order-ref">Commande #{order.id}</p>
                <p className="order-date">{new Date(order.createdAt).toLocaleDateString("fr-FR")}</p>
              </div>
              <span className={`badge ${status.cls}`}>{status.label}</span>
            </div>
            <div className="order-items">
              {order.items.map((item) => (
                <div key={item.productId} className="order-item">
                  <img src={item.image} alt={item.name} />
                  <span>{item.name} × {item.qty}</span>
                </div>
              ))}
            </div>
            {order.deliveryRequired && (
              <p className="order-delivery">
                🚚 Livraison à {order.deliveryCity} — {order.deliveryAddress}
                {order.shippingFee ? ` (frais : ${formatPrice(order.shippingFee)})` : ""}
              </p>
            )}
            <div className="order-foot">
              <p><b>{formatPrice(order.total)}</b> · {order.type === "reservation" ? "Réservation" : "Achat en ligne"}</p>
              {(order.status === "en_attente" || order.status === "confirmee") && (
                <button className="btn btn-outline btn-sm" onClick={() => handleCancel(order.id)}>
                  Annuler
                </button>
              )}
            </div>
          </div>
        );
      })}

      <style>{`
        .orders-list { display: flex; flex-direction: column; gap: 16px; }
        .order-card { padding: 18px; }
        .order-head { display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px; }
        .order-ref { font-weight: 700; }
        .order-date { font-size: 0.8rem; color: var(--muted); }
        .order-items { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
        .order-delivery { font-size: 0.8rem; color: var(--accent); margin-bottom: 10px; }
        .order-item { display: flex; align-items: center; gap: 10px; font-size: 0.88rem; }
        .order-item img { width: 40px; height: 40px; object-fit: cover; border-radius: 8px; }
        .order-foot { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 12px; }
        .btn-sm { padding: 6px 14px; font-size: 0.8rem; }
      `}</style>
    </div>
  );
}

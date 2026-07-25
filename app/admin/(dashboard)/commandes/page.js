"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";

const STATUS_OPTIONS = [
  { value: "en_attente", label: "En attente" },
  { value: "confirmee", label: "Confirmée" },
  { value: "annulee", label: "Annulée" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .finally(() => setLoading(false));
  }

  async function handleStatusChange(id, status) {
    await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <div>
      <h1 className="section-title">Commandes & réservations</h1>
      <p className="section-subtitle">{orders.length} commande(s) au total</p>

      {loading ? (
        <p className="empty-state">Chargement...</p>
      ) : orders.length === 0 ? (
        <p className="empty-state">Aucune commande pour le moment.</p>
      ) : (
        <div className="card orders-table">
          {orders.map((o) => (
            <div key={o.id} className="order-row">
              <div>
                <p className="order-ref">#{o.id} · {o.clientName}</p>
                <p className="order-meta">{o.clientEmail} · {new Date(o.createdAt).toLocaleDateString("fr-FR")}</p>
                <p className="order-items">
                  {o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
                </p>
              </div>
              <span className="badge badge-gold">{o.type === "reservation" ? "Réservation" : "Achat"}</span>
              <b>{formatPrice(o.total)}</b>
              <select value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .orders-table { padding: 8px 20px; }
        .order-row {
          display: grid; grid-template-columns: 1fr 110px 90px 150px;
          align-items: center; gap: 14px; padding: 16px 0; border-bottom: 1px solid var(--border);
        }
        .order-row:last-child { border-bottom: none; }
        .order-ref { font-weight: 700; font-size: 0.92rem; }
        .order-meta { font-size: 0.78rem; color: var(--muted); }
        .order-items { font-size: 0.8rem; color: var(--text); opacity: 0.8; margin-top: 4px; }
        .order-row select {
          padding: 8px 10px; border-radius: 8px; border: 1.5px solid var(--border); font-size: 0.82rem;
        }
        @media (max-width: 800px) {
          .order-row { grid-template-columns: 1fr; row-gap: 8px; }
        }
      `}</style>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { normalizeClient } from "@/lib/normalize";

export default function AdminClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    fetch("/api/clients")
      .then((r) => r.json())
      .then((d) => setClients((d.clients || []).map(normalizeClient)))
      .finally(() => setLoading(false));
  }

  async function handleDelete(id, name) {
    if (!confirm(`Supprimer le compte de "${name}" ? Ses commandes seront aussi supprimées.`)) return;
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="section-title">Clients</h1>
      <p className="section-subtitle">{clients.length} client(s) inscrit(s)</p>

      {loading ? (
        <p className="empty-state">Chargement...</p>
      ) : clients.length === 0 ? (
        <p className="empty-state">Aucun client inscrit pour le moment.</p>
      ) : (
        <div className="card clients-table">
          {clients.map((c) => (
            <div key={c.id} className="client-row">
              <div>
                <p className="client-name">{c.name}</p>
                <p className="client-email">{c.email}</p>
              </div>
              <span className="badge badge-gold">{c.ordersCount} commande(s)</span>
              <p className="client-date">Inscrit le {new Date(c.createdAt).toLocaleDateString("fr-FR")}</p>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id, c.name)}>
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .clients-table { padding: 8px 20px; }
        .client-row {
          display: grid; grid-template-columns: 1fr 140px 160px auto;
          align-items: center; gap: 14px; padding: 16px 0; border-bottom: 1px solid var(--border);
        }
        .client-row:last-child { border-bottom: none; }
        .client-name { font-weight: 600; }
        .client-email { font-size: 0.82rem; color: var(--muted); }
        .client-date { font-size: 0.8rem; color: var(--muted); }
        .btn-sm { padding: 6px 14px; font-size: 0.8rem; }
        @media (max-width: 760px) {
          .client-row { grid-template-columns: 1fr; row-gap: 6px; }
        }
      `}</style>
    </div>
  );
}

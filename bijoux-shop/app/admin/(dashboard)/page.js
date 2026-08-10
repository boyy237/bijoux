import Link from "next/link";
import { getClients, getOrders, getProducts } from "@/lib/serverApi";
import { formatPrice } from "@/lib/format";

export default async function AdminDashboardHome() {
  const { clients, total: clientsTotal } = await getClients();
  const orders = await getOrders();
  const products = await getProducts();

  const revenue = orders
    .filter((o) => o.status !== "annulee")
    .reduce((sum, o) => sum + o.total, 0);
  const pendingReservations = orders.filter((o) => o.status === "en_attente").length;
  const outOfStock = products.filter((p) => !p.inStock).length;

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div>
      <h1 className="section-title">Tableau de bord</h1>
      <p className="section-subtitle">Vue d'ensemble de la boutique.</p>

      <div className="stats-grid">
        <StatCard label="Clients inscrits" value={clientsTotal} href="/admin/clients" />
        <StatCard label="Commandes totales" value={orders.length} href="/admin/commandes" />
        <StatCard label="Réservations en attente" value={pendingReservations} href="/admin/commandes" />
        <StatCard label="Chiffre d'affaires" value={formatPrice(revenue)} href="/admin/commandes" />
        <StatCard label="Produits au catalogue" value={products.length} href="/admin/produits" />
        <StatCard label="Produits en rupture" value={outOfStock} href="/admin/produits" />
      </div>

      <h2 className="recent-title">Dernières commandes</h2>
      {recentOrders.length === 0 ? (
        <p className="empty-state">Aucune commande pour le moment.</p>
      ) : (
        <div className="card recent-table">
          {recentOrders.map((o) => (
            <div key={o.id} className="recent-row">
              <span>#{o.id}</span>
              <span>{o.clientName}</span>
              <span>{o.type === "reservation" ? "Réservation" : "Achat"}</span>
              <b>{formatPrice(o.total)}</b>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 24px 0 40px; }
        .recent-title { font-size: 1.15rem; font-weight: 700; margin-bottom: 14px; }
        .recent-table { padding: 8px 20px; }
        .recent-row {
          display: grid; grid-template-columns: 60px 1fr 120px 100px;
          padding: 12px 0; font-size: 0.9rem; border-bottom: 1px solid var(--border);
        }
        .recent-row:last-child { border-bottom: none; }
        @media (max-width: 700px) {
          .stats-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, href }) {
  return (
    <Link href={href} className="card stat-card">
      <p className="stat-value">{value}</p>
      <p className="stat-label">{label}</p>
      <style>{`
        .stat-card { padding: 20px; display: block; }
        .stat-value { font-size: 1.7rem; font-weight: 800; color: var(--dark); }
        .stat-label { font-size: 0.82rem; color: var(--muted); margin-top: 4px; }
      `}</style>
    </Link>
  );
}

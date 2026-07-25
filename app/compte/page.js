import { redirect } from "next/navigation";
import { requireClientSession } from "@/lib/session";
import { db } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import ClientOrdersList from "@/components/ClientOrdersList";

export default function AccountPage() {
  const session = requireClientSession();
  if (!session) redirect("/compte/connexion?redirect=/compte");

  const orders = db
    .getAll("orders")
    .filter((o) => o.clientId === session.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="container section">
      <div className="account-head">
        <div>
          <h1 className="section-title">Bonjour {session.name}</h1>
          <p className="section-subtitle">{session.email}</p>
        </div>
        <LogoutButton />
      </div>

      <h2 className="orders-title">Mes commandes et réservations</h2>
      <ClientOrdersList orders={orders} />

      <style>{`
        .account-head { display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px; }
        .orders-title { font-size: 1.2rem; font-weight: 700; margin: 32px 0 16px; color: var(--dark); }
      `}</style>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

const LINKS = [
  { href: "/admin", label: "Tableau de bord", exact: true },
  { href: "/admin/produits", label: "Produits" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/commandes", label: "Commandes" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <p className="admin-logo">Landry <span>Express</span></p>
      <nav>
        {LINKS.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link key={link.href} href={link.href} className={active ? "active" : ""}>
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-foot">
        <Link href="/">← Retour au site</Link>
        <LogoutButton className="btn btn-outline btn-block" label="Déconnexion" />
      </div>

      <style>{`
        .admin-sidebar {
          width: 220px;
          flex-shrink: 0;
          background: var(--dark);
          color: var(--light);
          min-height: 100vh;
          padding: 24px 18px;
          display: flex;
          flex-direction: column;
        }
        .admin-logo { font-weight: 800; font-size: 1.2rem; margin-bottom: 32px; }
        .admin-logo span { color: var(--primary); }
        .admin-sidebar nav { display: flex; flex-direction: column; gap: 6px; flex: 1; }
        .admin-sidebar nav a {
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 0.92rem;
          font-weight: 600;
          opacity: 0.85;
        }
        .admin-sidebar nav a:hover { background: rgba(255,255,255,0.06); }
        .admin-sidebar nav a.active {
          background: var(--primary);
          color: var(--dark);
          opacity: 1;
        }
        .sidebar-foot { display: flex; flex-direction: column; gap: 10px; margin-top: 24px; }
        .sidebar-foot > a { font-size: 0.82rem; opacity: 0.7; }
        @media (max-width: 900px) {
          .admin-sidebar { width: 100%; min-height: auto; }
          .admin-sidebar nav { flex-direction: row; flex-wrap: wrap; }
        }
      `}</style>
    </aside>
  );
}

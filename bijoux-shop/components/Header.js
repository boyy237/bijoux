import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { getSession } from "@/lib/session";
import CartBadge from "./CartBadge";
import MobileNav from "./MobileNav";

export default function Header() {
  const session = getSession();

  return (
    <header className="site-header">
      <div className="container header-row">
        <Link href="/" className="logo">
          Landry <span>Express</span>
        </Link>

        <nav className="main-nav">
          {CATEGORIES.map((cat) => (
            <Link key={cat.slug} href={`/categorie/${cat.slug}`}>
              {cat.name}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          {session?.role === "admin" && (
            <Link href="/admin" className="btn btn-dark btn-sm">
              Dashboard
            </Link>
          )}
          {session?.role === "client" && (
            <Link href="/compte" className="account-link">
              👤 {session.name?.split(" ")[0]}
            </Link>
          )}
          {!session && (
            <Link href="/compte/connexion" className="account-link">
              👤 Connexion
            </Link>
          )}
          <Link href="/panier" className="cart-link">
            🛍️ <CartBadge />
          </Link>
          <MobileNav categories={CATEGORIES} session={session} />
        </div>
      </div>

      <style>{`
        .site-header {
          background: var(--dark);
          color: var(--light);
          position: sticky;
          top: 0;
          z-index: 40;
          box-shadow: var(--shadow-sm);
        }
        .header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 68px;
          gap: 24px;
        }
        .logo {
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: 0.02em;
          color: var(--light);
          white-space: nowrap;
        }
        .logo span {
          color: var(--primary);
        }
        .main-nav {
          display: flex;
          gap: 22px;
          flex: 1;
          justify-content: center;
        }
        .main-nav a {
          font-size: 0.92rem;
          font-weight: 600;
          opacity: 0.88;
          padding: 6px 2px;
          border-bottom: 2px solid transparent;
          transition: all 0.15s ease;
        }
        .main-nav a:hover {
          opacity: 1;
          border-color: var(--primary);
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          white-space: nowrap;
        }
        .account-link, .cart-link {
          font-size: 0.9rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .btn-sm {
          padding: 8px 16px;
          font-size: 0.85rem;
        }
        @media (max-width: 860px) {
          .main-nav { display: none; }
          .account-link span { display: none; }
        }
      `}</style>
    </header>
  );
}

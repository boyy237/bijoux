import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-logo">Bijoux <span>Pro</span></p>
          <p className="footer-text">
            Bijoux, habits, sacs, montres et accessoires de luxe, sélectionnés avec exigence.
          </p>
        </div>
        <div>
          <p className="footer-title">Catégories</p>
          {CATEGORIES.map((cat) => (
            <Link key={cat.slug} href={`/categorie/${cat.slug}`}>{cat.name}</Link>
          ))}
        </div>
        <div>
          <p className="footer-title">Compte</p>
          <Link href="/compte/connexion">Mon compte</Link>
          <Link href="/panier">Panier</Link>
          <Link href="/admin/connexion">Espace administrateur</Link>
        </div>
      </div>
      <p className="footer-copy">© {new Date().getFullYear()} Bijoux Pro. Tous droits réservés.</p>

      <style>{`
        .site-footer {
          background: var(--dark);
          color: var(--light);
          margin-top: 60px;
          padding: 48px 0 24px;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 32px;
        }
        .footer-logo {
          font-size: 1.3rem;
          font-weight: 800;
          margin-bottom: 10px;
        }
        .footer-logo span { color: var(--primary); }
        .footer-text {
          opacity: 0.75;
          font-size: 0.9rem;
          max-width: 320px;
        }
        .footer-title {
          font-weight: 700;
          margin-bottom: 12px;
          color: var(--primary);
        }
        .footer-grid a {
          display: block;
          opacity: 0.85;
          font-size: 0.9rem;
          margin-bottom: 8px;
        }
        .footer-grid a:hover { opacity: 1; }
        .footer-copy {
          text-align: center;
          opacity: 0.5;
          font-size: 0.8rem;
          margin-top: 32px;
        }
        @media (max-width: 640px) {
          .footer-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </footer>
  );
}

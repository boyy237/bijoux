"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileNav({ categories, session }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="burger"
        aria-label="Ouvrir le menu"
        onClick={() => setOpen(true)}
      >
        ☰
      </button>

      {open && (
        <div className="drawer-backdrop" onClick={() => setOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setOpen(false)} aria-label="Fermer">
              ✕
            </button>
            <nav>
              {categories.map((cat) => (
                <Link key={cat.slug} href={`/categorie/${cat.slug}`} onClick={() => setOpen(false)}>
                  {cat.name}
                </Link>
              ))}
              <hr />
              {session?.role === "admin" && (
                <Link href="/admin" onClick={() => setOpen(false)}>Dashboard admin</Link>
              )}
              {session?.role === "client" && (
                <Link href="/compte" onClick={() => setOpen(false)}>Mon compte</Link>
              )}
              {!session && (
                <Link href="/compte/connexion" onClick={() => setOpen(false)}>Connexion</Link>
              )}
            </nav>
          </div>
        </div>
      )}

      <style>{`
        .burger {
          display: none;
          background: none;
          border: none;
          color: var(--light);
          font-size: 1.4rem;
        }
        .drawer-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 60;
        }
        .drawer {
          background: var(--light);
          width: 78%;
          max-width: 300px;
          height: 100%;
          padding: 24px;
          position: relative;
        }
        .drawer nav {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-top: 40px;
        }
        .drawer nav a {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--dark);
        }
        .close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          font-size: 1.3rem;
          color: var(--dark);
        }
        @media (max-width: 860px) {
          .burger { display: block; }
        }
      `}</style>
    </>
  );
}

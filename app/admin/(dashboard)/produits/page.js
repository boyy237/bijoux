"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { formatPrice } from "@/lib/format";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .finally(() => setLoading(false));
  }

  async function handleDelete(id, name) {
    if (!confirm(`Supprimer "${name}" ?`)) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    load();
  }

  const filtered = useMemo(
    () => (categoryFilter ? products.filter((p) => p.category === categoryFilter) : products),
    [products, categoryFilter]
  );

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="section-title">Produits</h1>
          <p className="section-subtitle">{products.length} produit(s) au catalogue</p>
        </div>
        <Link href="/admin/produits/nouveau" className="btn btn-primary">+ Ajouter un produit</Link>
      </div>

      <div className="filters">
        <button className={!categoryFilter ? "pill active" : "pill"} onClick={() => setCategoryFilter("")}>Toutes</button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            className={categoryFilter === cat.slug ? "pill active" : "pill"}
            onClick={() => setCategoryFilter(cat.slug)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="empty-state">Chargement...</p>
      ) : filtered.length === 0 ? (
        <p className="empty-state">Aucun produit dans cette catégorie.</p>
      ) : (
        <div className="card products-table">
          {filtered.map((p) => (
            <div key={p.id} className="product-row">
              <img src={p.image} alt={p.name} />
              <div className="row-info">
                <p className="row-name">{p.name}</p>
                <p className="row-meta">{p.category} / {p.subcategory}</p>
              </div>
              <span className={`badge ${p.inStock ? "badge-success" : "badge-danger"}`}>
                {p.inStock ? "En stock" : "Rupture"}
              </span>
              <b className="row-price">{formatPrice(p.price)}</b>
              <div className="row-actions">
                <Link href={`/admin/produits/${p.id}`} className="btn btn-outline btn-sm">Modifier</Link>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)}>Suppr.</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .page-head { display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
        .pill {
          padding: 7px 16px; border-radius: 999px; border: 1.5px solid var(--border);
          background: white; font-size: 0.82rem; font-weight: 600;
        }
        .pill.active { background: var(--dark); color: var(--light); border-color: var(--dark); }
        .products-table { padding: 8px 20px; }
        .product-row {
          display: grid; grid-template-columns: 56px 1fr 100px 90px auto;
          align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid var(--border);
        }
        .product-row:last-child { border-bottom: none; }
        .product-row img { width: 56px; height: 56px; object-fit: cover; border-radius: 8px; }
        .row-name { font-weight: 600; font-size: 0.92rem; }
        .row-meta { font-size: 0.78rem; color: var(--muted); }
        .row-actions { display: flex; gap: 8px; }
        .btn-sm { padding: 6px 12px; font-size: 0.78rem; }
        @media (max-width: 760px) {
          .product-row { grid-template-columns: 44px 1fr; row-gap: 6px; }
          .row-price, .row-actions, .badge { grid-column: 2 / 3; }
        }
      `}</style>
    </div>
  );
}

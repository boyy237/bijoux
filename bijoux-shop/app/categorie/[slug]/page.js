import Link from "next/link";
import { notFound } from "next/navigation";
import { getProducts } from "@/lib/serverApi";
import { getCategory } from "@/lib/categories";
import ProductCard from "@/components/ProductCard";

export function generateMetadata({ params }) {
  const cat = getCategory(params.slug);
  return { title: cat ? `${cat.name} - Landry express` : "Catégorie" };
}

export default async function CategoryPage({ params, searchParams }) {
  const category = getCategory(params.slug);
  if (!category) notFound();

  const activeSub = searchParams?.sub;
  const products = await getProducts({
    category: category.slug,
    ...(activeSub ? { subcategory: activeSub } : {}),
  });

  return (
    <div className="container section">
      <p className="crumb"><Link href="/">Accueil</Link> / {category.name}</p>
      <h1 className="section-title">{category.name}</h1>
      <p className="section-subtitle">{category.tagline}</p>

      <div className="filters">
        <Link href={`/categorie/${category.slug}`} className={`pill ${!activeSub ? "active" : ""}`}>
          Tout
        </Link>
        {category.subcategories.map((sub) => (
          <Link
            key={sub.slug}
            href={`/categorie/${category.slug}?sub=${sub.slug}`}
            className={`pill ${activeSub === sub.slug ? "active" : ""}`}
          >
            {sub.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="empty-state">Aucun produit dans cette sélection pour le moment.</p>
      ) : (
        <div className="grid grid-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      <style>{`
        .crumb {
          font-size: 0.85rem;
          color: var(--muted);
          margin-bottom: 12px;
        }
        .crumb a:hover { color: var(--primary-dark); }
        .filters {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin: 24px 0 32px;
        }
        .pill {
          padding: 8px 18px;
          border-radius: 999px;
          border: 1.5px solid var(--border);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text);
        }
        .pill.active {
          background: var(--dark);
          border-color: var(--dark);
          color: var(--light);
        }
      `}</style>
    </div>
  );
}

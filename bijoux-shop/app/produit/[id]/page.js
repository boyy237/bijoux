import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/serverApi";
import { getCategory, getSubcategory } from "@/lib/categories";
import { formatPrice } from "@/lib/format";
import AddToCartControls from "@/components/AddToCartControls";
import ProductCard from "@/components/ProductCard";

export async function generateMetadata({ params }) {
  const product = await getProduct(params.id);
  return { title: product ? `${product.name} - Landry express` : "Produit" };
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  const category = getCategory(product.category);
  const subcategory = getSubcategory(product.category, product.subcategory);

  const sameCategory = await getProducts({ category: product.category });
  const related = sameCategory.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="container section">
      <p className="crumb">
        <Link href="/">Accueil</Link> / <Link href={`/categorie/${product.category}`}>{category?.name}</Link> / {product.name}
      </p>

      <div className="product-detail">
        <div className="detail-image">
          <img src={product.image} alt={product.name} />
          {!product.inStock && <span className="badge badge-danger">Rupture de stock</span>}
        </div>

        <div className="detail-info">
          {subcategory && <span className="badge badge-gold">{subcategory.name}</span>}
          <h1>{product.name}</h1>
          <p className="price">{formatPrice(product.price)}</p>
          <p className="description">{product.description}</p>
          <AddToCartControls product={product} />
          <p className="note">
            « Ajouter au panier » pour continuer vos achats, « Acheter / Réserver » pour aller
            directement au panier et choisir entre réservation ou paiement en ligne.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <div className="related">
          <h2 className="section-title">Vous aimerez aussi</h2>
          <div className="grid grid-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      <style>{`
        .crumb {
          font-size: 0.85rem;
          color: var(--muted);
          margin-bottom: 24px;
        }
        .product-detail {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
        }
        .detail-image {
          position: relative;
          border-radius: var(--radius);
          overflow: hidden;
          aspect-ratio: 1/1;
          background: #eee;
        }
        .detail-image img { width: 100%; height: 100%; object-fit: cover; }
        .detail-image .badge { position: absolute; top: 16px; left: 16px; }
        .detail-info h1 {
          font-size: 1.8rem;
          margin: 14px 0 6px;
          color: var(--dark);
        }
        .price {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--primary-dark);
          margin-bottom: 16px;
        }
        .description { color: var(--text); opacity: 0.85; line-height: 1.7; }
        .note { font-size: 0.8rem; color: var(--muted); margin-top: 18px; }
        .related { margin-top: 60px; }

        @media (max-width: 860px) {
          .product-detail { grid-template-columns: 1fr; gap: 24px; }
        }
      `}</style>
    </div>
  );
}

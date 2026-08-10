import Link from "next/link";
import { formatPrice } from "@/lib/format";

export default function ProductCard({ product }) {
  return (
    <Link href={`/produit/${product.id}`} className="card product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} loading="lazy" />
        {!product.inStock && <span className="badge badge-danger stock-badge">Rupture</span>}
      </div>
      <div className="product-info">
        <p className="product-name">{product.name}</p>
        <p className="product-price">{formatPrice(product.price)}</p>
      </div>

      <style>{`
        .product-card {
          overflow: hidden;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow);
        }
        .product-image {
          position: relative;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: #eee;
        }
        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .stock-badge {
          position: absolute;
          top: 10px;
          left: 10px;
        }
        .product-info {
          padding: 14px 16px;
        }
        .product-name {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--dark);
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .product-price {
          font-weight: 700;
          color: var(--primary-dark);
        }
      `}</style>
    </Link>
  );
}

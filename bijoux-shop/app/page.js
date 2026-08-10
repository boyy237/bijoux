import Link from "next/link";
import { getProducts } from "@/lib/serverApi";
import { CATEGORIES } from "@/lib/categories";
import ProductCard from "@/components/ProductCard";

const CATEGORY_IMAGES = {
  bijoux: "/images/collier01.jpg",
  habits: "/images/ensemble01.jpg",
  sacs: "/images/sac02.jpg",
  montres: "/images/montre05.jpg",
  accessoires: "/images/8b337ef6234f2568f67ef2c0bd39a1a0.jpg",
};

export default async function HomePage() {
  const products = await getProducts();
  const featured = products.filter((p) => p.inStock).slice(0, 8);

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <p className="eyebrow">Collection permanente</p>
          <h1>L'élégance se choisit,<br />elle ne se copie pas.</h1>
          <p className="hero-text">
            Bijoux, mode, maroquinerie, montres et accessoires : une sélection resserrée,
            pensée pour durer.
          </p>
          <div className="hero-actions">
            <Link href="/categorie/bijoux" className="btn btn-primary">Découvrir les bijoux</Link>
            <a href="#categories" className="btn btn-outline">Toutes les catégories</a>
          </div>
        </div>
      </section>

      <section className="section" id="categories">
        <div className="container">
          <h2 className="section-title">Nos univers</h2>
          <p className="section-subtitle">Cinq catégories, une même exigence.</p>
          <div className="cat-grid">
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/categorie/${cat.slug}`} className="cat-card">
                <img src={CATEGORY_IMAGES[cat.slug]} alt={cat.name} />
                <div className="cat-card-overlay">
                  <p className="cat-card-name">{cat.name}</p>
                  <p className="cat-card-tagline">{cat.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Sélection du moment</h2>
          <p className="section-subtitle">Des pièces disponibles, à réserver ou acheter dès maintenant.</p>
          <div className="grid grid-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .hero {
          background: linear-gradient(135deg, var(--dark) 0%, #2a2a2a 100%);
          color: var(--light);
          padding: 90px 0 80px;
        }
        .hero-inner { max-width: 640px; }
        .eyebrow {
          color: var(--primary);
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-size: 0.8rem;
          margin-bottom: 16px;
        }
        .hero h1 {
          font-size: 2.6rem;
          line-height: 1.2;
          font-weight: 800;
          margin-bottom: 20px;
        }
        .hero-text {
          opacity: 0.8;
          font-size: 1.05rem;
          margin-bottom: 32px;
        }
        .hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }
        .hero-actions .btn-outline { border-color: var(--light); color: var(--light); }
        .hero-actions .btn-outline:hover { background: var(--light); color: var(--dark); }

        .cat-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 18px;
        }
        .cat-card {
          position: relative;
          border-radius: var(--radius);
          overflow: hidden;
          aspect-ratio: 3/4;
          box-shadow: var(--shadow-sm);
        }
        .cat-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .cat-card:hover img { transform: scale(1.06); }
        .cat-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(0deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.05) 55%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 16px;
        }
        .cat-card-name {
          color: white;
          font-weight: 800;
          font-size: 1.1rem;
        }
        .cat-card-tagline {
          color: rgba(255,255,255,0.8);
          font-size: 0.78rem;
        }

        @media (max-width: 1024px) {
          .cat-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 640px) {
          .hero { padding: 56px 0; }
          .hero h1 { font-size: 1.9rem; }
          .cat-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </>
  );
}

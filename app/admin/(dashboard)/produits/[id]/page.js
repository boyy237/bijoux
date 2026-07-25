import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ProductForm from "@/components/ProductForm";

export default function EditProductPage({ params }) {
  const product = db.getById("products", params.id);
  if (!product) notFound();

  return (
    <div>
      <h1 className="section-title">Modifier le produit</h1>
      <p className="section-subtitle">{product.name}</p>
      <ProductForm product={product} />
    </div>
  );
}

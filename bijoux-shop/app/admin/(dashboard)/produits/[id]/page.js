import { notFound } from "next/navigation";
import { getProduct } from "@/lib/serverApi";
import ProductForm from "@/components/ProductForm";

export default async function EditProductPage({ params }) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  return (
    <div>
      <h1 className="section-title">Modifier le produit</h1>
      <p className="section-subtitle">{product.name}</p>
      <ProductForm product={product} />
    </div>
  );
}

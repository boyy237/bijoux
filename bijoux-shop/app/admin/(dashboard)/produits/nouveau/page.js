import ProductForm from "@/components/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="section-title">Ajouter un produit</h1>
      <p className="section-subtitle">Importez une photo depuis votre téléphone ou votre ordinateur.</p>
      <ProductForm />
    </div>
  );
}

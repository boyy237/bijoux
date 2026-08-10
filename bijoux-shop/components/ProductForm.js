"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, getCategory } from "@/lib/categories";

export default function ProductForm({ product }) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [form, setForm] = useState({
    name: product?.name || "",
    category: product?.category || CATEGORIES[0].slug,
    subcategory: product?.subcategory || CATEGORIES[0].subcategories[0].slug,
    price: product?.price ?? "",
    description: product?.description || "",
    inStock: product?.inStock ?? true,
    image: product?.image || "",
  });
  const [preview, setPreview] = useState(product?.image || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const subcategories = useMemo(() => getCategory(form.category)?.subcategories || [], [form.category]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleCategoryChange(catSlug) {
    const cat = getCategory(catSlug);
    setForm((f) => ({ ...f, category: catSlug, subcategory: cat.subcategories[0].slug }));
  }

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de l'import de l'image.");
      update("image", data.url);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.image) {
      setError("Merci d'importer une photo du produit.");
      return;
    }
    setSaving(true);
    try {
      const endpoint = isEdit ? `/api/products/${product.id}` : "/api/products";
      const res = await fetch(endpoint, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          categorySlug: form.category,
          subcategorySlug: form.subcategory,
          price: Number(form.price),
          image: form.image,
          description: form.description,
          inStock: form.inStock,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de l'enregistrement.");
      router.push("/admin/produits");
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Supprimer définitivement "${product.name}" ?`)) return;
    await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    router.push("/admin/produits");
    router.refresh();
  }

  return (
    <form className="card product-form" onSubmit={handleSubmit}>
      <div className="image-upload">
        <label htmlFor="product-image" className="image-drop">
          {preview ? <img src={preview} alt="Aperçu" /> : <span>📷 Importer une photo</span>}
        </label>
        <input
          id="product-image"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageChange}
          hidden
        />
        {uploading && <p className="hint">Import en cours...</p>}
      </div>

      <div className="field">
        <label>Nom du produit</label>
        <input required value={form.name} onChange={(e) => update("name", e.target.value)} />
      </div>

      <div className="field-row">
        <div className="field">
          <label>Catégorie</label>
          <select value={form.category} onChange={(e) => handleCategoryChange(e.target.value)}>
            {CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Sous-catégorie</label>
          <select value={form.subcategory} onChange={(e) => update("subcategory", e.target.value)}>
            {subcategories.map((sub) => (
              <option key={sub.slug} value={sub.slug}>{sub.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label>Prix (€)</label>
        <input type="number" min="0" step="1" required value={form.price} onChange={(e) => update("price", e.target.value)} />
      </div>

      <div className="field">
        <label>Description</label>
        <textarea rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} />
      </div>

      <label className="checkbox-field">
        <input type="checkbox" checked={form.inStock} onChange={(e) => update("inStock", e.target.checked)} />
        En stock
      </label>

      {error && <p className="error-text">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
          {saving ? "Enregistrement..." : isEdit ? "Enregistrer les modifications" : "Ajouter le produit"}
        </button>
        {isEdit && (
          <button type="button" className="btn btn-danger" onClick={handleDelete}>
            Supprimer le produit
          </button>
        )}
      </div>

      <style>{`
        .product-form { padding: 28px; max-width: 560px; }
        .image-upload { margin-bottom: 20px; }
        .image-drop {
          display: flex; align-items: center; justify-content: center;
          width: 100%; height: 200px; border: 2px dashed var(--border);
          border-radius: var(--radius); cursor: pointer; overflow: hidden;
          color: var(--muted); font-weight: 600; background: #faf9f6;
        }
        .image-drop img { width: 100%; height: 100%; object-fit: cover; }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .checkbox-field { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-weight: 600; font-size: 0.9rem; }
        .form-actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .error-text { color: var(--danger); font-size: 0.85rem; margin-bottom: 14px; }
        .hint { font-size: 0.8rem; color: var(--muted); margin-top: 6px; }
        @media (max-width: 520px) {
          .field-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </form>
  );
}

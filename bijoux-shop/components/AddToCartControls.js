"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function AddToCartControls({ product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    addItem(product, qty);
    router.push("/panier");
  }

  return (
    <div className="add-to-cart">
      <div className="qty-selector">
        <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Diminuer">−</button>
        <span>{qty}</span>
        <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Augmenter">+</button>
      </div>
      <button type="button" className="btn btn-outline" onClick={handleAdd} disabled={!product.inStock}>
        {added ? "Ajouté ✓" : "Ajouter au panier"}
      </button>
      <button type="button" className="btn btn-primary" onClick={handleBuyNow} disabled={!product.inStock}>
        Acheter / Réserver
      </button>

      <style>{`
        .add-to-cart {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 24px;
        }
        .qty-selector {
          display: flex;
          align-items: center;
          border: 1.5px solid var(--border);
          border-radius: 999px;
          overflow: hidden;
        }
        .qty-selector button {
          background: none;
          border: none;
          width: 38px;
          height: 38px;
          font-size: 1.1rem;
          color: var(--dark);
        }
        .qty-selector span {
          min-width: 28px;
          text-align: center;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

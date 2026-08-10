"use client";

import { useCart } from "@/context/CartContext";

export default function CartBadge() {
  const { count } = useCart();
  if (!count) return <span>Panier</span>;
  return (
    <span>
      Panier <b className="cart-count">{count}</b>
      <style>{`
        .cart-count {
          background: var(--primary);
          color: var(--dark);
          border-radius: 999px;
          padding: 1px 7px;
          font-size: 0.75rem;
          margin-left: 4px;
        }
      `}</style>
    </span>
  );
}

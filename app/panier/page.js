"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, updateQty, removeItem, clear, total } = useCart();
  const router = useRouter();
  const [session, setSession] = useState(undefined); // undefined = loading
  const [mode, setMode] = useState(null); // 'reservation' | 'achat'
  const [paymentMethod, setPaymentMethod] = useState("carte");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => setSession(d.session))
      .catch(() => setSession(null));
  }, []);

  async function handleConfirm() {
    setError("");
    if (!session || session.role !== "client") {
      router.push("/compte/connexion?redirect=/panier");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          type: mode,
          paymentMethod: mode === "achat" ? paymentMethod : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de la commande.");
      setSuccess(data.order);
      clear();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="container section">
        <div className="card success-card">
          <p className="success-icon">✓</p>
          <h1>{success.type === "reservation" ? "Réservation confirmée" : "Achat confirmé"}</h1>
          <p>
            {success.type === "reservation"
              ? "Votre réservation a bien été enregistrée. Vous serez contacté(e) pour finaliser le retrait en boutique."
              : "Votre paiement a été enregistré. Merci pour votre achat !"}
          </p>
          <p className="ref">Référence commande : #{success.id}</p>
          <div className="success-actions">
            <Link href="/compte" className="btn btn-outline">Voir mes commandes</Link>
            <Link href="/" className="btn btn-primary">Continuer mes achats</Link>
          </div>
        </div>
        <style>{`
          .success-card { max-width: 480px; margin: 0 auto; padding: 48px 32px; text-align: center; }
          .success-icon {
            width: 56px; height: 56px; border-radius: 50%;
            background: var(--success); color: white;
            display: flex; align-items: center; justify-content: center;
            font-size: 1.6rem; margin: 0 auto 20px;
          }
          .success-card h1 { font-size: 1.4rem; margin-bottom: 12px; }
          .ref { font-size: 0.85rem; color: var(--muted); margin: 16px 0; }
          .success-actions { display: flex; gap: 12px; justify-content: center; margin-top: 20px; }
        `}</style>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container section">
        <div className="empty-state">
          <p style={{ fontSize: "2rem" }}>🛍️</p>
          <p>Votre panier est vide.</p>
          <Link href="/" className="btn btn-primary" style={{ marginTop: 16 }}>Découvrir la boutique</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <h1 className="section-title">Votre panier</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.productId} className="card cart-item">
              <img src={item.image} alt={item.name} />
              <div className="item-info">
                <p className="item-name">{item.name}</p>
                <p className="item-price">{formatPrice(item.price)}</p>
              </div>
              <div className="qty-selector">
                <button onClick={() => updateQty(item.productId, item.qty - 1)}>−</button>
                <span>{item.qty}</span>
                <button onClick={() => updateQty(item.productId, item.qty + 1)}>+</button>
              </div>
              <p className="item-total">{formatPrice(item.price * item.qty)}</p>
              <button className="remove-btn" onClick={() => removeItem(item.productId)} aria-label="Retirer">✕</button>
            </div>
          ))}
        </div>

        <div className="card cart-summary">
          <p className="summary-title">Résumé</p>
          <div className="summary-row">
            <span>Sous-total</span>
            <b>{formatPrice(total)}</b>
          </div>

          {session === null && (
            <p className="hint">Connectez-vous à votre compte client pour finaliser la commande.</p>
          )}

          {!mode ? (
            <div className="mode-buttons">
              <button className="btn btn-outline btn-block" onClick={() => setMode("reservation")}>
                Réserver (paiement en boutique)
              </button>
              <button className="btn btn-primary btn-block" onClick={() => setMode("achat")}>
                Acheter maintenant
              </button>
            </div>
          ) : (
            <div className="checkout-panel">
              {mode === "achat" && (
                <div className="field">
                  <label>Méthode de paiement</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="carte">Carte bancaire</option>
                    <option value="paypal">PayPal</option>
                    <option value="virement">Virement bancaire</option>
                  </select>
                </div>
              )}
              {error && <p className="error-text">{error}</p>}
              <button className="btn btn-primary btn-block" onClick={handleConfirm} disabled={loading}>
                {loading ? "Traitement..." : mode === "achat" ? "Confirmer et payer" : "Confirmer la réservation"}
              </button>
              <button className="btn-link" onClick={() => setMode(null)}>← Changer d'option</button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .cart-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 32px;
          align-items: start;
          margin-top: 24px;
        }
        .cart-items { display: flex; flex-direction: column; gap: 14px; }
        .cart-item {
          display: grid;
          grid-template-columns: 70px 1fr auto auto auto;
          align-items: center;
          gap: 16px;
          padding: 14px;
        }
        .cart-item img { width: 70px; height: 70px; object-fit: cover; border-radius: 10px; }
        .item-name { font-weight: 600; }
        .item-price { color: var(--muted); font-size: 0.85rem; }
        .qty-selector {
          display: flex; align-items: center; border: 1.5px solid var(--border);
          border-radius: 999px; overflow: hidden;
        }
        .qty-selector button { background: none; border: none; width: 32px; height: 32px; }
        .qty-selector span { min-width: 24px; text-align: center; font-weight: 600; }
        .item-total { font-weight: 700; color: var(--dark); }
        .remove-btn { background: none; border: none; color: var(--danger); font-size: 1.1rem; }

        .cart-summary { padding: 24px; position: sticky; top: 90px; }
        .summary-title { font-weight: 700; margin-bottom: 16px; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 1.05rem; }
        .hint { font-size: 0.8rem; color: var(--muted); margin-bottom: 14px; }
        .mode-buttons { display: flex; flex-direction: column; gap: 10px; }
        .checkout-panel { display: flex; flex-direction: column; gap: 10px; }
        .btn-link { background: none; border: none; color: var(--muted); font-size: 0.85rem; text-decoration: underline; }
        .error-text { color: var(--danger); font-size: 0.85rem; }

        @media (max-width: 860px) {
          .cart-layout { grid-template-columns: 1fr; }
          .cart-item { grid-template-columns: 56px 1fr auto; }
          .qty-selector, .item-total { grid-column: 2 / 3; }
        }
      `}</style>
    </div>
  );
}

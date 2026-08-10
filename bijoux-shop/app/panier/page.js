"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import { normalizeOrder } from "@/lib/normalize";

export default function CartPage() {
  const { items, updateQty, removeItem, clear, total } = useCart();
  const router = useRouter();
  const [session, setSession] = useState(undefined); // undefined = chargement
  const [mode, setMode] = useState(null); // 'reservation' | 'achat'
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [deliveryRequired, setDeliveryRequired] = useState(false);
  const [zones, setZones] = useState([]);
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [shippingFee, setShippingFee] = useState(null);
  const [shippingError, setShippingError] = useState("");
  const [quoting, setQuoting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => setSession(d.session))
      .catch(() => setSession(null));
    fetch("/api/shipping/zones")
      .then((r) => r.json())
      .then((d) => setZones(d.zones || []));
  }, []);

  useEffect(() => {
    if (!deliveryRequired || !deliveryCity) {
      setShippingFee(null);
      return;
    }
    setQuoting(true);
    setShippingError("");
    fetch("/api/shipping/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city: deliveryCity, itemCount }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setShippingError(d.error);
          setShippingFee(null);
        } else {
          setShippingFee(d.fee);
        }
      })
      .finally(() => setQuoting(false));
  }, [deliveryRequired, deliveryCity, itemCount]);

  async function handleConfirm() {
    setError("");
    if (!session || session.role !== "client") {
      router.push("/compte/connexion?redirect=/panier");
      return;
    }
    if (deliveryRequired && (!deliveryCity || !deliveryAddress)) {
      setError("Merci d'indiquer la ville et l'adresse de livraison.");
      return;
    }
    if (deliveryRequired && shippingError) {
      setError(shippingError);
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
          deliveryRequired,
          deliveryCity: deliveryRequired ? deliveryCity : undefined,
          deliveryAddress: deliveryRequired ? deliveryAddress : undefined,
          paymentMethod: mode === "achat" ? paymentMethod : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de la commande.");

      if (data.paymentUrl) {
        // Redirection vers CinetPay (Mobile Money / carte) pour finaliser le paiement.
        clear();
        window.location.href = data.paymentUrl;
        return;
      }

      setSuccess(normalizeOrder(data.order));
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
              ? "Votre réservation a bien été enregistrée."
              : success.paymentMethod === "cash"
              ? "Votre commande est enregistrée, à régler à la livraison."
              : "Votre commande a été enregistrée."}
            {success.deliveryRequired
              ? ` Livraison prévue à ${success.deliveryCity} (frais : ${formatPrice(success.shippingFee)}).`
              : " Retrait en boutique à Yaoundé."}
          </p>
          <p className="ref">Référence commande : #{success.id} · Total : {formatPrice(success.total)}</p>
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

  const grandTotal = total + (deliveryRequired && shippingFee ? shippingFee : 0);

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

          <div className="card delivery-card">
            <p className="summary-title">Livraison</p>
            <div className="delivery-toggle">
              <button
                type="button"
                className={!deliveryRequired ? "toggle-btn active" : "toggle-btn"}
                onClick={() => setDeliveryRequired(false)}
              >
                Retrait en boutique (Yaoundé)
              </button>
              <button
                type="button"
                className={deliveryRequired ? "toggle-btn active" : "toggle-btn"}
                onClick={() => setDeliveryRequired(true)}
              >
                Livraison à domicile
              </button>
            </div>

            {deliveryRequired && (
              <div className="delivery-fields">
                <div className="field">
                  <label>Ville</label>
                  <select value={deliveryCity} onChange={(e) => setDeliveryCity(e.target.value)}>
                    <option value="">Sélectionner une ville</option>
                    {zones.map((z) => (
                      <option key={z.city} value={z.city}>{z.city}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Adresse précise</label>
                  <input
                    placeholder="Quartier, repère..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                </div>
                {quoting && <p className="hint">Calcul des frais de livraison...</p>}
                {shippingError && <p className="error-text">{shippingError}</p>}
                {shippingFee != null && !quoting && (
                  <p className="shipping-quote">Frais de livraison estimés : <b>{formatPrice(shippingFee)}</b></p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="card cart-summary">
          <p className="summary-title">Résumé</p>
          <div className="summary-row">
            <span>Sous-total</span>
            <span>{formatPrice(total)}</span>
          </div>
          {deliveryRequired && (
            <div className="summary-row">
              <span>Livraison</span>
              <span>{shippingFee != null ? formatPrice(shippingFee) : "—"}</span>
            </div>
          )}
          <div className="summary-row total-row">
            <span>Total</span>
            <b>{formatPrice(grandTotal)}</b>
          </div>

          {session === null && (
            <p className="hint">Connectez-vous à votre compte client pour finaliser la commande.</p>
          )}

          {!mode ? (
            <div className="mode-buttons">
              <button className="btn btn-outline btn-block" onClick={() => setMode("reservation")}>
                Réserver (paiement en boutique/livraison)
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
                    <option value="cash">Paiement à la livraison / en boutique</option>
                    <option value="cinetpay">Mobile Money / Carte (CinetPay)</option>
                  </select>
                </div>
              )}
              {error && <p className="error-text">{error}</p>}
              <button className="btn btn-primary btn-block" onClick={handleConfirm} disabled={loading}>
                {loading ? "Traitement..." : mode === "achat" ? "Confirmer la commande" : "Confirmer la réservation"}
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

        .delivery-card { padding: 20px; }
        .delivery-toggle { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
        .toggle-btn {
          flex: 1; min-width: 180px; padding: 10px 14px; border-radius: 10px;
          border: 1.5px solid var(--border); background: white; font-size: 0.85rem; font-weight: 600;
        }
        .toggle-btn.active { background: var(--dark); color: var(--light); border-color: var(--dark); }
        .delivery-fields { display: flex; flex-direction: column; gap: 4px; }
        .shipping-quote { font-size: 0.88rem; color: var(--success); margin-top: 4px; }

        .cart-summary { padding: 24px; position: sticky; top: 90px; }
        .summary-title { font-weight: 700; margin-bottom: 16px; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.95rem; color: var(--muted); }
        .total-row { border-top: 1px solid var(--border); padding-top: 12px; margin-top: 4px; margin-bottom: 20px; font-size: 1.05rem; color: var(--dark); }
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

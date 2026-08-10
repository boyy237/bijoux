"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const LABELS = {
  paye: { title: "Paiement confirmé ✓", text: "Merci ! Ton paiement a bien été reçu.", tone: "success" },
  non_paye: { title: "Paiement en attente", text: "Nous attendons la confirmation de ton paiement.", tone: "pending" },
  en_cours: { title: "Paiement en cours de vérification", text: "Cela peut prendre quelques instants...", tone: "pending" },
  echoue: { title: "Paiement échoué", text: "Le paiement n'a pas abouti. Tu peux réessayer depuis ton panier.", tone: "error" },
};

export default function ConfirmationPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmationContent />
    </Suspense>
  );
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [status, setStatus] = useState(null);
  const [tries, setTries] = useState(0);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;

    async function poll() {
      const res = await fetch(`/api/payments/cinetpay/status/${orderId}`);
      const data = await res.json();
      if (cancelled) return;
      setStatus(data.payment_status);
      // Si toujours en cours, on retente quelques fois (le webhook peut avoir un peu de retard).
      if (data.payment_status === "en_cours" && tries < 5) {
        setTimeout(() => setTries((t) => t + 1), 2500);
      }
    }
    poll();
    return () => {
      cancelled = true;
    };
  }, [orderId, tries]);

  if (!orderId) {
    return (
      <div className="container section">
        <p className="empty-state">Aucune commande à afficher.</p>
      </div>
    );
  }

  const info = LABELS[status] || { title: "Vérification du paiement...", text: "Un instant.", tone: "pending" };

  return (
    <div className="container section">
      <div className={`card confirm-card tone-${info.tone}`}>
        <h1>{info.title}</h1>
        <p>{info.text}</p>
        <p className="ref">Commande #{orderId}</p>
        <div className="actions">
          <Link href="/compte" className="btn btn-outline">Voir mes commandes</Link>
          <Link href="/" className="btn btn-primary">Retour à la boutique</Link>
        </div>
      </div>

      <style>{`
        .confirm-card { max-width: 480px; margin: 0 auto; padding: 40px 32px; text-align: center; }
        .confirm-card h1 { font-size: 1.3rem; margin-bottom: 10px; }
        .confirm-card p { color: var(--muted); }
        .ref { margin: 14px 0; font-size: 0.85rem; }
        .actions { display: flex; gap: 12px; justify-content: center; margin-top: 20px; }
        .tone-success h1 { color: var(--success); }
        .tone-error h1 { color: var(--danger); }
      `}</style>
    </div>
  );
}

"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ClientAuthPage() {
  return (
    <Suspense fallback={null}>
      <ClientAuthForm />
    </Suspense>
  );
}

function ClientAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/compte";

  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = tab === "login" ? "/api/client/login" : "/api/client/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");
      router.push(redirect);
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container section auth-section">
      <div className="card auth-card">
        <div className="tabs">
          <button className={tab === "login" ? "active" : ""} onClick={() => setTab("login")}>
            Connexion
          </button>
          <button className={tab === "register" ? "active" : ""} onClick={() => setTab("register")}>
            Créer un compte
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {tab === "register" && (
            <div className="field">
              <label>Nom complet</label>
              <input required value={form.name} onChange={(e) => update("name", e.target.value)} />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
          </div>
          <div className="field">
            <label>Mot de passe</label>
            <input
              type="password"
              required
              minLength={tab === "register" ? 6 : undefined}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Chargement..." : tab === "login" ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>

        <p className="admin-link">
          Vous êtes Nouveau ? Créer un compte
          </p>

        

      <style>{`
        .auth-section { display: flex; justify-content: center; }
        .auth-card { width: 100%; max-width: 420px; padding: 32px; }
        .tabs { display: flex; border-bottom: 1px solid var(--border); margin-bottom: 24px; }
        .tabs button {
          flex: 1; padding: 12px; background: none; border: none;
          font-weight: 600; color: var(--muted); border-bottom: 2px solid transparent;
        }
        .tabs button.active { color: var(--dark); border-color: var(--primary); }
        .error-text { color: var(--danger); font-size: 0.85rem; margin-bottom: 14px; }
        .admin-link { text-align: center; font-size: 0.82rem; color: var(--muted); margin-top: 20px; }
        .admin-link a { color: var(--accent); font-weight: 600; }
      `}</style>
    </div>
  );
}

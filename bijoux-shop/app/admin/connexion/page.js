"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Connexion refusée.");
      router.push("/admin");
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
        <p className="admin-eyebrow">Espace administrateur</p>
        <h1>Connexion au dashboard</h1>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="field">
            <label>Mot de passe</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-dark btn-block" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        <p className="back-link"><Link href="/">← Retour au site</Link></p>
      </div>

      <style>{`
        .auth-section { display: flex; justify-content: center; }
        .auth-card { width: 100%; max-width: 400px; padding: 32px; }
        .admin-eyebrow { color: var(--primary-dark); font-weight: 700; font-size: 0.78rem; text-transform: uppercase; margin-bottom: 6px; }
        .auth-card h1 { font-size: 1.3rem; margin-bottom: 20px; }
        .error-text { color: var(--danger); font-size: 0.85rem; margin-bottom: 14px; }
        .back-link { text-align: center; margin-top: 18px; font-size: 0.85rem; color: var(--muted); }
      `}</style>
    </div>
  );
}

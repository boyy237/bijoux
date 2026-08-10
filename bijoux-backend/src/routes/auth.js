import { Router } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db/pool.js";
import { signToken, COOKIE_NAME, cookieOptions } from "../utils/jwt.js";

const router = Router();

// ---- Admin ----
router.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;
  const { rows } = await pool.query("SELECT * FROM admins WHERE email = $1", [email]);
  const admin = rows[0];

  if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
    return res.status(401).json({ error: "Email ou mot de passe incorrect." });
  }

  const token = signToken({ role: "admin", id: admin.id, email: admin.email });
  res.cookie(COOKIE_NAME, token, cookieOptions);
  res.json({ success: true });
});

// ---- Client ----
router.post("/client/register", async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères." });
  }

  const { rows: existing } = await pool.query("SELECT id FROM clients WHERE email = $1", [email]);
  if (existing.length > 0) {
    return res.status(409).json({ error: "Un compte existe déjà avec cet email." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `INSERT INTO clients (name, email, password_hash, phone) VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, phone, created_at`,
    [name, email, passwordHash, phone || null]
  );
  const client = rows[0];

  const token = signToken({ role: "client", id: client.id, name: client.name, email: client.email });
  res.cookie(COOKIE_NAME, token, cookieOptions);
  res.status(201).json({ client });
});

router.post("/client/login", async (req, res) => {
  const { email, password } = req.body;
  const { rows } = await pool.query("SELECT * FROM clients WHERE email = $1", [email]);
  const client = rows[0];

  if (!client || !(await bcrypt.compare(password, client.password_hash))) {
    return res.status(401).json({ error: "Email ou mot de passe incorrect." });
  }

  const token = signToken({ role: "client", id: client.id, name: client.name, email: client.email });
  res.cookie(COOKIE_NAME, token, cookieOptions);
  res.json({ client: { id: client.id, name: client.name, email: client.email, phone: client.phone } });
});

router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.json({ success: true });
});

router.get("/session", (req, res) => {
  res.json({ session: req.session });
});

export default router;

import { Router } from "express";
import { pool } from "../db/pool.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAdmin, async (req, res) => {
  const { rows } = await pool.query(`
    SELECT c.id, c.name, c.email, c.phone, c.created_at,
           COUNT(o.id) AS orders_count
    FROM clients c
    LEFT JOIN orders o ON o.client_id = c.id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `);
  res.json({ clients: rows, total: rows.length });
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const { rowCount } = await pool.query("DELETE FROM clients WHERE id = $1", [req.params.id]);
  if (!rowCount) return res.status(404).json({ error: "Client introuvable." });
  res.json({ success: true }); // ON DELETE CASCADE supprime aussi ses commandes
});

export default router;

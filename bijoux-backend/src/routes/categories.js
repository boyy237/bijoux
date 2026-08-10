import { Router } from "express";
import { pool } from "../db/pool.js";

const router = Router();

router.get("/", async (req, res) => {
  const { rows: categories } = await pool.query("SELECT * FROM categories ORDER BY id ASC");
  const { rows: subcategories } = await pool.query("SELECT * FROM subcategories ORDER BY id ASC");

  const result = categories.map((cat) => ({
    ...cat,
    subcategories: subcategories.filter((s) => s.category_id === cat.id),
  }));

  res.json({ categories: result });
});

export default router;

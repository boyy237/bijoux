import { Router } from "express";
import { pool } from "../db/pool.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

const PRODUCT_SELECT = `
  SELECT p.*, c.slug AS category_slug, c.name AS category_name,
         s.slug AS subcategory_slug, s.name AS subcategory_name
  FROM products p
  JOIN categories c ON c.id = p.category_id
  JOIN subcategories s ON s.id = p.subcategory_id
`;

router.get("/", async (req, res) => {
  const { category, subcategory, search } = req.query;
  const conditions = [];
  const params = [];

  if (category) {
    params.push(category);
    conditions.push(`c.slug = $${params.length}`);
  }
  if (subcategory) {
    params.push(subcategory);
    conditions.push(`s.slug = $${params.length}`);
  }
  if (search) {
    params.push(`%${search.toLowerCase()}%`);
    conditions.push(`(LOWER(p.name) LIKE $${params.length} OR LOWER(p.description) LIKE $${params.length})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await pool.query(`${PRODUCT_SELECT} ${where} ORDER BY p.created_at DESC`, params);
  res.json({ products: rows });
});

router.get("/:id", async (req, res) => {
  const { rows } = await pool.query(`${PRODUCT_SELECT} WHERE p.id = $1`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "Produit introuvable." });
  res.json({ product: rows[0] });
});

router.post("/", requireAdmin, async (req, res) => {
  const { name, categorySlug, subcategorySlug, price, image, description, inStock } = req.body;
  if (!name || !categorySlug || !subcategorySlug || price == null || !image) {
    return res.status(400).json({ error: "Champs manquants." });
  }

  const { rows: catRows } = await pool.query("SELECT id FROM categories WHERE slug = $1", [categorySlug]);
  if (!catRows[0]) return res.status(400).json({ error: "Catégorie invalide." });

  const { rows: subRows } = await pool.query(
    "SELECT id FROM subcategories WHERE category_id = $1 AND slug = $2",
    [catRows[0].id, subcategorySlug]
  );
  if (!subRows[0]) return res.status(400).json({ error: "Sous-catégorie invalide." });

  const { rows } = await pool.query(
    `INSERT INTO products (name, category_id, subcategory_id, price, image, description, in_stock)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [name, catRows[0].id, subRows[0].id, price, image, description || "", inStock !== false]
  );

  const { rows: full } = await pool.query(`${PRODUCT_SELECT} WHERE p.id = $1`, [rows[0].id]);
  res.status(201).json({ product: full[0] });
});

router.put("/:id", requireAdmin, async (req, res) => {
  const { name, categorySlug, subcategorySlug, price, image, description, inStock } = req.body;

  let categoryId, subcategoryId;
  if (categorySlug) {
    const { rows } = await pool.query("SELECT id FROM categories WHERE slug = $1", [categorySlug]);
    if (!rows[0]) return res.status(400).json({ error: "Catégorie invalide." });
    categoryId = rows[0].id;

    if (subcategorySlug) {
      const { rows: subRows } = await pool.query(
        "SELECT id FROM subcategories WHERE category_id = $1 AND slug = $2",
        [categoryId, subcategorySlug]
      );
      if (!subRows[0]) return res.status(400).json({ error: "Sous-catégorie invalide." });
      subcategoryId = subRows[0].id;
    }
  }

  const { rows } = await pool.query(
    `UPDATE products SET
      name = COALESCE($1, name),
      category_id = COALESCE($2, category_id),
      subcategory_id = COALESCE($3, subcategory_id),
      price = COALESCE($4, price),
      image = COALESCE($5, image),
      description = COALESCE($6, description),
      in_stock = COALESCE($7, in_stock)
     WHERE id = $8 RETURNING id`,
    [name, categoryId, subcategoryId, price, image, description, inStock, req.params.id]
  );

  if (!rows[0]) return res.status(404).json({ error: "Produit introuvable." });
  const { rows: full } = await pool.query(`${PRODUCT_SELECT} WHERE p.id = $1`, [rows[0].id]);
  res.json({ product: full[0] });
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const { rowCount } = await pool.query("DELETE FROM products WHERE id = $1", [req.params.id]);
  if (!rowCount) return res.status(404).json({ error: "Produit introuvable." });
  res.json({ success: true });
});

export default router;

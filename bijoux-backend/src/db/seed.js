import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { pool } from "./pool.js";

dotenv.config();

const CATEGORIES = [
  {
    slug: "bijoux", name: "Bijoux", tagline: "Or, argent, pierres précieuses",
    subcategories: [
      { slug: "bague", name: "Bagues" },
      { slug: "boucles-oreilles", name: "Boucles d'oreilles" },
      { slug: "collier", name: "Colliers" },
      { slug: "chaine", name: "Chaînes" },
    ],
  },
  {
    slug: "habits", name: "Habits", tagline: "Prêt-à-porter et pièces d'exception",
    subcategories: [
      { slug: "haut", name: "Hauts" },
      { slug: "ensemble", name: "Ensembles" },
      { slug: "pantalon", name: "Pantalons" },
      { slug: "veste", name: "Vestes" },
      { slug: "chaussures", name: "Chaussures" },
    ],
  },
  {
    slug: "sacs", name: "Sacs", tagline: "Du quotidien au voyage",
    subcategories: [
      { slug: "sac-main", name: "Sacs à main" },
      { slug: "sac-luxe", name: "Sacs de luxe" },
      { slug: "sac-ecole", name: "Sacs d'école" },
      { slug: "sac-voyage", name: "Sacs de voyage" },
    ],
  },
  {
    slug: "montres", name: "Montres", tagline: "Précision et prestige",
    subcategories: [
      { slug: "montre-homme", name: "Montres homme" },
      { slug: "montre-femme", name: "Montres femme" },
      { slug: "montre-luxe", name: "Montres de luxe" },
      { slug: "montre-connectee", name: "Montres connectées" },
    ],
  },
  {
    slug: "accessoires", name: "Accessoires", tagline: "Les détails qui font la différence",
    subcategories: [
      { slug: "ceinture", name: "Ceintures" },
      { slug: "lunettes", name: "Lunettes" },
      { slug: "echarpe", name: "Écharpes" },
      { slug: "casquette", name: "Casquettes" },
    ],
  },
];

// Distances routières approximatives depuis Yaoundé (siège de Landry Express).
// Modifiable ensuite via l'API /api/admin/shipping-zones.
const SHIPPING_ZONES = [
  { city: "Yaoundé", distance_km: 0 },
  { city: "Douala", distance_km: 250 },
  { city: "Bafoussam", distance_km: 290 },
  { city: "Bamenda", distance_km: 366 },
  { city: "Buea", distance_km: 280 },
  { city: "Limbe", distance_km: 300 },
  { city: "Kribi", distance_km: 150 },
  { city: "Ebolowa", distance_km: 90 },
  { city: "Bertoua", distance_km: 340 },
  { city: "Ngaoundéré", distance_km: 620 },
  { city: "Garoua", distance_km: 850 },
  { city: "Maroua", distance_km: 950 },
];

const PRODUCTS = [
  { name: "Collier Éternel", category: "bijoux", subcategory: "collier", price: 285000, image: "/images/collier01.jpg", description: "Collier en or blanc serti d'un diamant central, pour les grandes occasions." },
  { name: "Collier Saphir Royal", category: "bijoux", subcategory: "collier", price: 420000, image: "/images/collier03.jpg", description: "Collier en or blanc et saphir, pièce d'exception fait main." },
  { name: "Collier Perle Fine", category: "bijoux", subcategory: "collier", price: 130000, image: "/images/collier05.jpg", description: "Collier fin orné de perles naturelles, élégance discrète au quotidien." },
  { name: "Bague Lumière", category: "bijoux", subcategory: "bague", price: 260000, image: "/images/bargue01.jpg", description: "Bague en or rose sertie d'un saphir bleuté." },
  { name: "Bague Fiançailles Or", category: "bijoux", subcategory: "bague", price: 590000, image: "/images/bargue03.jpg", description: "Bague de fiançailles en or blanc et diamant." },
  { name: "Bague Solitaire", category: "bijoux", subcategory: "bague", price: 355000, image: "/images/bargue05.jpg", description: "Bague solitaire classique, monture en or jaune 18 carats." },
  { name: "Boucles d'oreilles Diamant", category: "bijoux", subcategory: "boucles-oreilles", price: 220000, image: "/images/bourcle01.jpg", description: "Boucles d'oreilles en or blanc serties de diamants." },
  { name: "Boucles d'oreilles Perle", category: "bijoux", subcategory: "boucles-oreilles", price: 115000, image: "/images/boucle06.jpg", description: "Boucles d'oreilles élégantes ornées de perles fines." },
  { name: "Chaîne Maille Or", category: "bijoux", subcategory: "chaine", price: 190000, image: "/images/collier02.jpg", description: "Chaîne en or jaune, maille serrée." },
  { name: "Chaîne Argent Massif", category: "bijoux", subcategory: "chaine", price: 80000, image: "/images/collier06.jpg", description: "Chaîne épaisse en argent massif." },
  { name: "Ensemble Soirée Doré", category: "habits", subcategory: "ensemble", price: 85000, image: "/images/ensemble01.jpg", description: "Ensemble deux pièces pour soirées élégantes." },
  { name: "Top Satin Ivoire", category: "habits", subcategory: "haut", price: 25000, image: "/images/bargue07.jpg", description: "Top en satin, coupe fluide." },
  { name: "Pantalon Tailleur Noir", category: "habits", subcategory: "pantalon", price: 29000, image: "/images/bargue08.jpg", description: "Pantalon coupe droite, tissu structuré." },
  { name: "Veste Cuir Élégance", category: "habits", subcategory: "veste", price: 63000, image: "/images/bargue09.jpg", description: "Veste en cuir véritable, coupe ajustée." },
  { name: "Escarpins Talon Fin", category: "habits", subcategory: "chaussures", price: 41000, image: "/images/bourcle04.jpg", description: "Escarpins en cuir, talon fin." },
  { name: "Sac à Main Signature", category: "sacs", subcategory: "sac-main", price: 118000, image: "/images/sac01.jpg", description: "Sac à main en cuir grainé, fermoir doré." },
  { name: "Sac Luxe Édition Limitée", category: "sacs", subcategory: "sac-luxe", price: 315000, image: "/images/sac02.jpg", description: "Sac de luxe en cuir pleine fleur, série limitée." },
  { name: "Sac d'École Premium", category: "sacs", subcategory: "sac-ecole", price: 20000, image: "/images/sac03.jpg", description: "Sac d'école robuste et spacieux." },
  { name: "Sac de Voyage Cuir", category: "sacs", subcategory: "sac-voyage", price: 74000, image: "/images/96a821ff1f6e6e6557ab2f33c297feae.jpg", description: "Sac de voyage en cuir souple, grande contenance." },
  { name: "Montre Luxe Bijou", category: "montres", subcategory: "montre-luxe", price: 760000, image: "/images/montre05.jpg", description: "Montre de luxe en or jaune, bracelet serti.", inStock: false },
  { name: "Montre Homme Classique", category: "montres", subcategory: "montre-homme", price: 170000, image: "/images/montre01.jpg", description: "Montre homme cadran noir, bracelet acier." },
  { name: "Montre Femme Élégance", category: "montres", subcategory: "montre-femme", price: 190000, image: "/images/montre02.jpg", description: "Montre femme fine, bracelet doré." },
  { name: "Montre Connectée Prestige", category: "montres", subcategory: "montre-connectee", price: 90000, image: "/images/montre06.jpg", description: "Montre connectée au design premium." },
  { name: "Ceinture Cuir Boucle Or", category: "accessoires", subcategory: "ceinture", price: 25000, image: "/images/montr04.jpg", description: "Ceinture en cuir véritable, boucle plaquée or." },
  { name: "Lunettes Soleil Prestige", category: "accessoires", subcategory: "lunettes", price: 34000, image: "/images/8b337ef6234f2568f67ef2c0bd39a1a0.jpg", description: "Lunettes de soleil monture acétate." },
  { name: "Écharpe Soie Imprimée", category: "accessoires", subcategory: "echarpe", price: 18000, image: "/images/montre07.jpg", description: "Écharpe en soie naturelle, imprimé exclusif." },
  { name: "Pendentif Cœur", category: "bijoux", subcategory: "collier", price: 115000, image: "/images/bourcle05.jpg", description: "Pendentif cœur en or blanc et rubis." },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Admin
    const adminEmail = process.env.ADMIN_EMAIL || "admin@bijoux.pro";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminHash = await bcrypt.hash(adminPassword, 10);
    await client.query(
      `INSERT INTO admins (email, password_hash) VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [adminEmail, adminHash]
    );

    // Catégories + sous-catégories
    const subcategoryIds = {}; // "cat-slug:sub-slug" -> id
    const categoryIds = {};
    for (const cat of CATEGORIES) {
      const res = await client.query(
        `INSERT INTO categories (slug, name, tagline) VALUES ($1, $2, $3)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, tagline = EXCLUDED.tagline
         RETURNING id`,
        [cat.slug, cat.name, cat.tagline]
      );
      categoryIds[cat.slug] = res.rows[0].id;

      for (const sub of cat.subcategories) {
        const subRes = await client.query(
          `INSERT INTO subcategories (category_id, slug, name) VALUES ($1, $2, $3)
           ON CONFLICT (category_id, slug) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [categoryIds[cat.slug], sub.slug, sub.name]
        );
        subcategoryIds[`${cat.slug}:${sub.slug}`] = subRes.rows[0].id;
      }
    }

    // Zones de livraison
    for (const zone of SHIPPING_ZONES) {
      await client.query(
        `INSERT INTO shipping_zones (city, distance_km) VALUES ($1, $2)
         ON CONFLICT (city) DO UPDATE SET distance_km = EXCLUDED.distance_km`,
        [zone.city, zone.distance_km]
      );
    }

    // Produits (uniquement si le catalogue est vide, pour ne pas dupliquer)
    const { rows: existing } = await client.query("SELECT COUNT(*) FROM products");
    if (Number(existing[0].count) === 0) {
      for (const p of PRODUCTS) {
        await client.query(
          `INSERT INTO products (name, category_id, subcategory_id, price, image, description, in_stock)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            p.name,
            categoryIds[p.category],
            subcategoryIds[`${p.category}:${p.subcategory}`],
            p.price,
            p.image,
            p.description,
            p.inStock !== false,
          ]
        );
      }
      console.log(`✓ ${PRODUCTS.length} produits insérés.`);
    } else {
      console.log("→ Produits déjà présents, catalogue non modifié.");
    }

    await client.query("COMMIT");
    console.log("✓ Seed terminé : catégories, zones de livraison, admin et produits prêts.");
    console.log(`  Admin : ${adminEmail} / ${adminPassword}`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error("Erreur de seed:", err);
  process.exit(1);
});

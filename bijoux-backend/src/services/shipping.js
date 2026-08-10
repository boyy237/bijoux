import { pool } from "../db/pool.js";

// Calcule les frais de livraison : (frais de base) + (distance en km x tarif/km)
// + (nombre d'articles x tarif/article). Les tarifs sont réglables par l'admin
// dans la table shipping_settings.
export async function calculateShippingFee({ city, itemCount }) {
  const { rows: settingsRows } = await pool.query("SELECT * FROM shipping_settings WHERE id = 1");
  const settings = settingsRows[0];

  const { rows: zoneRows } = await pool.query(
    "SELECT * FROM shipping_zones WHERE LOWER(city) = LOWER($1)",
    [city]
  );

  if (zoneRows.length === 0) {
    return {
      fee: null,
      error: "Ville non desservie pour le moment. Contactez la boutique pour un devis de livraison.",
    };
  }

  const distanceKm = Number(zoneRows[0].distance_km);
  const fee =
    Number(settings.base_fee) +
    distanceKm * Number(settings.price_per_km) +
    itemCount * Number(settings.price_per_item);

  return { fee: Math.round(fee), distanceKm };
}

export async function listShippingZones() {
  const { rows } = await pool.query("SELECT * FROM shipping_zones ORDER BY city ASC");
  return rows;
}

export async function upsertShippingZone(city, distanceKm) {
  const { rows } = await pool.query(
    `INSERT INTO shipping_zones (city, distance_km) VALUES ($1, $2)
     ON CONFLICT (city) DO UPDATE SET distance_km = EXCLUDED.distance_km
     RETURNING *`,
    [city, distanceKm]
  );
  return rows[0];
}

export async function getShippingSettings() {
  const { rows } = await pool.query("SELECT * FROM shipping_settings WHERE id = 1");
  return rows[0];
}

export async function updateShippingSettings({ baseFee, pricePerKm, pricePerItem }) {
  const { rows } = await pool.query(
    `UPDATE shipping_settings SET base_fee = $1, price_per_km = $2, price_per_item = $3 WHERE id = 1
     RETURNING *`,
    [baseFee, pricePerKm, pricePerItem]
  );
  return rows[0];
}

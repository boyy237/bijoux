import { Router } from "express";
import {
  calculateShippingFee,
  listShippingZones,
  upsertShippingZone,
  getShippingSettings,
  updateShippingSettings,
} from "../services/shipping.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// Devis de livraison public (utilisé au panier avant de commander)
router.post("/quote", async (req, res) => {
  const { city, itemCount } = req.body;
  if (!city || !itemCount) {
    return res.status(400).json({ error: "Ville et nombre d'articles requis." });
  }
  const result = await calculateShippingFee({ city, itemCount: Number(itemCount) });
  if (result.error) return res.status(404).json(result);
  res.json(result);
});

router.get("/zones", async (req, res) => {
  res.json({ zones: await listShippingZones() });
});

router.post("/zones", requireAdmin, async (req, res) => {
  const { city, distanceKm } = req.body;
  if (!city || distanceKm == null) return res.status(400).json({ error: "Ville et distance requises." });
  const zone = await upsertShippingZone(city, distanceKm);
  res.status(201).json({ zone });
});

router.get("/settings", requireAdmin, async (req, res) => {
  res.json({ settings: await getShippingSettings() });
});

router.put("/settings", requireAdmin, async (req, res) => {
  const { baseFee, pricePerKm, pricePerItem } = req.body;
  const settings = await updateShippingSettings({ baseFee, pricePerKm, pricePerItem });
  res.json({ settings });
});

export default router;

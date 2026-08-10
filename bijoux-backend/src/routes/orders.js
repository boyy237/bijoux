import { Router } from "express";
import { pool } from "../db/pool.js";
import { requireClient, requireAdmin } from "../middleware/auth.js";
import { calculateShippingFee } from "../services/shipping.js";
import { initCinetPayPayment } from "../services/cinetpay.js";

const router = Router();

async function loadOrderWithItems(orderId) {
  const { rows: orderRows } = await pool.query("SELECT * FROM orders WHERE id = $1", [orderId]);
  if (!orderRows[0]) return null;
  const { rows: items } = await pool.query("SELECT * FROM order_items WHERE order_id = $1", [orderId]);
  return { ...orderRows[0], items };
}

// Liste : admin voit tout, client voit ses propres commandes
router.get("/", async (req, res) => {
  if (!req.session) return res.status(401).json({ error: "Connexion requise." });

  const isAdmin = req.session.role === "admin";
  const { rows: orders } = await pool.query(
    isAdmin
      ? `SELECT o.*, c.name AS client_name, c.email AS client_email, c.phone AS client_phone
         FROM orders o JOIN clients c ON c.id = o.client_id ORDER BY o.created_at DESC`
      : `SELECT * FROM orders WHERE client_id = $1 ORDER BY created_at DESC`,
    isAdmin ? [] : [req.session.id]
  );

  const orderIds = orders.map((o) => o.id);
  let itemsByOrder = {};
  if (orderIds.length) {
    const { rows: items } = await pool.query(
      `SELECT * FROM order_items WHERE order_id = ANY($1::int[])`,
      [orderIds]
    );
    itemsByOrder = items.reduce((acc, item) => {
      (acc[item.order_id] ||= []).push(item);
      return acc;
    }, {});
  }

  res.json({ orders: orders.map((o) => ({ ...o, items: itemsByOrder[o.id] || [] })) });
});

// Création d'une commande : réservation, ou achat (paiement CinetPay ou à la livraison)
router.post("/", requireClient, async (req, res) => {
  const {
    items,
    type, // "reservation" | "achat"
    deliveryRequired,
    deliveryCity,
    deliveryAddress,
    paymentMethod, // "cinetpay" | "cash" (paiement à la livraison / en boutique)
  } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Le panier est vide." });
  }
  if (!["reservation", "achat"].includes(type)) {
    return res.status(400).json({ error: "Type de commande invalide." });
  }

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  let shippingFee = 0;
  let distanceKm = null;
  if (deliveryRequired) {
    if (!deliveryCity || !deliveryAddress) {
      return res.status(400).json({ error: "Ville et adresse de livraison requises." });
    }
    const quote = await calculateShippingFee({ city: deliveryCity, itemCount });
    if (quote.error) return res.status(400).json({ error: quote.error });
    shippingFee = quote.fee;
    distanceKm = quote.distanceKm;
  }

  const total = subtotal + shippingFee;
  const client = await pool.query("SELECT * FROM clients WHERE id = $1", [req.session.id]);
  const clientData = client.rows[0];

  const willPayNow = type === "achat" && paymentMethod === "cinetpay";

  const { rows: orderRows } = await pool.query(
    `INSERT INTO orders (client_id, type, status, subtotal, shipping_fee, total,
       delivery_required, delivery_city, delivery_address, delivery_distance_km,
       payment_method, payment_status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [
      req.session.id,
      type,
      willPayNow ? "en_attente" : "confirmee",
      subtotal,
      shippingFee,
      total,
      Boolean(deliveryRequired),
      deliveryCity || null,
      deliveryAddress || null,
      distanceKm,
      type === "achat" ? paymentMethod : null,
      "non_paye",
    ]
  );
  const order = orderRows[0];

  for (const item of items) {
    await pool.query(
      `INSERT INTO order_items (order_id, product_id, name, price, image, qty)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [order.id, item.productId, item.name, item.price, item.image, item.qty]
    );
  }

  // Paiement en ligne immédiat via CinetPay
  if (willPayNow) {
    const transactionId = `BJP${order.id}-${Date.now()}`;
    try {
      const { paymentUrl } = await initCinetPayPayment({
        transactionId,
        amount: total,
        description: `Commande Bijoux Pro #${order.id}`,
        customerName: clientData.name?.split(" ")[0],
        customerSurname: clientData.name?.split(" ").slice(1).join(" ") || clientData.name,
        customerEmail: clientData.email,
        customerPhone: clientData.phone,
        returnUrl: `${process.env.CINETPAY_RETURN_URL}?orderId=${order.id}`,
      });
      await pool.query(
        "UPDATE orders SET cinetpay_transaction_id = $1, payment_status = 'en_cours' WHERE id = $2",
        [transactionId, order.id]
      );
      const full = await loadOrderWithItems(order.id);
      return res.status(201).json({ order: full, paymentUrl });
    } catch (err) {
      // On ne laisse pas de commande fantôme si le lien de paiement n'a pas pu être généré :
      // le client n'a rien à payer, donc la commande n'a pas lieu d'être.
      await pool.query("DELETE FROM orders WHERE id = $1", [order.id]);
      return res.status(502).json({
        error: "Impossible d'initier le paiement CinetPay. Vérifie la configuration (clés API) ou réessaie.",
        details: err.message,
      });
    }
  }

  const full = await loadOrderWithItems(order.id);
  res.status(201).json({ order: full });
});

// Mise à jour de statut (admin), ou annulation par le client de sa propre réservation
router.put("/:id", async (req, res) => {
  if (!req.session) return res.status(401).json({ error: "Connexion requise." });

  const { rows } = await pool.query("SELECT * FROM orders WHERE id = $1", [req.params.id]);
  const order = rows[0];
  if (!order) return res.status(404).json({ error: "Commande introuvable." });

  if (req.session.role === "admin") {
    const { rows: updated } = await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
      [req.body.status, req.params.id]
    );
    return res.json({ order: updated[0] });
  }

  if (req.session.role === "client" && order.client_id === req.session.id) {
    if (order.status !== "en_attente" && order.status !== "confirmee") {
      return res.status(403).json({ error: "Cette commande ne peut plus être annulée." });
    }
    if (req.body.status !== "annulee") {
      return res.status(403).json({ error: "Action non autorisée." });
    }
    const { rows: updated } = await pool.query(
      "UPDATE orders SET status = 'annulee' WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    return res.json({ order: updated[0] });
  }

  res.status(403).json({ error: "Non autorisé." });
});

export default router;

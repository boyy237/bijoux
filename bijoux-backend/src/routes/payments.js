import { Router } from "express";
import { pool } from "../db/pool.js";
import { checkCinetPayTransaction } from "../services/cinetpay.js";

const router = Router();

// Appelée par CinetPay (jamais par le client) pour signaler qu'un paiement a eu lieu.
// On ne fait JAMAIS confiance au statut envoyé ici : on revérifie toujours auprès de
// l'API CinetPay avant de marquer une commande comme payée.
router.post("/cinetpay/notify", async (req, res) => {
  const transactionId = req.body.cpm_trans_id || req.body.transaction_id;
  if (!transactionId) return res.status(400).end();

  try {
    const result = await checkCinetPayTransaction(transactionId);
    const status = result?.data?.status; // "ACCEPTED" | "REFUSED" | "WAITING_FOR_CUSTOMER" ...

    let paymentStatus = "en_cours";
    let orderStatus;
    if (status === "ACCEPTED") {
      paymentStatus = "paye";
      orderStatus = "confirmee";
    } else if (status === "REFUSED") {
      paymentStatus = "echoue";
    }

    await pool.query(
      `UPDATE orders SET payment_status = $1 ${orderStatus ? ", status = $3" : ""}
       WHERE cinetpay_transaction_id = $2`,
      orderStatus ? [paymentStatus, transactionId, orderStatus] : [paymentStatus, transactionId]
    );
  } catch (err) {
    console.error("Erreur vérification CinetPay:", err.message);
  }

  // CinetPay attend une réponse 200, peu importe le contenu.
  res.status(200).end();
});

// Utilisée par le frontend après redirection (return_url) pour afficher le bon statut.
router.get("/cinetpay/status/:orderId", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, payment_status, status, cinetpay_transaction_id FROM orders WHERE id = $1",
    [req.params.orderId]
  );
  if (!rows[0]) return res.status(404).json({ error: "Commande introuvable." });

  // Si toujours en cours, on retente une vérification live (utile si le webhook a du retard).
  if (rows[0].payment_status === "en_cours" && rows[0].cinetpay_transaction_id) {
    try {
      const result = await checkCinetPayTransaction(rows[0].cinetpay_transaction_id);
      const status = result?.data?.status;
      if (status === "ACCEPTED") {
        await pool.query(
          "UPDATE orders SET payment_status = 'paye', status = 'confirmee' WHERE id = $1",
          [req.params.orderId]
        );
        rows[0].payment_status = "paye";
        rows[0].status = "confirmee";
      } else if (status === "REFUSED") {
        await pool.query("UPDATE orders SET payment_status = 'echoue' WHERE id = $1", [req.params.orderId]);
        rows[0].payment_status = "echoue";
      }
    } catch {
      // on renvoie simplement le statut connu en base si l'appel échoue
    }
  }

  res.json(rows[0]);
});

export default router;

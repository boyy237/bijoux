import axios from "axios";

const BASE_URL = "https://api-checkout.cinetpay.com/v2/payment";

// Initie un paiement CinetPay et renvoie l'URL de paiement (Mobile Money / carte)
// vers laquelle rediriger le client.
export async function initCinetPayPayment({
  transactionId,
  amount,
  description,
  customerName,
  customerSurname,
  customerEmail,
  customerPhone,
  returnUrl,
}) {
  const payload = {
    apikey: process.env.CINETPAY_API_KEY,
    site_id: process.env.CINETPAY_SITE_ID,
    transaction_id: transactionId,
    amount: Math.round(amount), // XAF n'a pas de décimales
    currency: "XAF",
    description: description?.slice(0, 255) || "Commande Bijoux Pro",
    customer_name: customerName || "Client",
    customer_surname: customerSurname || "Bijoux Pro",
    customer_email: customerEmail || "client@bijoux.pro",
    customer_phone_number: customerPhone || "670000000",
    customer_address: "Yaoundé",
    customer_city: "Yaoundé",
    customer_country: "CM",
    customer_state: "CM",
    customer_zip_code: "00000",
    notify_url: process.env.CINETPAY_NOTIFY_URL,
    return_url: returnUrl || process.env.CINETPAY_RETURN_URL,
    channels: "ALL", // Mobile Money (MTN, Orange) + cartes bancaires
    lang: "FR",
  };

  const { data } = await axios.post(BASE_URL, payload, {
    headers: { "Content-Type": "application/json" },
  });

  if (data.code !== "201") {
    throw new Error(data.description || data.message || "Échec de l'initialisation du paiement CinetPay.");
  }

  return { paymentUrl: data.data.payment_url, paymentToken: data.data.payment_token };
}

// Vérifie le statut réel d'une transaction auprès de CinetPay.
// À appeler systématiquement depuis la notify_url : ne jamais faire confiance
// au statut envoyé directement par le client ou par un tiers.
export async function checkCinetPayTransaction(transactionId) {
  const payload = {
    apikey: process.env.CINETPAY_API_KEY,
    site_id: process.env.CINETPAY_SITE_ID,
    transaction_id: transactionId,
  };

  const { data } = await axios.post(`${BASE_URL}/check`, payload, {
    headers: { "Content-Type": "application/json" },
  });

  return data; // data.data.status: "ACCEPTED" | "REFUSED" | "WAITING_FOR_CUSTOMER" | ...
}

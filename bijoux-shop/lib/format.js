// Devise de la boutique : Franc CFA (Cameroun), pas de décimales.
export function formatPrice(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
  }).format(value);
}

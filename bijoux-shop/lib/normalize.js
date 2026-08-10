// Le backend (PostgreSQL) renvoie des champs en snake_case et des NUMERIC
// sous forme de chaînes ("285000.00"). Ces fonctions les remettent dans le
// format déjà utilisé par les composants du frontend, pour ne pas avoir à
// réécrire toutes les pages.

export function normalizeProduct(p) {
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    category: p.category_slug,
    categoryName: p.category_name,
    subcategory: p.subcategory_slug,
    subcategoryName: p.subcategory_name,
    price: Number(p.price),
    image: p.image,
    description: p.description,
    inStock: p.in_stock,
    createdAt: p.created_at,
  };
}

export function normalizeOrder(o) {
  if (!o) return null;
  return {
    id: o.id,
    clientId: o.client_id,
    clientName: o.client_name,
    clientEmail: o.client_email,
    clientPhone: o.client_phone,
    type: o.type,
    status: o.status,
    subtotal: Number(o.subtotal),
    shippingFee: Number(o.shipping_fee),
    total: Number(o.total),
    deliveryRequired: o.delivery_required,
    deliveryCity: o.delivery_city,
    deliveryAddress: o.delivery_address,
    deliveryDistanceKm: o.delivery_distance_km ? Number(o.delivery_distance_km) : null,
    paymentMethod: o.payment_method,
    paymentStatus: o.payment_status,
    createdAt: o.created_at,
    items: (o.items || []).map((i) => ({
      productId: i.product_id,
      name: i.name,
      price: Number(i.price),
      image: i.image,
      qty: i.qty,
    })),
  };
}

export function normalizeClient(c) {
  if (!c) return null;
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    createdAt: c.created_at,
    ordersCount: Number(c.orders_count || 0),
  };
}

-- Schéma complet de la base de données Bijoux Pro

CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT
);

CREATE TABLE IF NOT EXISTS subcategories (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  UNIQUE (category_id, slug)
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  subcategory_id INTEGER NOT NULL REFERENCES subcategories(id),
  price NUMERIC(12, 2) NOT NULL,
  image TEXT NOT NULL,
  description TEXT DEFAULT '',
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Villes desservies pour le calcul de la livraison par distance
-- (distance approximative en km depuis Yaoundé, siège de la boutique).
-- L'admin peut ajouter/modifier des villes via le dashboard.
CREATE TABLE IF NOT EXISTS shipping_zones (
  id SERIAL PRIMARY KEY,
  city TEXT UNIQUE NOT NULL,
  distance_km NUMERIC(6, 1) NOT NULL
);

-- Un seul enregistrement : les paramètres de calcul du tarif de livraison.
CREATE TABLE IF NOT EXISTS shipping_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  base_fee NUMERIC(10, 2) NOT NULL DEFAULT 1000,
  price_per_km NUMERIC(10, 2) NOT NULL DEFAULT 50,
  price_per_item NUMERIC(10, 2) NOT NULL DEFAULT 200,
  CONSTRAINT single_row CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('reservation', 'achat')),
  status TEXT NOT NULL DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'confirmee', 'en_livraison', 'livree', 'annulee')),
  subtotal NUMERIC(12, 2) NOT NULL,
  shipping_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL,
  delivery_required BOOLEAN DEFAULT false,
  delivery_city TEXT,
  delivery_address TEXT,
  delivery_distance_km NUMERIC(6, 1),
  payment_method TEXT,
  payment_status TEXT DEFAULT 'non_paye' CHECK (payment_status IN ('non_paye', 'en_cours', 'paye', 'echoue')),
  cinetpay_transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  image TEXT,
  qty INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

INSERT INTO shipping_settings (id, base_fee, price_per_km, price_per_item)
VALUES (1, 1000, 50, 200)
ON CONFLICT (id) DO NOTHING;

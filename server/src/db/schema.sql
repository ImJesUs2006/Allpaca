-- ALLPACA — Esquema de base de datos
-- Fuente de verdad de diseño: DESIGN.md
-- Los precios se almacenan como ENTEROS en centavos (price_cents). Nunca floats.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------- usuarios
CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  handle        TEXT        NOT NULL UNIQUE,
  name          TEXT        NOT NULL,
  avatar_url    TEXT,
  bio           TEXT        NOT NULL DEFAULT '',
  location      TEXT        NOT NULL DEFAULT '',
  rating        NUMERIC(2,1) NOT NULL DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  verified      BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------- productos
CREATE TABLE IF NOT EXISTS products (
  id           BIGSERIAL PRIMARY KEY,
  seller_id    BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  price_cents  INTEGER     NOT NULL CHECK (price_cents >= 0),
  currency     CHAR(3)     NOT NULL DEFAULT 'USD',
  image_url    TEXT        NOT NULL,
  category     TEXT        NOT NULL,
  size         TEXT        NOT NULL,
  condition    TEXT        NOT NULL,
  location     TEXT        NOT NULL,
  rating       NUMERIC(2,1) NOT NULL DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  verified     BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category  ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_seller    ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_created   ON products(created_at DESC);

-- Estilos normalizados: sustituye al array styles[] del prototipo
CREATE TABLE IF NOT EXISTS product_styles (
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  style      TEXT   NOT NULL,
  PRIMARY KEY (product_id, style)
);

-- ------------------------------------------------------------- comunidades
CREATE TABLE IF NOT EXISTS communities (
  id           BIGSERIAL PRIMARY KEY,
  name         TEXT        NOT NULL UNIQUE,
  image_url    TEXT        NOT NULL,
  tag          TEXT        NOT NULL,
  members_count INTEGER    NOT NULL DEFAULT 0 CHECK (members_count >= 0),
  drops_today  INTEGER     NOT NULL DEFAULT 0 CHECK (drops_today >= 0),
  curator_id   BIGINT      REFERENCES users(id) ON DELETE SET NULL,
  location     TEXT        NOT NULL,
  description  TEXT        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_rules (
  id          BIGSERIAL PRIMARY KEY,
  community_id BIGINT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL,
  rule        TEXT    NOT NULL,
  UNIQUE (community_id, position)
);

CREATE TABLE IF NOT EXISTS community_members (
  community_id BIGINT  NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id      BIGINT  NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
  role         TEXT    NOT NULL DEFAULT 'EXPLORADOR'
              CHECK (role IN ('CURADOR', 'DEALER', 'EXPLORADOR')),
  drops        INTEGER NOT NULL DEFAULT 0,
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (community_id, user_id)
);

CREATE TABLE IF NOT EXISTS community_products (
  community_id BIGINT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  product_id   BIGINT NOT NULL REFERENCES products(id)   ON DELETE CASCADE,
  PRIMARY KEY (community_id, product_id)
);

-- --------------------------------------------------------------- pedidos
-- Una sola tabla para compras y ventas (spec §4: usuario único, sin separar
-- comprador de vendedor). La dirección se decide comparando buyer/seller.
CREATE TABLE IF NOT EXISTS orders (
  id           BIGSERIAL PRIMARY KEY,
  code         TEXT        NOT NULL UNIQUE,
  product_id   BIGINT      NOT NULL REFERENCES products(id),
  buyer_id     BIGINT      NOT NULL REFERENCES users(id),
  seller_id    BIGINT      NOT NULL REFERENCES users(id),
  amount_cents INTEGER     NOT NULL CHECK (amount_cents >= 0),
  currency     CHAR(3)     NOT NULL DEFAULT 'USD',
  status       TEXT        NOT NULL DEFAULT 'PENDIENTE'
               CHECK (status IN ('PENDIENTE', 'ENVIADO', 'EN CAMINO', 'ENTREGADO', 'CANCELADO')),
  tracking     TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer  ON orders(buyer_id,  created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id, created_at DESC);

-- ----------------------------------------------------------- conversaciones
CREATE TABLE IF NOT EXISTS conversations (
  id         BIGSERIAL PRIMARY KEY,
  user_a     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (user_a <> user_b)
);

-- Un UNIQUE sobre una columna nullable no evita duplicados (NULL != NULL en
-- Postgres) y haria que ON CONFLICT nunca disparase. COALESCE(product_id, 0)
-- convierte el NULL en un valor comparable.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_conversation_pair
  ON conversations (user_a, user_b, COALESCE(product_id, 0));

CREATE TABLE IF NOT EXISTS messages (
  id              BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body            TEXT   NOT NULL,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);

-- --------------------------------------------------------------- analiticas
CREATE TABLE IF NOT EXISTS monthly_metrics (
  user_id        BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month          TEXT        NOT NULL,          -- 'YYYY-MM'
  revenue_cents  INTEGER     NOT NULL DEFAULT 0,
  orders_count   INTEGER     NOT NULL DEFAULT 0,
  visitors       INTEGER     NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, month)
);

CREATE TABLE IF NOT EXISTS traffic_sources (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source  TEXT   NOT NULL,
  visits  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, source)
);

CREATE TABLE IF NOT EXISTS top_products (
  user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  units      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, product_id)
);

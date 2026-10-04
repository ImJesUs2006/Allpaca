import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import type { Server } from "node:http";

const { config } = await import("dotenv");
config();
process.env.PGDATABASE = process.env.TEST_PGDATABASE ?? "allpaca_test";
process.env.JWT_SECRET ??= "x".repeat(32);
process.env.NODE_ENV = "test";
// bcryptjs puro con 12 rondas tardaria ~1-2s por hash. Se fija antes de que
// `config/env.ts` se importe para que el schema lo vea.
process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS ?? "4";

const { createApp } = await import("../src/app.js");
const { pool } = await import("../src/db/pool.js");

/**
 * `test/setup-db.ts` deja `allpaca_test` lista. Si Postgres no esta disponible
 * los describes de abajo se omiten en vez de reventar, para que `npm test`
 * siga siendo util antes del setup de la base.
 */
let dbReady = false;
try {
  await pool.query("SELECT 1");
  dbReady = true;
} catch {
  console.warn("[db] sin conexion a Postgres: se omiten los tests HTTP sobre la base");
}

let base = "";
let server: Server;

before(async () => {
  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const addr = server.address();
  if (!addr || typeof addr === "string") throw new Error("no se pudo obtener el puerto");
  base = `http://127.0.0.1:${addr.port}`;
});

after(async () => {
  server?.close();
  // Sin esto el pool mantiene sockets vivos y el runner espera a su
  // idleTimeoutMillis (30s) antes de dejar salir el proceso.
  await pool.end();
});

async function api(
  path: string,
  init: RequestInit & { token?: string } = {},
): Promise<{ status: number; body: any }> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...((init.headers as Record<string, string>) ?? {}),
  };
  if (init.token) headers.authorization = `Bearer ${init.token}`;
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers,
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

let token = "";

describe("auth sobre HTTP", { skip: !dbReady }, () => {
  it("login con las credenciales del seed devuelve token y usuario", async () => {
    const r = await api("/api/auth/login", {
      method: "POST",
      body: { email: "admin@allpaca.mx", password: "allpaca123" },
    });
    assert.equal(r.status, 200);
    assert.ok(r.body.token, "debe devolver token");
    assert.equal(r.body.user.email, "admin@allpaca.mx");
    token = r.body.token;
  });

  it("login normaliza el email a minusculas", async () => {
    const r = await api("/api/auth/login", {
      method: "POST",
      body: { email: "ADMIN@Allpaca.MX", password: "allpaca123" },
    });
    assert.equal(r.status, 200);
  });

  it("login con contrasena incorrecta devuelve 401", async () => {
    const r = await api("/api/auth/login", {
      method: "POST",
      body: { email: "admin@allpaca.mx", password: "incorrecta123" },
    });
    assert.equal(r.status, 401);
  });

  it("GET /api/auth/me con token devuelve el usuario", async () => {
    const r = await api("/api/auth/me", { token });
    assert.equal(r.status, 200);
    assert.equal(r.body.user.email, "admin@allpaca.mx");
  });
});

describe("catalogo", { skip: !dbReady }, () => {
  it("GET /api/products devuelve productos con precio numerico", async () => {
    const r = await api("/api/products");
    assert.equal(r.status, 200);
    assert.ok(r.body.products.length > 0);
    for (const p of r.body.products) {
      assert.equal(typeof p.price_cents, "number", `precio de ${p.name} debe ser number`);
      assert.equal(typeof p.id, "number", `id de ${p.name} debe ser number`);
    }
  });

  it("filtra por categoria", async () => {
    const r = await api("/api/products?category=Tops");
    assert.equal(r.status, 200);
    for (const p of r.body.products) assert.equal(p.category, "Tops");
  });

  it("acepta varias categorias separadas por coma", async () => {
    const r = await api("/api/products?category=Tops,Accesorios");
    assert.equal(r.status, 200);
    const cats = new Set(r.body.products.map((p: any) => p.category));
    for (const c of cats) assert.ok(["Tops", "Accesorios"].includes(c), `categoria inesperada: ${c}`);
  });

  it("una categoria desconocida devuelve 200 con lista vacia (no 400)", async () => {
    const r = await api("/api/products?category=NoExiste");
    assert.equal(r.status, 200);
    assert.equal(r.body.products.length, 0);
  });
});

describe("flujo de compra (regresion del placeholder `$1/$2`)", { skip: !dbReady }, () => {
  it("no compra el propio producto", async () => {
    // El admin del seed no vende nada, asi que se crea un vendedor propio.
    const handle = `seller_${Date.now().toString(36)}`;
    const reg = await api("/api/auth/register", {
      method: "POST",
      body: { email: `${handle}@test.mx`, password: "supersecret", handle, name: "Vendedor QA" },
    });
    assert.equal(reg.status, 201, JSON.stringify(reg.body));
    const sellerToken = reg.body.token;

    const created = await api("/api/products", {
      method: "POST",
      token: sellerToken,
      body: {
        name: "Prenda de prueba QA",
        price_cents: 19900,
        currency: "USD",
        image_url: "https://example.com/prenda.jpg",
        category: "Tops",
        size: "M",
        condition: "Nuevo con etiquetas",
        location: "CDMX",
        styles: ["Streetwear"],
      },
    });
    assert.equal(created.status, 201, JSON.stringify(created.body));
    assert.equal(created.body.product.price_cents, 19900);
    assert.equal(typeof created.body.product.id, "number");

    const own = await api("/api/orders", {
      method: "POST",
      token: sellerToken,
      body: { product_id: created.body.product.id },
    });
    assert.equal(own.status, 400);
    assert.match(own.body.error.message, /tu propio producto/);
  });

  it("compra el producto de otro usuario y el pedido aparece en /api/orders", async () => {
    const me = await api("/api/auth/me", { token });
    const all = await api("/api/products");
    const other = all.body.products.find(
      (p: any) => p.seller_id !== null && p.seller_id !== me.body.user.id,
    );
    assert.ok(other, "el seed debe tener productos de otros vendedores");

    const created = await api("/api/orders", {
      method: "POST",
      token,
      body: { product_id: other.id },
    });
    assert.equal(created.status, 201, JSON.stringify(created.body));
    assert.equal(created.body.order.product_id, other.id);
    assert.match(created.body.order.code, /^AP-\d+$/);
    assert.equal(created.body.order.role, "BUYER");

    const listed = await api("/api/orders", { token });
    assert.equal(listed.status, 200);
    const found = listed.body.orders.find(
      (o: any) => Number(o.id) === Number(created.body.order.id),
    );
    assert.ok(found, "el pedido recien creado debe aparecer en /api/orders");

    const moved = await api(`/api/orders/${created.body.order.id}/status`, {
      method: "PATCH",
      token,
      body: { status: "ENVIADO", tracking: "TEST123" },
    });
    assert.equal(moved.status, 200);
    assert.equal(moved.body.order.status, "ENVIADO");
    assert.equal(moved.body.order.tracking, "TEST123");
  });
});

describe("comunidades y registro", { skip: !dbReady }, () => {
  it("registra un usuario nuevo y el handle queda normalizado", async () => {
    const handle = `qa_${Date.now().toString(36)}`;
    const r = await api("/api/auth/register", {
      method: "POST",
      body: {
        email: `${handle}@test.mx`,
        password: "supersecret",
        handle,
        name: "QA Test",
      },
    });
    assert.equal(r.status, 201, JSON.stringify(r.body));
    assert.equal(r.body.user.handle, handle);
  });

  it("rechaza un handle duplicado con 409", async () => {
    const r = await api("/api/auth/register", {
      method: "POST",
      body: {
        email: `otro_${Date.now().toString(36)}@test.mx`,
        password: "supersecret",
        handle: "admin",
        name: "Duplicado",
      },
    });
    assert.equal(r.status, 409);
  });

  it("listar comunidades es publico y unirse es idempotente", async () => {
    const list = await api("/api/communities");
    assert.equal(list.status, 200);
    const id = list.body.communities[0].id;

    const first = await api(`/api/communities/${id}/join`, { method: "POST", token, body: {} });
    const second = await api(`/api/communities/${id}/join`, { method: "POST", token, body: {} });
    assert.equal(first.status, second.status, "unirse dos veces no debe cambiar el resultado");

    const left = await api(`/api/communities/${id}/join`, { method: "DELETE", token });
    assert.ok([200, 204].includes(left.status));
  });
});

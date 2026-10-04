import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

// dotenv debe correr ANTES de mirar process.env.PGPASSWORD: este archivo es el
// punto de entrada, todavia no se importo `config/env.ts`.
const { config } = await import("dotenv");
config();

// Los tests nunca escriben en la base de demo: `test/setup-db.ts` deja lista
// `allpaca_test` con el mismo seed. Sin esto cada corrida anadiria usuarios y
// pedidos de prueba a los datos de la app.
process.env.PGDATABASE = process.env.TEST_PGDATABASE ?? "allpaca_test";
process.env.PGPASSWORD = process.env.PGPASSWORD ?? "";
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "x".repeat(32);
process.env.NODE_ENV = "test";
process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS ?? "4";

/**
 * Tests que requieren Postgres de verdad. Se saltan solos si la DB no esta
 * disponible, para que `npm test` siga siendo util antes del setup.
 */
let dbReady = false;
let pool: import("pg").Pool | null = null;
let createOrder: typeof import("../src/modules/orders/service.js").createOrder;
let listOrders: typeof import("../src/modules/orders/service.js").listOrders;
let poolModule: typeof import("../src/db/pool.js");

async function detectDb(): Promise<boolean> {
  if (!process.env.PGPASSWORD) return false;
  try {
    poolModule = await import("../src/db/pool.js");
    pool = poolModule.pool;
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

before(async () => {
  dbReady = await detectDb();
  if (!dbReady) {
    console.log("[db] sin conexion: se omiten los tests que requieren Postgres");
    return;
  }
  const service = await import("../src/modules/orders/service.js");
  createOrder = service.createOrder;
  listOrders = service.listOrders;
});

after(async () => {
  await pool?.end();
});

describe("pedidos (requiere Postgres)", { skip: !process.env.PGPASSWORD }, () => {
  it("crea un pedido y lo devuelve con el counterparty correcto", async (t) => {
    if (!dbReady) return t.skip("sin conexion a Postgres");

    const { rows } = await pool!.query<{ id: string; buyer_id: string }>(
      `SELECT o.id, o.buyer_id FROM orders o
       JOIN products p ON p.id = o.product_id
       WHERE p.seller_id <> o.buyer_id LIMIT 1`,
    );
    const order = rows[0];
    if (!order) return t.skip("no hay datos de seed");

    // Regresion: la consulta final usaba $1 (usuario) tambien como filtro de id.
    const found = await listOrders(Number(order.buyer_id), "all");
    const match = found.find((o) => Number(o.id) === Number(order.id));
    assert.ok(match, "el pedido recien creado debe aparecer en listOrders");
    assert.equal(match!.role, "BUYER");
    assert.match(match!.code, /^AP-\d+$/);
  });

  it("impide comprar el propio producto", async (t) => {
    if (!dbReady) return t.skip("sin conexion a Postgres");

    const { rows } = await pool!.query<{ id: string; seller_id: string }>(
      "SELECT id, seller_id FROM products LIMIT 1",
    );
    const product = rows[0];
    if (!product) return t.skip("no hay datos de seed");

    await assert.rejects(
      () => createOrder(Number(product.seller_id), { product_id: Number(product.id) }),
      /tu propio producto/,
    );
  });

  it("genera codigos unicos bajo concurrencia", async (t) => {
    if (!dbReady) return t.skip("sin conexion a Postgres");

    const { rows } = await pool!.query<{ id: string; seller_id: string; buyer_id: string }>(
      `SELECT p.id, p.seller_id, o.buyer_id FROM products p
       JOIN orders o ON o.product_id = p.id
       WHERE p.seller_id <> o.buyer_id LIMIT 2`,
    );
    if (rows.length < 2) return t.skip("necesita 2 productos");

    const created = await Promise.allSettled(
      rows.map((r) => createOrder(Number(r.buyer_id), { product_id: Number(r.id) })),
    );
    const ok = created
      .filter((c): c is PromiseFulfilledResult<{ code: string }> => c.status === "fulfilled")
      .map((c) => c.value.code);

    assert.equal(new Set(ok).size, ok.length, "los codigos deben ser unicos");
  });
});

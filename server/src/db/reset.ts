/**
 * Devuelve la base de desarrollo a estado de seed puro.
 *
 * `npm run seed` es idempotente pero NO borra: hace upsert. Si los tests se
 * ejecutaron contra esta base, quedan usuarios `qa_*`, productos "de prueba"
 * y pedidos huerfanos que `db:setup` no elimina. Este script trunca y vuelve a
 * sembrar, dejando los ids desde 1 igual que una base recien creada.
 *
 * Uso: npm run db:reset
 * Peligro: borra TODO. Solo para la base de demo, nunca para produccion.
 */
import { pool, query } from "./pool.js";
import { isProd, env } from "../config/env.js";

if (isProd) {
  console.error("[reset] NODE_ENV=production: no se trunca nada.");
  process.exit(1);
}

const TABLES = [
  "messages",
  "conversations",
  "orders",
  "community_products",
  "community_members",
  "community_rules",
  "communities",
  "top_products",
  "traffic_sources",
  "monthly_metrics",
  "product_styles",
  "products",
  "users",
];

async function reset(): Promise<void> {
  console.log(`[reset] truncando ${TABLES.length} tablas en "${env.PGDATABASE}"...`);
  // RESTART IDENTITY para que los ids vuelvan a 1; CASCADE por los FKs.
  await query(`TRUNCATE ${TABLES.join(", ")} RESTART IDENTITY CASCADE`);

  console.log("[reset] Applying seed...");
  const { spawnSync } = await import("node:child_process");
  const res = spawnSync(process.execPath, ["--import", "tsx", "src/db/seed.ts"], {
    cwd: process.cwd(),
    env: { ...process.env },
    stdio: "inherit",
  });
  if (res.status !== 0) throw new Error(`seed termino con codigo ${res.status}`);
}

reset()
  .then(async () => {
    console.log("[reset] listo.");
    await pool.end();
    process.exit(0);
  })
  .catch(async (err: Error) => {
    console.error("[reset] fallo:", err.message);
    await pool.end();
    process.exit(1);
  });

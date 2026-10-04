/**
 * Crea la base de datos si no existe y aplica src/db/schema.sql.
 * El schema es idempotente (CREATE TABLE IF NOT EXISTS), asi que se puede
 * ejecutar cuantas veces sea.
 */
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { env } from "../config/env.js";

const here = dirname(fileURLToPath(import.meta.url));

async function ensureDatabase(): Promise<void> {
  const admin = new pg.Client({
    host: env.PGHOST,
    port: env.PGPORT,
    database: "postgres",
    user: env.PGUSER,
    password: env.PGPASSWORD,
    connectionTimeoutMillis: 5_000,
  });

  try {
    await admin.connect();
  } catch (err) {
    throw new Error(
      `No se pudo conectar a Postgres en ${env.PGHOST}:${env.PGPORT} como "${env.PGUSER}".\n` +
        `Detalle: ${(err as Error).message}\n` +
        `Verifica que el servicio "postgresql-x64-18" este corriendo y que server/.env sea correcto.`,
    );
  }

  try {
    const { rowCount } = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [
      env.PGDATABASE,
    ]);
    if (rowCount === 0) {
      // Identificador no parametrizable; el nombre viene de .env, no de input de usuario.
      await admin.query(`CREATE DATABASE "${env.PGDATABASE.replace(/"/g, '""')}"`);
      console.log(`[migrate] base de datos creada: ${env.PGDATABASE}`);
    } else {
      console.log(`[migrate] base de datos existente: ${env.PGDATABASE}`);
    }
  } finally {
    await admin.end();
  }
}

async function applySchema(): Promise<void> {
  const sql = await readFile(join(here, "schema.sql"), "utf8");
  const client = new pg.Client({
    host: env.PGHOST,
    port: env.PGPORT,
    database: env.PGDATABASE,
    user: env.PGUSER,
    password: env.PGPASSWORD,
  });
  await client.connect();
  try {
    await client.query(sql);
    console.log("[migrate] schema aplicado");
  } finally {
    await client.end();
  }
}

ensureDatabase()
  .then(applySchema)
  .then(() => process.exit(0))
  .catch((err: Error) => {
    console.error("[migrate] fallo:", err.message);
    process.exit(1);
  });

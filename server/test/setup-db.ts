/**
 * Prepara una base de datos DESPECHABLE para los tests.
 *
 * Por que existe: los tests reales registran usuarios, crean productos y
 * generan pedidos. Si corren contra la base de demo (`allpaca`), cada corrida
 * la deja mas sucia y el estado ya no es reproducible. Este script crea
 * `<TEST_PGDATABASE>` desde cero (drop + migrate + seed) en cada invocacion,
 * de modo que los tests siempre empiecen con exactamente los fixtures del seed.
 *
 * Nunca toca la base de desarrollo: si `TEST_PGDATABASE` coincide con
 * `PGDATABASE` de server/.env, aborta.
 *
 * No es fatal si Postgres no esta disponible: los tests de DB ya se saltan
 * solos cuando no hay conexion, asi que la parte unitaria sigue siendo util.
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const { config } = await import("dotenv");
config({ quiet: true });

const here = dirname(fileURLToPath(import.meta.url));
const serverRoot = join(here, "..");

const DEV_DB = process.env.PGDATABASE || "allpaca";
const TEST_DB = process.env.TEST_PGDATABASE || "allpaca_test";

if (TEST_DB === DEV_DB) {
  console.error(
    `[setup-test-db] abortado: TEST_PGDATABASE ("${TEST_DB}") es igual a la base de ` +
      `desarrollo (PGDATABASE). Los tests no deben escribir en los datos de demo.`,
  );
  process.exit(1);
}

/** Ejecuta migrate.ts / seed.ts como subproceso: ambos hacen process.exit(). */
function runScript(relative: string): void {
  const res = spawnSync(process.execPath, ["--import", "tsx", relative], {
    cwd: serverRoot,
    // dotenv no sobreescribe variables ya presentes, asi que esto gana.
    env: { ...process.env, PGDATABASE: TEST_DB },
    stdio: "inherit",
  });
  if (res.status !== 0) {
    throw new Error(`${relative} termino con codigo ${res.status}`);
  }
}

async function dropAndCreate(): Promise<void> {
  const pg = (await import("pg")).default;
  const client = new pg.Client({
    host: process.env.PGHOST || "localhost",
    port: Number(process.env.PGPORT || 5432),
    database: "postgres",
    user: process.env.PGUSER || "allpaca",
    password: process.env.PGPASSWORD,
    connectionTimeoutMillis: 5_000,
  });
  await client.connect();
  try {
    // WITH (FORCE) mata conexiones abiertas: si el API de `npm run dev` quedo
    // apuntando por error, el DROP se quedaria esperando.
    await client.query(`DROP DATABASE IF EXISTS "${TEST_DB.replace(/"/g, '""')}" WITH (FORCE)`);
    await client.query(`CREATE DATABASE "${TEST_DB.replace(/"/g, '""')}"`);
    console.log(`[setup-test-db] ${TEST_DB} recreada desde cero`);
  } finally {
    await client.end();
  }
}

try {
  if (!process.env.PGPASSWORD) throw new Error("falta PGPASSWORD en server/.env");
  await dropAndCreate();
  runScript("src/db/migrate.ts");
  runScript("src/db/seed.ts");
  console.log(`[setup-test-db] listo: los tests usaran "${TEST_DB}"`);
} catch (err) {
  console.warn(
    `[setup-test-db] no se pudo preparar "${TEST_DB}": ${(err as Error).message}\n` +
      `[setup-test-db] los tests que requieren Postgres se omitiran.`,
  );
}
process.exit(0);

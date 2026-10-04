import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./db/pool.js";

const app = createApp();
const server = app.listen(env.PORT, () => {
  console.log(`[allpaca] API escuchando en http://localhost:${env.PORT}`);
  console.log(`[allpaca] health: http://localhost:${env.PORT}/api/health`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`\n[allpaca] ${signal} recibido, cerrando...`);
  server.close(async () => {
    await pool.end();
    console.log("[allpaca] conexiones cerradas limpiamente");
    process.exit(0);
  });
  // Red de seguridad por si algo queda colgado.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import type { Server } from "node:http";

// Variables validas para que `config/env.ts` no reviente al importar la app.
process.env.PGPASSWORD = "placeholder-no-se-conecta";
process.env.JWT_SECRET = "x".repeat(32);
process.env.NODE_ENV = "test";
delete process.env.CORS_ORIGINS;

const { createApp } = await import("../src/app.js");
const { pool } = await import("../src/db/pool.js");

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
  await pool.end();
});

describe("infraestructura", () => {
  it("GET /api/health responde ok", async () => {
    const res = await fetch(`${base}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, "ok");
    assert.equal(body.service, "allpaca-api");
  });

  it("ruta inexistente devuelve 404 con codigo estructurado", async () => {
    const res = await fetch(`${base}/api/no-existe`);
    assert.equal(res.status, 404);
    assert.equal((await res.json()).error.code, "NOT_FOUND");
  });

  it("no expone la technology stack", async () => {
    const res = await fetch(`${base}/api/health`);
    assert.equal(res.headers.get("x-powered-by"), null);
  });
});

describe("validacion de entrada (sin tocar la base de datos)", () => {
  it("login con email invalido devuelve 400 antes de consultar la DB", async () => {
    const res = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "no-es-email", password: "x" }),
    });
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error.code, "VALIDATION_ERROR");
  });

  it("registro con password corta devuelve 400", async () => {
    const res = await fetch(`${base}/api/auth/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "a@b.mx", password: "123", handle: "abc", name: "A" }),
    });
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error.code, "VALIDATION_ERROR");
  });

  it("ruta protegida sin token devuelve 401", async () => {
    const res = await fetch(`${base}/api/auth/me`);
    assert.equal(res.status, 401);
  });
});

describe("CORS", () => {
  it("refleja el origen permitido de desarrollo", async () => {
    const res = await fetch(`${base}/api/health`, {
      headers: { origin: "http://localhost:4200" },
    });
    assert.equal(res.headers.get("access-control-allow-origin"), "http://localhost:4200");
  });

  it("NO refleja un origen no permitido", async () => {
    const res = await fetch(`${base}/api/health`, {
      headers: { origin: "https://sitio-malicioso.example" },
    });
    assert.equal(res.headers.get("access-control-allow-origin"), null);
  });
});

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { describe, it } from "node:test";

/** Ejecuta un fragmento en un proceso hijo, porque `env.ts` se evalua al importar. */
function runInChild(code: string, extraEnv: Record<string, string>): {
  status: number | null;
  stdout: string;
  stderr: string;
} {
  const base: Record<string, string> = {
    PATH: process.env.PATH ?? "",
    PGPASSWORD: "placeholder",
    JWT_SECRET: "x".repeat(32),
  };
  try {
    const stdout = execFileSync(process.execPath, ["--import", "tsx", "-e", code], {
      env: { ...base, ...extraEnv },
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { status: 0, stdout, stderr: "" };
  } catch (err) {
    const e = err as { status: number | null; stdout: string; stderr: string };
    return { status: e.status, stdout: e.stdout ?? "", stderr: e.stderr ?? "" };
  }
}

const IMPORT_ENV = 'await import("./src/config/env.ts");';

describe("config/env.ts", () => {
  it("falla al arrancar sin PGPASSWORD", () => {
    const r = runInChild(IMPORT_ENV, { PGPASSWORD: "", NODE_ENV: "development" });
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /PGPASSWORD/);
  });

  it("falla si JWT_SECRET es demasiado corto", () => {
    const r = runInChild(IMPORT_ENV, { JWT_SECRET: "corto", NODE_ENV: "development" });
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /JWT_SECRET/);
  });

  it("falla en produccion si falta CORS_ORIGINS", () => {
    const r = runInChild(IMPORT_ENV, { NODE_ENV: "production", CORS_ORIGINS: "" });
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /CORS_ORIGINS/);
  });

  it("arranca en produccion con CORS_ORIGINS definido", () => {
    const r = runInChild(IMPORT_ENV, { NODE_ENV: "production", CORS_ORIGINS: "https://allpaca.mx" });
    assert.equal(r.status, 0, r.stderr);
  });

  it("separa CORS_ORIGINS por comas y descarta vacios", () => {
    const r = runInChild(
      'const m = await import("./src/config/env.ts"); console.log(JSON.stringify(m.corsOrigins));',
      { NODE_ENV: "production", CORS_ORIGINS: " https://a.mx , ,https://b.mx " },
    );
    assert.equal(r.status, 0, r.stderr);
    // `tsx --import` imprime su banner por stdout; la ultima linea es la nuestra.
    const lastLine = r.stdout.trim().split(/\r?\n/).at(-1) ?? "";
    assert.deepEqual(JSON.parse(lastLine), ["https://a.mx", "https://b.mx"]);
  });
});

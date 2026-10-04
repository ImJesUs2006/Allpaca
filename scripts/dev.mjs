#!/usr/bin/env node
// Levanta API y cliente a la vez, con los logs etiquetados por prefijo.
// Evita depender de concurrently/npm-run-all para no anadir dependencias.
import { spawn } from "node:child_process";

const IS_WINDOWS = process.platform === "win32";

/**
 * En Windows `spawn("npm.cmd", ..., { shell: false })` falla con EINVAL,
 * asi que el comando se delega a cmd.exe explicitamente.
 */
function spawnNpm(cwd, args, env) {
  const childEnv = { ...process.env, ...env };
  if (IS_WINDOWS) {
    return spawn(
      process.env.ComSpec ?? "cmd.exe",
      ["/d", "/s", "/c", ["npm", ...args].join(" ")],
      { cwd, stdio: ["ignore", "pipe", "pipe"], windowsVerbatimArguments: false, env: childEnv },
    );
  }
  return spawn("npm", args, { cwd, stdio: ["ignore", "pipe", "pipe"], env: childEnv });
}

// Los scripts de prueba (e2e.ps1) levantan el stack en otros puertos y contra
// la base desechable `allpaca_test`. Sin estas variables, `npm run dev` se
// comporta exactamente como antes: 3000/4200 y la base de .env.
const API_PORT = process.env.API_PORT || "3000";
const WEB_PORT = process.env.WEB_PORT || "4200";
const API_TARGET = process.env.API_TARGET || `http://localhost:${API_PORT}`;

const TARGETS = [
  { name: "api", cwd: "server", args: ["run", "dev"], env: { PORT: API_PORT } },
  { name: "web", cwd: "client", args: ["run", "start", "--", "--port", WEB_PORT], env: { API_TARGET } },
];

const COLORS = { api: "[36m", web: "[35m" };
const RESET = "[0m";

let shuttingDown = false;
const children = [];

function prefixLines(name, chunk) {
  const color = COLORS[name] ?? "";
  for (const line of chunk.toString().split(/\r?\n/)) {
    if (line.trim() === "") continue;
    process.stdout.write(`${color}[${name}]${RESET} ${line}\n`);
  }
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (child.exitCode === null && child.signalCode === null) child.kill();
  }
  process.exit(code);
}

for (const target of TARGETS) {
  const child = spawnNpm(target.cwd, target.args, target.env);

  child.stdout.on("data", (c) => prefixLines(target.name, c));
  child.stderr.on("data", (c) => prefixLines(target.name, c));

  child.on("error", (err) => {
    prefixLines(target.name, `no se pudo iniciar: ${err.message}`);
    shutdown(1);
  });

  child.on("exit", (code, signal) => {
    prefixLines(target.name, `terminado (code=${code} signal=${signal})`);
    // Si uno cae, cae el otro: no dejar un API huerfano sin su consumidor.
    shutdown(code ?? 1);
  });

  children.push(child);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

console.log(`[dev] api -> ${API_TARGET}`);
console.log(`[dev] web -> http://localhost:${WEB_PORT}`);
console.log("[dev] Ctrl+C para detener ambos\n");

import { config } from "dotenv";
import { z } from "zod";

config();

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  PGHOST: z.string().default("localhost"),
  PGPORT: z.coerce.number().int().positive().default(5432),
  PGDATABASE: z.string().default("allpaca"),
  PGUSER: z.string().default("allpaca"),
  PGPASSWORD: z.string().min(1, "PGPASSWORD es obligatorio"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET debe tener al menos 32 caracteres"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  // bcryptjs es JS puro: 12 rondas tardan ~1-2s por hash. En produccion se deja
  // 12, pero los tests bajan a 4 (BCRYPT_ROUNDS=4) para no tardar medio minuto.
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(12),
  // Allowlist de origenes separada por comas. Obligatoria en produccion: sin ella
  // el CORS queda abierto a cualquier sitio y combinado con `credentials: true`
  // permite que un origen arbitrario use la sesion del usuario.
  CORS_ORIGINS: z.string().default(""),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(
    `Configuracion invalida. Revisa server/.env:\n${issues}\n\n` +
      `Copia server/.env.example a server/.env y completa los valores.`,
  );
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";

/**
 * Origenes permitidos. En produccion no hay fallback: si falta `CORS_ORIGINS`
 * se falla al arrancar en vez de servir la API abierta a internet.
 */
export const corsOrigins: string[] = env.CORS_ORIGINS.split(",")
  .map((o) => o.trim())
  .filter(Boolean);

if (isProd && corsOrigins.length === 0) {
  throw new Error(
    "CORS_ORIGINS es obligatorio en produccion. Ej: CORS_ORIGINS=https://allpaca.mx",
  );
}

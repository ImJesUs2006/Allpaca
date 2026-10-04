import bcrypt from "bcryptjs";
import { env } from "../../config/env.js";
import { one, many } from "../../db/pool.js";
import { ApiError } from "../../middleware/errors.js";
import type { AuthUser } from "../../middleware/auth.js";
import type { LoginInput, RegisterInput, UpdateProfileInput } from "./schemas.js";

const BCRYPT_ROUNDS = env.BCRYPT_ROUNDS;

export interface PublicUser {
  id: number;
  email: string;
  handle: string;
  name: string;
  avatar_url: string | null;
  bio: string;
  location: string;
  rating: number;
  verified: boolean;
  created_at: string;
}

const PUBLIC_COLUMNS = `id, email, handle, name, avatar_url, bio, location,
                        rating, verified, created_at`;

/**
 * Comparacion en tiempo constante contra un hash falso cuando el usuario no
 * existe, para que el tiempo de respuesta no revele si un email esta registrado.
 */
const DUMMY_HASH = "$2b$12$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012345";

export async function register(input: RegisterInput): Promise<PublicUser> {
  const existing = await one<{ id: number }>(
    "SELECT id FROM users WHERE email = $1 OR handle = $2",
    [input.email, input.handle],
  );
  if (existing) throw ApiError.conflict("Ese email o usuario ya esta registrado");

  const password_hash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const user = await one<PublicUser>(
    `INSERT INTO users (email, password_hash, handle, name, location)
     VALUES ($1, $2, $3, $4, COALESCE($5, ''))
     RETURNING ${PUBLIC_COLUMNS}`,
    [input.email, password_hash, input.handle, input.name, input.location ?? null],
  );

  if (!user) throw new Error("No se pudo crear el usuario");
  return user;
}

export async function login(input: LoginInput): Promise<PublicUser> {
  const row = await one<PublicUser & { password_hash: string }>(
    `SELECT ${PUBLIC_COLUMNS}, password_hash FROM users WHERE email = $1`,
    [input.email],
  );

  const hash = row?.password_hash ?? DUMMY_HASH;
  const ok = await bcrypt.compare(input.password, hash);

  if (!row || !ok) {
    // Mismo mensaje para email inexistente y contrasena incorrecta.
    throw ApiError.unauthorized("Credenciales incorrectas");
  }

  const { password_hash: _discarded, ...user } = row;
  return user;
}

export function toAuthUser(u: PublicUser): AuthUser {
  return { id: u.id, email: u.email, handle: u.handle, name: u.name };
}

export async function getProfile(id: number): Promise<PublicUser> {
  const user = await one<PublicUser>(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`, [id]);
  if (!user) throw ApiError.notFound("Usuario no encontrado");
  return user;
}

export async function updateProfile(
  id: number,
  input: UpdateProfileInput,
): Promise<PublicUser> {
  const user = await one<PublicUser>(
    `UPDATE users SET
       name       = COALESCE($2, name),
       bio        = COALESCE($3, bio),
       location   = COALESCE($4, location),
       avatar_url = COALESCE($5, avatar_url)
     WHERE id = $1
     RETURNING ${PUBLIC_COLUMNS}`,
    [id, input.name ?? null, input.bio ?? null, input.location ?? null, input.avatar_url ?? null],
  );
  if (!user) throw ApiError.notFound("Usuario no encontrado");
  return user;
}

/** Listado publico para poblar selectores de comprador/vendedor. */
export async function listPublicUsers(limit = 50): Promise<PublicUser[]> {
  return many<PublicUser>(
    `SELECT ${PUBLIC_COLUMNS} FROM users ORDER BY id LIMIT $1`,
    [limit],
  );
}

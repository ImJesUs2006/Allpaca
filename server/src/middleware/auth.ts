import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { one } from "../db/pool.js";
import { ApiError } from "./errors.js";

export interface AuthUser {
  id: number;
  email: string;
  handle: string;
  name: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signToken(user: AuthUser): string {
  return jwt.sign({ sub: String(user.id), email: user.email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7).trim();
  return null;
}

/**
 * Verifica el JWT y recarga el usuario desde la BD en cada peticion.
 * Recargar es intencional: si el usuario se borra o cambia, el token viejo
 * no debe seguir dando acceso.
 */
export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = extractToken(req);
    if (!token) throw ApiError.unauthorized("Falta el token de autorizacion");

    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
    } catch {
      throw ApiError.unauthorized("Token invalido o expirado");
    }

    const id = Number(payload.sub);
    if (!Number.isInteger(id)) throw ApiError.unauthorized("Token malformado");

    const row = await one<AuthUser>(
      "SELECT id, email, handle, name FROM users WHERE id = $1",
      [id],
    );
    if (!row) throw ApiError.unauthorized("El usuario de este token ya no existe");

    req.user = row;
    next();
  } catch (err) {
    next(err);
  }
}

/** Igual que requireAuth pero no falla si no hay token. */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  if (!extractToken(req)) return next();
  return requireAuth(req, _res, next);
}

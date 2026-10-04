import type { Request } from "express";
import { ApiError } from "../middleware/errors.js";

/**
 * Express 5 tipa `req.params[x]` como `string | string[] | undefined`
 * (un param puede repetirse y llegar como array). Normalizamos a string.
 */
export function param(req: Request, name: string): string {
  const raw = req.params[name];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === undefined) throw ApiError.badRequest(`Falta el parametro "${name}"`);
  return value;
}

export function parseIdParam(req: Request, name = "id"): number {
  const raw = Array.isArray(req.params[name]) ? req.params[name]![0] : req.params[name];
  const id = Number(raw);
  if (raw === undefined || !Number.isInteger(id) || id <= 0) {
    throw ApiError.badRequest(`El parametro "${name}" debe ser un entero positivo`);
  }
  return id;
}

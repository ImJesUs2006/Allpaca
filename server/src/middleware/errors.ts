import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { isProd } from "../config/env.js";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, message, "BAD_REQUEST", details);
  }
  static unauthorized(message = "No autenticado") {
    return new ApiError(401, message, "UNAUTHORIZED");
  }
  static forbidden(message = "Acceso denegado") {
    return new ApiError(403, message, "FORBIDDEN");
  }
  static notFound(message = "Recurso no encontrado") {
    return new ApiError(404, message, "NOT_FOUND");
  }
  static conflict(message: string) {
    return new ApiError(409, message, "CONFLICT");
  }
}

/** Envuelve un handler async para que los rechazos lleguen al errorHandler. */
export function asyncHandler<T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    void Promise.resolve(fn(req as T, res, next)).catch(next);
  };
}

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound("Ruta no encontrada"));
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Datos invalidos", details: err.issues },
    });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  // Violacion de unicidad de Postgres (23505) -> 409 con mensaje legible.
  const pgCode = (err as { code?: string }).code;
  if (pgCode === "23505") {
    res.status(409).json({
      error: { code: "CONFLICT", message: "Ese registro ya existe" },
    });
    return;
  }

  console.error("[error] no controlado:", err);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Error interno del servidor",
      ...(isProd ? {} : { detail: (err as Error)?.message }),
    },
  });
}

import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email invalido").max(254),
  password: z
    .string()
    .min(8, "La contrasena debe tener al menos 8 caracteres")
    .max(200, "Contrasena demasiado larga"),
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .max(30)
    .regex(/^[a-z0-9._]+$/, "Solo letras, numeros, punto y guion bajo"),
  name: z.string().trim().min(1, "El nombre es obligatorio").max(80),
  location: z.string().trim().max(80).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email invalido"),
  password: z.string().min(1, "La contrasena es obligatoria"),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  bio: z.string().trim().max(500).optional(),
  location: z.string().trim().max(80).optional(),
  avatar_url: z.string().trim().url().max(500).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

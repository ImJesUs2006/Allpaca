import { z } from "zod";

export const CATEGORIES = ["Tops", "Bottoms", "Outerwear", "Headwear", "Accesorios"] as const;
export const STYLES = ["Y2K", "Avant Garde", "Streetwear", "Vintage 90s"] as const;

export const listProductsSchema = z.object({
  category: z.string().trim().optional(),
  size: z.string().trim().optional(),
  style: z.string().trim().optional(),
  q: z.string().trim().max(120).optional(),
  seller: z.coerce.number().int().positive().optional(),
  community: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).default(60),
  offset: z.coerce.number().int().min(0).default(0),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(120),
  price_cents: z.coerce.number().int().min(0).max(100_000_00),
  currency: z.string().trim().length(3).toUpperCase().default("USD"),
  image_url: z.string().trim().url().max(500),
  category: z.enum(CATEGORIES),
  size: z.string().trim().min(1).max(20),
  condition: z.string().trim().min(1).max(40),
  location: z.string().trim().min(1).max(80),
  styles: z.array(z.enum(STYLES)).max(8).default([]),
});

export type ListProductsQuery = z.infer<typeof listProductsSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;

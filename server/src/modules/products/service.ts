import { many, one, transaction } from "../../db/pool.js";
import { ApiError } from "../../middleware/errors.js";
import type { CreateProductInput, ListProductsQuery } from "./schemas.js";

/**
 * Formato de producto exposed al cliente. `price_cents` es entero; el formateo
 * a "$45" ocurre en el cliente (server/src -> shared en el front).
 */
export interface ProductDTO {
  id: number;
  name: string;
  price_cents: number;
  currency: string;
  image_url: string;
  category: string;
  size: string;
  condition: string;
  location: string;
  seller: string;
  rating: number;
  verified: boolean;
  styles: string[];
}

const SELECT = `
  SELECT p.id, p.name, p.price_cents, p.currency, p.image_url, p.category,
         p.size, p.condition, p.location, p.rating, p.verified,
         u.handle AS seller,
         COALESCE(ARRAY(SELECT ps.style FROM product_styles ps WHERE ps.product_id = p.id), '{}') AS styles
  FROM products p
  JOIN users u ON u.id = p.seller_id
`;

export async function listProducts(q: ListProductsQuery): Promise<ProductDTO[]> {
  const where: string[] = [];
  const params: unknown[] = [];

  if (q.category && q.category !== "all") {
    // DESIGN.md §7: las pestanas agrupan categorias ("tops" -> Tops + Outerwear,
    // "accesorios" -> Headwear + Accesorios). Acepta lista separada por comas.
    const groups = q.category.split(",").map((c) => c.trim()).filter(Boolean);
    params.push(groups);
    where.push(`p.category = ANY($${params.length}::text[])`);
  }
  if (q.size) {
    const sizes = q.size.split(",").map((s) => s.trim()).filter(Boolean);
    params.push(sizes);
    where.push(`p.size = ANY($${params.length}::text[])`);
  }
  if (q.style) {
    const styles = q.style.split(",").map((s) => s.trim()).filter(Boolean);
    params.push(styles);
    where.push(
      `EXISTS (SELECT 1 FROM product_styles ps
              WHERE ps.product_id = p.id AND ps.style = ANY($${params.length}::text[]))`,
    );
  }
  if (q.seller) {
    params.push(q.seller);
    where.push(`p.seller_id = $${params.length}`);
  }
  if (q.community) {
    params.push(q.community);
    where.push(
      `EXISTS (SELECT 1 FROM community_products cp WHERE cp.product_id = p.id AND cp.community_id = $${params.length})`,
    );
  }
  if (q.q) {
    params.push(`%${q.q}%`);
    where.push(`p.name ILIKE $${params.length}`);
  }

  params.push(q.limit, q.offset);
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  return many<ProductDTO>(
    `${SELECT} ${whereSql} ORDER BY p.created_at DESC, p.id DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
}

export async function getProduct(id: number): Promise<ProductDTO> {
  const product = await one<ProductDTO>(`${SELECT} WHERE p.id = $1`, [id]);
  if (!product) throw ApiError.notFound("Producto no encontrado");
  return product;
}

export async function createProduct(
  sellerId: number,
  input: CreateProductInput,
): Promise<ProductDTO> {
  const id = await transaction(async (client) => {
    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO products
         (seller_id, name, price_cents, currency, image_url, category, size, condition, location)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id`,
      [
        sellerId,
        input.name,
        input.price_cents,
        input.currency,
        input.image_url,
        input.category,
        input.size,
        input.condition,
        input.location,
      ],
    );
    const newId = Number(rows[0]!.id);

    for (const style of input.styles) {
      await client.query(
        "INSERT INTO product_styles (product_id, style) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [newId, style],
      );
    }
    return newId;
  });

  return getProduct(id);
}

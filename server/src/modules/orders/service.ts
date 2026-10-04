import { many, one, transaction } from "../../db/pool.js";
import { ApiError } from "../../middleware/errors.js";
import type { CreateOrderInput, UpdateOrderStatusInput } from "./schemas.js";

/**
 * Pedido visto desde el comprador. `role` permite que el mismo endpoint
 * sirva las dos pestanas del dashboard (spec: usuario unico).
 */
export interface OrderDTO {
  id: number;
  code: string;
  product_id: number;
  product_name: string;
  product_image: string;
  counterparty: string;
  amount_cents: number;
  currency: string;
  status: string;
  tracking: string | null;
  role: "BUYER" | "SELLER";
  created_at: string;
}

const SELECT = `
  SELECT o.id, o.code, o.product_id, p.name AS product_name, p.image_url AS product_image,
         o.amount_cents, o.currency, o.status, o.tracking, o.created_at,
         CASE WHEN o.buyer_id = $1 THEN seller.handle ELSE buyer.handle END AS counterparty,
         CASE WHEN o.buyer_id = $1 THEN 'BUYER' ELSE 'SELLER' END AS role
  FROM orders o
  JOIN products p ON p.id = o.product_id
  JOIN users seller ON seller.id = o.seller_id
  JOIN users buyer  ON buyer.id  = o.buyer_id
`;

export async function listOrders(
  userId: number,
  role: "all" | "buyer" | "seller",
): Promise<OrderDTO[]> {
  const where =
    role === "buyer"
      ? "WHERE o.buyer_id = $1"
      : role === "seller"
        ? "WHERE o.seller_id = $1"
        : "WHERE (o.buyer_id = $1 OR o.seller_id = $1)";

  return many<OrderDTO>(
    `${SELECT} ${where} ORDER BY o.created_at DESC, o.id DESC`,
    [userId],
  );
}

/** Compra de un producto. Bloquea la fila del producto para evitar double-buy. */
export async function createOrder(
  buyerId: number,
  input: CreateOrderInput,
): Promise<OrderDTO> {
  const orderId = await transaction(async (client) => {
    const { rows } = await client.query<{
      id: string;
      seller_id: string;
      price_cents: number;
      currency: string;
      name: string;
    }>(
      `SELECT p.id, p.seller_id, p.price_cents, p.currency, p.name
       FROM products p WHERE p.id = $1 FOR UPDATE`,
      [input.product_id],
    );

    const product = rows[0];
    if (!product) throw ApiError.notFound("Producto no encontrado");

    const sellerId = Number(product.seller_id);
    if (sellerId === buyerId) throw ApiError.badRequest("No puedes comprar tu propio producto");

    // El codigo legible (AP-1042) se deriva del id real que asigna la secuencia.
    // Calcularlo con MAX(id)+1 antes del INSERT races: dos compras concurrentes
    // de productos distintos sacan el mismo codigo y chocan en el UNIQUE.
    // `txid_current()` da un valor unico por transaccion para el placeholder.
    const { rows: inserted } = await client.query<{ id: string }>(
      `INSERT INTO orders (code, product_id, buyer_id, seller_id, amount_cents, currency, status)
       VALUES ('TMP-' || txid_current()::text, $1, $2, $3, $4, $5, 'PENDIENTE')
       RETURNING id`,
      [input.product_id, buyerId, sellerId, product.price_cents, product.currency],
    );

    const newId = Number(inserted[0]!.id);
    await client.query("UPDATE orders SET code = $2 WHERE id = $1", [newId, `AP-${newId}`]);

    return newId;
  });

  const order = await one<OrderDTO>(`${SELECT} WHERE o.id = $2`, [buyerId, orderId]);
  if (!order) throw new Error("El pedido se creo pero no se pudo leer");
  return order;
}

/** Solo el comprador o el vendedor pueden cambiar el estado. */
export async function updateOrderStatus(
  userId: number,
  orderId: number,
  input: UpdateOrderStatusInput,
): Promise<OrderDTO> {
  const current = await one<{ buyer_id: string; seller_id: string }>(
    "SELECT buyer_id, seller_id FROM orders WHERE id = $1",
    [orderId],
  );
  if (!current) throw ApiError.notFound("Pedido no encontrado");
  if (Number(current.buyer_id) !== userId && Number(current.seller_id) !== userId) {
    throw ApiError.forbidden("No participas en este pedido");
  }

  await one(
    `UPDATE orders SET status = $2, tracking = COALESCE($3, tracking) WHERE id = $1 RETURNING id`,
    [orderId, input.status, input.tracking ?? null],
  );

  const order = await one<OrderDTO>(`${SELECT} WHERE o.id = $2`, [userId, orderId]);
  if (!order) throw ApiError.notFound("Pedido no encontrado");
  return order;
}

/** Dashboard: compras y ventas del usuario en una sola consulta. */
export async function dashboardSummary(userId: number) {
  const totals = await one<{
    sales_cents: number;
    sales_count: number;
    purchases_cents: number;
    purchases_count: number;
    inventory_count: number;
  }>(
    `SELECT
       COALESCE((SELECT SUM(amount_cents) FROM orders WHERE seller_id = $1 AND status <> 'CANCELADO'), 0)::bigint AS sales_cents,
       COALESCE((SELECT COUNT(*)                  FROM orders WHERE seller_id = $1 AND status <> 'CANCELADO'), 0)::bigint AS sales_count,
       COALESCE((SELECT SUM(amount_cents) FROM orders WHERE buyer_id  = $1 AND status <> 'CANCELADO'), 0)::bigint AS purchases_cents,
       COALESCE((SELECT COUNT(*)                  FROM orders WHERE buyer_id  = $1 AND status <> 'CANCELADO'), 0)::bigint AS purchases_count,
       COALESCE((SELECT COUNT(*) FROM products WHERE seller_id = $1), 0)::bigint AS inventory_count`,
    [userId],
  );

  const monthly = await many<{ month: string; revenue_cents: number; orders_count: number }>(
    `SELECT month, revenue_cents, orders_count
     FROM monthly_metrics WHERE user_id = $1 ORDER BY month`,
    [userId],
  );

  const traffic = await many<{ source: string; visits: number }>(
    "SELECT source, visits FROM traffic_sources WHERE user_id = $1 ORDER BY visits DESC",
    [userId],
  );

  const topProducts = await many<{ name: string; image_url: string; units: number }>(
    `SELECT p.name, p.image_url, tp.units
     FROM top_products tp JOIN products p ON p.id = tp.product_id
     WHERE tp.user_id = $1 ORDER BY tp.units DESC LIMIT 5`,
    [userId],
  );

  return { totals, monthly, traffic, topProducts };
}

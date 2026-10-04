import { z } from "zod";

export const createOrderSchema = z.object({
  product_id: z.coerce.number().int().positive(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDIENTE", "ENVIADO", "EN CAMINO", "ENTREGADO", "CANCELADO"]),
  tracking: z.string().trim().max(60).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

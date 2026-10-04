import { z } from "zod";

export const startConversationSchema = z.object({
  user_id: z.coerce.number().int().positive(),
  product_id: z.coerce.number().int().positive().optional(),
  body: z.string().trim().min(1, "El mensaje no puede estar vacio").max(2000),
});

export const sendMessageSchema = z.object({
  body: z.string().trim().min(1, "El mensaje no puede estar vacio").max(2000),
});

export type StartConversationInput = z.infer<typeof startConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;

import { many, one, transaction } from "../../db/pool.js";
import { ApiError } from "../../middleware/errors.js";
import type { SendMessageInput, StartConversationInput } from "./schemas.js";

export interface ConversationDTO {
  id: number;
  user: string;
  name: string;
  avatar_url: string | null;
  about: string | null;
  unread: number;
  last_time: string;
}

export interface MessageDTO {
  id: number;
  from: "me" | "them";
  body: string;
  time: string;
  created_at: string;
}

/** El par (user_a, user_b) se guarda siempre ordenado para que el UNIQUE funcione. */
function pair(a: number, b: number): [number, number] {
  return a < b ? [a, b] : [b, a];
}

export async function listConversations(userId: number): Promise<ConversationDTO[]> {
  return many<ConversationDTO>(
    `SELECT cv.id,
            u.handle AS user,
            u.name,
            u.avatar_url,
            p.name AS about,
            COALESCE((SELECT COUNT(*) FROM messages m
                      WHERE m.conversation_id = cv.id
                        AND m.sender_id <> $1
                        AND m.read_at IS NULL), 0)::int AS unread,
            to_char(cv.updated_at, 'HH24:MI') AS last_time
     FROM conversations cv
     JOIN users u ON u.id = CASE WHEN cv.user_a = $1 THEN cv.user_b ELSE cv.user_a END
     LEFT JOIN products p ON p.id = cv.product_id
     WHERE cv.user_a = $1 OR cv.user_b = $1
     ORDER BY cv.updated_at DESC`,
    [userId],
  );
}

export async function listMessages(
  userId: number,
  conversationId: number,
): Promise<MessageDTO[]> {
  const allowed = await one<{ id: number }>(
    "SELECT id FROM conversations WHERE id = $1 AND (user_a = $2 OR user_b = $2)",
    [conversationId, userId],
  );
  if (!allowed) throw ApiError.forbidden("No participas en esta conversacion");

  await one(
    "UPDATE messages SET read_at = now() WHERE conversation_id = $1 AND sender_id <> $2 AND read_at IS NULL RETURNING id",
    [conversationId, userId],
  );

  return many<MessageDTO>(
    `SELECT id,
            CASE WHEN sender_id = $2 THEN 'me' ELSE 'them' END AS from,
            body,
            to_char(created_at, 'HH24:MI') AS time,
            created_at
     FROM messages
     WHERE conversation_id = $1
     ORDER BY created_at`,
    [conversationId, userId],
  );
}

export async function startConversation(
  userId: number,
  input: StartConversationInput,
): Promise<number> {
  if (input.user_id === userId) throw ApiError.badRequest("No puedes chatear contigo");

  const other = await one<{ id: number }>("SELECT id FROM users WHERE id = $1", [input.user_id]);
  if (!other) throw ApiError.notFound("Usuario no encontrado");

  const [a, b] = pair(userId, input.user_id);

  const conversationId = await transaction(async (client) => {
    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO conversations (user_a, user_b, product_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_a, user_b, COALESCE(product_id, 0))
       DO UPDATE SET updated_at = now()
       RETURNING id`,
      [a, b, input.product_id ?? null],
    );
    const id = Number(rows[0]!.id);

    await client.query(
      "INSERT INTO messages (conversation_id, sender_id, body) VALUES ($1, $2, $3)",
      [id, userId, input.body],
    );
    await client.query("UPDATE conversations SET updated_at = now() WHERE id = $1", [id]);

    return id;
  });

  return conversationId;
}

export async function sendMessage(
  userId: number,
  conversationId: number,
  input: SendMessageInput,
): Promise<MessageDTO> {
  const allowed = await one<{ id: number }>(
    "SELECT id FROM conversations WHERE id = $1 AND (user_a = $2 OR user_b = $2)",
    [conversationId, userId],
  );
  if (!allowed) throw ApiError.forbidden("No participas en esta conversacion");

  const message = await transaction(async (client) => {
    const { rows } = await client.query<{ id: string; created_at: string }>(
      `INSERT INTO messages (conversation_id, sender_id, body)
       VALUES ($1, $2, $3)
       RETURNING id, created_at`,
      [conversationId, userId, input.body],
    );
    await client.query("UPDATE conversations SET updated_at = now() WHERE id = $1", [
      conversationId,
    ]);
    const row = rows[0]!;
    return {
      id: Number(row.id),
      from: "me" as const,
      body: input.body,
      time: new Date(row.created_at).toISOString().slice(11, 16),
      created_at: row.created_at,
    };
  });

  return message;
}

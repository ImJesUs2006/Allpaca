import { many, one, transaction } from "../../db/pool.js";
import { ApiError } from "../../middleware/errors.js";

export interface CommunityDTO {
  id: number;
  name: string;
  image_url: string;
  tag: string;
  members_count: number;
  drops_today: number;
  curator: string;
  location: string;
  description: string;
  rules: string[];
  members: { user: string; role: string; drops: number }[];
  is_member: boolean;
}

export interface CommunityMemberDTO {
  community_id: number;
  user_id: number;
  handle: string;
  name: string;
  avatar_url: string | null;
  role: string;
  drops: number;
}

const SELECT = `
  SELECT c.id, c.name, c.image_url, c.tag, c.members_count, c.drops_today,
         c.location, c.description,
         COALESCE(cur.handle, '') AS curator,
         COALESCE((SELECT ARRAY_AGG(r.rule ORDER BY r.position)
                   FROM community_rules r WHERE r.community_id = c.id), '{}') AS rules
  FROM communities c
  LEFT JOIN users cur ON cur.id = c.curator_id
`;

type CommunityRow = Omit<CommunityDTO, "members" | "is_member">;

async function attach(
  rows: CommunityRow[],
  viewerId: number | null,
): Promise<CommunityDTO[]> {
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const members = await many<CommunityMemberDTO>(
    `SELECT cm.community_id, cm.user_id, u.handle, u.name, u.avatar_url, cm.role, cm.drops
     FROM community_members cm
     JOIN users u ON u.id = cm.user_id
     WHERE cm.community_id = ANY($1::bigint[])
     ORDER BY cm.drops DESC`,
    [ids],
  );

  const byCommunity = new Map<number, CommunityMemberDTO[]>();
  for (const m of members) {
    const list = byCommunity.get(m.community_id) ?? [];
    list.push(m);
    byCommunity.set(m.community_id, list);
  }

  const mine = viewerId
    ? new Set(
        (
          await many<{ community_id: number }>(
            "SELECT community_id FROM community_members WHERE user_id = $1 AND community_id = ANY($2::bigint[])",
            [viewerId, ids],
          )
        ).map((r) => r.community_id),
      )
    : new Set<number>();

  return rows.map((r) => ({
    ...r,
    members: (byCommunity.get(r.id) ?? []).map((m) => ({
      user: `@${m.handle}`,
      role: m.role,
      drops: m.drops,
    })),
    is_member: mine.has(r.id),
  }));
}

export async function listCommunities(viewerId: number | null): Promise<CommunityDTO[]> {
  const rows = await many<CommunityRow>(`${SELECT} ORDER BY c.members_count DESC`);
  return attach(rows, viewerId);
}

export async function getCommunity(
  id: number,
  viewerId: number | null,
): Promise<CommunityDTO> {
  const row = await one<CommunityRow>(`${SELECT} WHERE c.id = $1`, [id]);
  if (!row) throw ApiError.notFound("Comunidad no encontrada");
  const [result] = await attach([row], viewerId);
  return result!;
}

/** Unirse es idempotente: joining twice no duplica ni lanza error. */
export async function joinCommunity(communityId: number, userId: number): Promise<void> {
  const exists = await one<{ id: number }>("SELECT id FROM communities WHERE id = $1", [
    communityId,
  ]);
  if (!exists) throw ApiError.notFound("Comunidad no encontrada");

  await transaction(async (client) => {
    const { rowCount } = await client.query(
      `INSERT INTO community_members (community_id, user_id, role)
       VALUES ($1, $2, 'EXPLORADOR')
       ON CONFLICT (community_id, user_id) DO NOTHING`,
      [communityId, userId],
    );
    if (rowCount && rowCount > 0) {
      await client.query(
        "UPDATE communities SET members_count = members_count + 1 WHERE id = $1",
        [communityId],
      );
    }
  });
}

export async function leaveCommunity(communityId: number, userId: number): Promise<void> {
  await transaction(async (client) => {
    const { rowCount } = await client.query(
      "DELETE FROM community_members WHERE community_id = $1 AND user_id = $2",
      [communityId, userId],
    );
    if (rowCount && rowCount > 0) {
      await client.query(
        `UPDATE communities SET members_count = GREATEST(members_count - 1, 0) WHERE id = $1`,
        [communityId],
      );
    }
  });
}

export async function listMyCommunities(userId: number): Promise<CommunityDTO[]> {
  const rows = await many<CommunityRow>(
    `${SELECT}
     JOIN community_members mine ON mine.community_id = c.id AND mine.user_id = $1
     ORDER BY mine.joined_at DESC`,
    [userId],
  );
  return attach(rows, userId);
}

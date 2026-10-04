/**
 * Seeds idempotentes. Traduce los arrays mock de src/App.tsx a filas reales.
 * Los precios pasan de string ("$45") a entero de centavos (4500).
 */
import bcrypt from "bcryptjs";
import { pool, query } from "./pool.js";

const DEMO_PASSWORD = "allpaca123";

interface SeedUser {
  email: string;
  handle: string;
  name: string;
  location: string;
  rating: number;
  verified: boolean;
  bio: string;
  avatar: string;
}

const USERS: SeedUser[] = [
  {
    email: "admin@allpaca.mx",
    handle: "admin",
    name: "Administrador ALLPACA",
    location: "CDMX, MEX",
    rating: 5.0,
    verified: true,
    bio: "Cuenta de prueba para QA.",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
  },
  {
    email: "thrifer@allpaca.mx",
    handle: "ThriferOax",
    name: "Thrifer Oaxaca",
    location: "Oaxaca, MEX",
    rating: 4.9,
    verified: true,
    bio: "Levanto piezas vintage desde Oaxaca. Denim bajo y mesh.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
  },
  {
    email: "coolfinds@allpaca.mx",
    handle: "CoolFinds",
    name: "Cool Finds",
    location: "CDMX, MEX",
    rating: 5.0,
    verified: true,
    bio: "Streetwear verificado. Envio a todo Mexico.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
  },
  {
    email: "vintageclub@allpaca.mx",
    handle: "VintageClub",
    name: "Vintage Club GDL",
    location: "Guadalajara, MEX",
    rating: 4.8,
    verified: true,
    bio: "Curacion de archivo y silueta sobre tendencia.",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop",
  },
  {
    email: "thriftgod@allpaca.mx",
    handle: "ThriftGod",
    name: "Thrift God MTY",
    location: "Monterrey, MEX",
    rating: 4.7,
    verified: true,
    bio: "Curacion de leather y outerwear pesado.",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=200&auto=format&fit=crop",
  },
  {
    email: "y2karchive@allpaca.mx",
    handle: "Y2K_Archive",
    name: "Y2K Archive",
    location: "Puebla, MEX",
    rating: 4.6,
    verified: true,
    bio: "Capsulas del 99 al 2005.",
    avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=200&auto=format&fit=crop",
  },
  {
    email: "luna@allpaca.mx",
    handle: "luna.thrift",
    name: "Luna Thrift",
    location: "CDMX, MEX",
    rating: 4.9,
    verified: false,
    bio: "Compradora compulsiva de archivo.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
  },
  {
    email: "mesh@allpaca.mx",
    handle: "mesh.kid",
    name: "Mesh Kid",
    location: "Puebla, MEX",
    rating: 4.5,
    verified: false,
    bio: "Y2K y mesh tops.",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&auto=format&fit=crop",
  },
];

interface SeedProduct {
  name: string;
  priceCents: number;
  image: string;
  category: string;
  size: string;
  condition: string;
  location: string;
  rating: number;
  verified: boolean;
  seller: string;
  styles: string[];
}

const IMG = (id: string) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=600&auto=format&fit=crop`;

const PRODUCTS: SeedProduct[] = [
  { name: "Vintage Noir Jacket", priceCents: 4500, image: IMG("1660486044177-45cd45bb5e99"), category: "Outerwear", size: "XL", condition: "Vintage 9/10", location: "Oaxaca, MEX", rating: 4.9, verified: true, seller: "ThriferOax", styles: ["Streetwear", "Vintage 90s"] },
  { name: "Urban Skater Cap", priceCents: 2000, image: IMG("1721637635502-b0abaaa75edb"), category: "Headwear", size: "OSFA", condition: "Deadstock", location: "CDMX, MEX", rating: 5.0, verified: true, seller: "CoolFinds", styles: ["Streetwear"] },
  { name: "Retro Checkered Coat", priceCents: 6500, image: IMG("1691689761290-2641cf0fc59a"), category: "Outerwear", size: "L", condition: "Gently Used", location: "Guadalajara, MEX", rating: 4.8, verified: false, seller: "VintageClub", styles: ["Vintage 90s", "Avant Garde"] },
  { name: "Leather Utility Jacket", priceCents: 8500, image: IMG("1576775068668-c147f14c36f7"), category: "Outerwear", size: "M", condition: "Like New", location: "Monterrey, MEX", rating: 4.7, verified: true, seller: "ThriftGod", styles: ["Streetwear"] },
  { name: "Y2K Cargo Pants", priceCents: 5000, image: IMG("1552374196-c4e7ffc6e126"), category: "Bottoms", size: "32", condition: "Good", location: "Puebla, MEX", rating: 4.4, verified: false, seller: "Y2K_Archive", styles: ["Y2K", "Streetwear"] },
  { name: "Oversized Graphic Tee", priceCents: 3000, image: IMG("1576566588028-4147f3842f27"), category: "Tops", size: "L", condition: "Like New", location: "CDMX, MEX", rating: 4.6, verified: true, seller: "CoolFinds", styles: ["Streetwear"] },
  { name: "Deconstructed Blazer", priceCents: 9500, image: IMG("1591047139829-d91aecb6caea"), category: "Outerwear", size: "S", condition: "Avant Garde", location: "Guadalajara, MEX", rating: 4.9, verified: true, seller: "VintageClub", styles: ["Avant Garde"] },
  { name: "Mesh Baby Tee", priceCents: 1800, image: IMG("1521572163474-6864f9cf17ab"), category: "Tops", size: "XS", condition: "Deadstock", location: "Puebla, MEX", rating: 4.3, verified: false, seller: "Y2K_Archive", styles: ["Y2K"] },
  { name: "Low Rise Bootcut", priceCents: 4200, image: IMG("1541099649105-f69ad21f3246"), category: "Bottoms", size: "30", condition: "Vintage 8/10", location: "Oaxaca, MEX", rating: 4.5, verified: true, seller: "ThriferOax", styles: ["Y2K", "Vintage 90s"] },
  { name: "Chrome Heart Hoodie", priceCents: 7200, image: IMG("1556821840-3a63f95609a7"), category: "Tops", size: "XL", condition: "Gently Used", location: "Monterrey, MEX", rating: 4.2, verified: false, seller: "ThriftGod", styles: ["Streetwear"] },
  { name: "Patchwork Denim Jacket", priceCents: 5800, image: IMG("1543076447-215ad9ba6923"), category: "Outerwear", size: "M", condition: "Handmade", location: "Guadalajara, MEX", rating: 4.8, verified: true, seller: "VintageClub", styles: ["Avant Garde", "Vintage 90s"] },
  { name: "Puffer Vest 90s", priceCents: 3900, image: IMG("1591047139829-d91aecb6caea"), category: "Outerwear", size: "OSFA", condition: "Vintage 9/10", location: "CDMX, MEX", rating: 4.1, verified: false, seller: "CoolFinds", styles: ["Vintage 90s"] },
];

interface SeedCommunity {
  name: string;
  image: string;
  tag: string;
  members: number;
  dropsToday: number;
  curator: string;
  location: string;
  description: string;
  rules: string[];
  membersList: { user: string; role: string; drops: number }[];
  drops: string[];
}

const COMMUNITIES: SeedCommunity[] = [
  {
    name: "Y2K ARCHIVES",
    image: "https://images.unsplash.com/photo-1492681290082-e932832941e6?q=80&w=800&auto=format&fit=crop",
    tag: "ARCHIVO",
    members: 1245,
    dropsToday: 34,
    curator: "Y2K_Archive",
    location: "Puebla, MEX",
    description:
      "Capsulas del 99 al 2005. Denim bajo, mesh, baby tees y todo lo que el internet temprano dejo atras.",
    rules: [
      "Solo prendas fabricadas entre 1998 y 2006.",
      "Foto real de la prenda, nada de catalogos.",
      "Precio visible en la descripcion o el drop se elimina.",
      "Cero replicas: si es fake, es ban.",
    ],
    membersList: [
      { user: "Y2K_Archive", role: "CURADOR", drops: 84 },
      { user: "ThriferOax", role: "DEALER", drops: 41 },
      { user: "CoolFinds", role: "DEALER", drops: 29 },
      { user: "mesh.kid", role: "EXPLORADOR", drops: 0 },
    ],
    drops: ["Y2K Cargo Pants", "Mesh Baby Tee", "Oversized Graphic Tee", "Low Rise Bootcut"],
  },
  {
    name: "AVANT GARDE",
    image: "https://images.unsplash.com/photo-1509631179647-0c739a4f686c?q=80&w=800&auto=format&fit=crop",
    tag: "DISENO",
    members: 872,
    dropsToday: 12,
    curator: "VintageClub",
    location: "Guadalajara, MEX",
    description:
      "Silueta sobre tendencia. Piezas deconstruidas, patronaje raro y disenadores independientes.",
    rules: [
      "Piezas con propuesta de diseno, no basics.",
      "Indica disenador o taller si lo conoces.",
      "Se permite hecho a mano y upcycling.",
      "Ficha de medidas obligatoria.",
    ],
    membersList: [
      { user: "VintageClub", role: "CURADOR", drops: 66 },
      { user: "ThriferOax", role: "DEALER", drops: 38 },
      { user: "admin", role: "DEALER", drops: 17 },
    ],
    drops: ["Deconstructed Blazer", "Patchwork Denim Jacket"],
  },
  {
    name: "STREETWEAR MX",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop",
    tag: "STREET",
    members: 2310,
    dropsToday: 58,
    curator: "CoolFinds",
    location: "CDMX, MEX",
    description:
      "El corazon del streetwear mexicano. Grafica pesada, silueta holgada y marcas locales.",
    rules: [
      "Foto con luz natural, sin catalogo.",
      "Describe el estado real de la prenda.",
      "Envio garantizado dentro de Mexico.",
    ],
    membersList: [
      { user: "CoolFinds", role: "CURADOR", drops: 112 },
      { user: "ThriftGod", role: "DEALER", drops: 54 },
      { user: "luna.thrift", role: "EXPLORADOR", drops: 0 },
    ],
    drops: ["Oversized Graphic Tee", "Urban Skater Cap", "Chrome Heart Hoodie"],
  },
  {
    name: "VINTAGE 90s",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop",
    tag: "ARCHIVO",
    members: 1503,
    dropsToday: 21,
    curator: "ThriftGod",
    location: "Monterrey, MEX",
    description:
      "Los 90 fueron CRT, bootcut y logotipos gigantes. Todo lo demas es ruido.",
    rules: [
      "Prenda de 1990 a 1999.",
      "Sin reproducciones modernas.",
      "Indica marca si la tienes legible.",
    ],
    membersList: [
      { user: "ThriftGod", role: "CURADOR", drops: 73 },
      { user: "VintageClub", role: "DEALER", drops: 45 },
      { user: "mesh.kid", role: "EXPLORADOR", drops: 0 },
    ],
    drops: ["Puffer Vest 90s", "Low Rise Bootcut", "Retro Checkered Coat"],
  },
];

interface SeedOrder {
  code: string;
  product: string;
  buyer: string;
  amountCents: number;
  status: string;
  tracking: string | null;
  daysAgo: number;
}

const ORDERS: SeedOrder[] = [
  { code: "AP-1042", product: "Vintage Noir Jacket", buyer: "luna.thrift", amountCents: 4500, status: "ENVIADO", tracking: null, daysAgo: 2 },
  { code: "AP-1041", product: "Urban Skater Cap", buyer: "mesh.kid", amountCents: 2000, status: "ENTREGADO", tracking: "MX-884213", daysAgo: 3 },
  { code: "AP-1040", product: "Retro Checkered Coat", buyer: "admin", amountCents: 6500, status: "PENDIENTE", tracking: null, daysAgo: 5 },
  { code: "AP-1039", product: "Leather Utility Jacket", buyer: "admin", amountCents: 8500, status: "ENTREGADO", tracking: "MX-883310", daysAgo: 7 },
  { code: "AP-1038", product: "Oversized Graphic Tee", buyer: "luna.thrift", amountCents: 3000, status: "ENTREGADO", tracking: "MX-882004", daysAgo: 9 },
];

async function seed(): Promise<void> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  console.log("[seed] usuarios...");
  for (const u of USERS) {
    await query(
      `INSERT INTO users (email, password_hash, handle, name, location, rating, verified, bio, avatar_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (email) DO UPDATE SET
         handle = EXCLUDED.handle, name = EXCLUDED.name, location = EXCLUDED.location,
         rating = EXCLUDED.rating, verified = EXCLUDED.verified,
         bio = EXCLUDED.bio, avatar_url = EXCLUDED.avatar_url`,
      [u.email, passwordHash, u.handle, u.name, u.location, u.rating, u.verified, u.bio, u.avatar],
    );
  }

  const { rows: users } = await query<{ id: string; handle: string }>(
    "SELECT id, handle FROM users",
  );
  const userId = new Map(users.map((r) => [r.handle, Number(r.id)]));

  console.log("[seed] productos...");
  for (const p of PRODUCTS) {
    const sellerId = userId.get(p.seller);
    if (!sellerId) throw new Error(`Seed invalido: vendedor "${p.seller}" no encontrado`);

    const existing = await query<{ id: string }>("SELECT id FROM products WHERE name = $1", [p.name]);
    let productId: number;

    if (existing.rows.length > 0) {
      productId = Number(existing.rows[0]!.id);
      await query(
        `UPDATE products SET price_cents=$2, image_url=$3, category=$4, size=$5,
           condition=$6, location=$7, rating=$8, verified=$9, seller_id=$10 WHERE id=$1`,
        [productId, p.priceCents, p.image, p.category, p.size, p.condition, p.location, p.rating, p.verified, sellerId],
      );
    } else {
      const created = await query<{ id: string }>(
        `INSERT INTO products (seller_id, name, price_cents, image_url, category, size, condition, location, rating, verified)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [sellerId, p.name, p.priceCents, p.image, p.category, p.size, p.condition, p.location, p.rating, p.verified],
      );
      productId = Number(created.rows[0]!.id);
    }

    for (const style of p.styles) {
      await query(
        "INSERT INTO product_styles (product_id, style) VALUES ($1,$2) ON CONFLICT DO NOTHING",
        [productId, style],
      );
    }
  }

  const { rows: products } = await query<{ id: string; name: string }>(
    "SELECT id, name FROM products",
  );
  const productId = new Map(products.map((r) => [r.name, Number(r.id)]));

  console.log("[seed] comunidades...");
  for (const c of COMMUNITIES) {
    const curatorId = userId.get(c.curator) ?? null;
    const { rows } = await query<{ id: string }>(
      `INSERT INTO communities (name, image_url, tag, members_count, drops_today, curator_id, location, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (name) DO UPDATE SET
         image_url = EXCLUDED.image_url, tag = EXCLUDED.tag,
         drops_today = EXCLUDED.drops_today, curator_id = EXCLUDED.curator_id,
         location = EXCLUDED.location, description = EXCLUDED.description
       RETURNING id`,
      [c.name, c.image, c.tag, c.members, c.dropsToday, curatorId, c.location, c.description],
    );
    const cid = Number(rows[0]!.id);

    await query("DELETE FROM community_rules WHERE community_id = $1", [cid]);
    for (const [i, rule] of c.rules.entries()) {
      await query(
        "INSERT INTO community_rules (community_id, position, rule) VALUES ($1,$2,$3)",
        [cid, i + 1, rule],
      );
    }

    for (const m of c.membersList) {
      const uid = userId.get(m.user);
      if (!uid) continue;
      await query(
        `INSERT INTO community_members (community_id, user_id, role, drops) VALUES ($1,$2,$3,$4)
         ON CONFLICT (community_id, user_id) DO UPDATE SET role = EXCLUDED.role, drops = EXCLUDED.drops`,
        [cid, uid, m.role, m.drops],
      );
    }

    for (const dropName of c.drops) {
      const pid = productId.get(dropName);
      if (!pid) continue;
      await query(
        "INSERT INTO community_products (community_id, product_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
        [cid, pid],
      );
    }
  }

  console.log("[seed] pedidos...");
  for (const o of ORDERS) {
    const pid = productId.get(o.product);
    if (!pid) throw new Error(`Seed invalido: producto "${o.product}" no encontrado`);

    const { rows: pRows } = await query<{ seller_id: string }>(
      "SELECT seller_id FROM products WHERE id = $1",
      [pid],
    );
    const sellerId = Number(pRows[0]!.seller_id);
    const buyerId = userId.get(o.buyer);
    if (!buyerId) throw new Error(`Seed invalido: comprador "${o.buyer}" no encontrado`);

    await query(
      `INSERT INTO orders (code, product_id, buyer_id, seller_id, amount_cents, currency, status, tracking, created_at)
       VALUES ($1,$2,$3,$4,$5,'USD',$6,$7, now() - ($8 || ' days')::interval)
       ON CONFLICT (code) DO UPDATE SET status = EXCLUDED.status, tracking = EXCLUDED.tracking`,
      [o.code, pid, buyerId, sellerId, o.amountCents, o.status, o.tracking, String(o.daysAgo)],
    );
  }

  console.log("[seed] conversaciones...");
  const lunaId = userId.get("luna.thrift");
  const thriferId = userId.get("ThriferOax");
  if (!lunaId || !thriferId) throw new Error("Seed invalido: faltan usuarios para la conversacion");

  const [a, b] = [lunaId, thriferId].sort((x, y) => x - y) as [number, number];
  const convProduct = productId.get("Vintage Noir Jacket") ?? null;

  const { rows: convRows } = await query<{ id: string }>(
    `INSERT INTO conversations (user_a, user_b, product_id) VALUES ($1,$2,$3)
     ON CONFLICT (user_a, user_b, COALESCE(product_id, 0)) DO UPDATE SET updated_at = now()
     RETURNING id`,
    [a, b, convProduct],
  );
  const conversationId = Number(convRows[0]!.id);

  const { rows: msgCount } = await query<{ n: number }>(
    "SELECT COUNT(*) AS n FROM messages WHERE conversation_id = $1",
    [conversationId],
  );
  // `n` es un bigint, y pool.ts parsea el OID 20 a number: comparar contra "0"
  // daria false siempre y el hilo nunca se insertaria.
  if (Number(msgCount[0]!.n) === 0) {
    const thread: [number, string, number][] = [
      [a, "Hola, sigue disponible el Vintage Noir Jacket?", 0],
      [b, "Si, sigue disponible. Talle XL, muy poco uso.", 1],
      [a, "Perfecto. Aceptas MXN o solo USD?", 3],
      [b, "Acepto ambas. MXN al tipo de cambio del dia.", 4],
      [a, "Va, procedo con la compra.", 26],
    ];
    for (const [sender, body, hoursAgo] of thread) {
      await query(
        "INSERT INTO messages (conversation_id, sender_id, body, created_at) VALUES ($1,$2,$3, now() - ($4 || ' hours')::interval)",
        [conversationId, sender, body, String(hoursAgo)],
      );
    }
  }

  console.log("[seed] metricas...");
  for (const uid of userId.values()) {
    const months = ["2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10"];
    for (const [i, month] of months.entries()) {
      await query(
        `INSERT INTO monthly_metrics (user_id, month, revenue_cents, orders_count, visitors)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT (user_id, month) DO NOTHING`,
        [uid, month, 12000 + i * 4500, 4 + i, 320 + i * 90],
      );
    }
    const sources: [string, number][] = [
      ["Instagram", 1840],
      ["Busqueda organica", 920],
      ["Directo", 610],
      ["TikTok", 430],
    ];
    for (const [source, visits] of sources) {
      await query(
        `INSERT INTO traffic_sources (user_id, source, visits) VALUES ($1,$2,$3)
         ON CONFLICT (user_id, source) DO UPDATE SET visits = EXCLUDED.visits`,
        [uid, source, visits],
      );
    }
  }

  const metricsOwner = userId.get("ThriferOax");
  if (!metricsOwner) throw new Error('Seed invalido: usuario "ThriferOax" no encontrado');

  for (const [name, units] of [
    ["Vintage Noir Jacket", 12],
    ["Urban Skater Cap", 9],
    ["Retro Checkered Coat", 7],
  ] as const) {
    const pid = productId.get(name);
    if (!pid) continue;
    await query(
      `INSERT INTO top_products (user_id, product_id, units) VALUES ($1,$2,$3)
       ON CONFLICT (user_id, product_id) DO UPDATE SET units = EXCLUDED.units`,
      [metricsOwner, pid, units],
    );
  }

  console.log(`\n[seed] listo. ${USERS.length} usuarios, ${PRODUCTS.length} productos, ${COMMUNITIES.length} comunidades, ${ORDERS.length} pedidos.`);
  console.log(`[seed] login de prueba: admin@allpaca.mx / ${DEMO_PASSWORD}`);
}

seed()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (err: Error) => {
    console.error("[seed] fallo:", err.message);
    await pool.end();
    process.exit(1);
  });

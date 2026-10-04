/**
 * Contrato de datos compartido con la API (server/src/modules/*).
 * Espeja los DTOs que devuelve Express. Los precios SIEMPRE en centavos.
 */

export interface User {
  id: number;
  email: string;
  handle: string;
  name: string;
  avatar_url: string | null;
  bio: string;
  location: string;
  rating: number;
  verified: boolean;
  created_at: string;
}

export interface Product {
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

export interface Community {
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

export type OrderStatus =
  | 'PENDIENTE'
  | 'ENVIADO'
  | 'EN CAMINO'
  | 'ENTREGADO'
  | 'CANCELADO';

export interface Order {
  id: number;
  code: string;
  product_id: number;
  product_name: string;
  product_image: string;
  counterparty: string;
  amount_cents: number;
  currency: string;
  status: OrderStatus;
  tracking: string | null;
  role: 'BUYER' | 'SELLER';
  created_at: string;
}

export interface Conversation {
  id: number;
  user: string;
  name: string;
  avatar_url: string | null;
  about: string | null;
  unread: number;
  last_time: string;
}

export interface Message {
  id: number;
  from: 'me' | 'them';
  body: string;
  time: string;
  created_at: string;
}

export interface DashboardSummary {
  totals: {
    sales_cents: number;
    sales_count: number;
    purchases_cents: number;
    purchases_count: number;
    inventory_count: number;
  };
  monthly: { month: string; revenue_cents: number; orders_count: number }[];
  traffic: { source: string; visits: number }[];
  topProducts: { name: string; image_url: string; units: number }[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: { path?: (string | number)[]; message: string }[];
  };
}

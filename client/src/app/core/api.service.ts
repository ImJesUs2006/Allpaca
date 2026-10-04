import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type {
  Community,
  Conversation,
  DashboardSummary,
  Message,
  Order,
  Product,
  User,
} from './api.models';

/**
 * Cliente HTTP tipado de la API. Una sola capa para que las vistas nunca
 * toquen URLs crudas.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  // ------------------------------------------------------------- productos
  async products(filters: {
    category?: string;
    size?: string;
    style?: string;
    q?: string;
    seller?: number;
    community?: number;
    limit?: number;
  } = {}): Promise<Product[]> {
    const params = cleanParams(filters);
    const res = await firstValueFrom(
      this.http.get<{ products: Product[] }>('/api/products', { params }),
    );
    return res.products;
  }

  // ----------------------------------------------------------- comunidades
  async communities(): Promise<Community[]> {
    const res = await firstValueFrom(
      this.http.get<{ communities: Community[] }>('/api/communities'),
    );
    return res.communities;
  }

  async community(id: number): Promise<Community> {
    const res = await firstValueFrom(
      this.http.get<{ community: Community }>(`/api/communities/${id}`),
    );
    return res.community;
  }

  /** Idempotente en el servidor: unirse dos veces no duplica ni error. */
  async joinCommunity(id: number): Promise<void> {
    await firstValueFrom(this.http.post<void>(`/api/communities/${id}/join`, {}));
  }

  async leaveCommunity(id: number): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`/api/communities/${id}/join`));
  }

  // --------------------------------------------------------------- pedidos
  async orders(role: 'all' | 'buyer' | 'seller' = 'all'): Promise<Order[]> {
    const res = await firstValueFrom(
      this.http.get<{ orders: Order[] }>('/api/orders', { params: { role } }),
    );
    return res.orders;
  }

  async summary(): Promise<DashboardSummary> {
    return firstValueFrom(this.http.get<DashboardSummary>('/api/orders/summary'));
  }

  async buy(productId: number): Promise<Order> {
    const res = await firstValueFrom(
      this.http.post<{ order: Order }>('/api/orders', { product_id: productId }),
    );
    return res.order;
  }

  async setOrderStatus(id: number, status: string, tracking?: string): Promise<void> {
    await firstValueFrom(
      this.http.patch(`/api/orders/${id}/status`, { status, tracking }),
    );
  }

  // -------------------------------------------------------------- mensajes
  async conversations(): Promise<Conversation[]> {
    const res = await firstValueFrom(
      this.http.get<{ conversations: Conversation[] }>('/api/messages'),
    );
    return res.conversations;
  }

  async messages(conversationId: number): Promise<Message[]> {
    const res = await firstValueFrom(
      this.http.get<{ messages: Message[] }>(`/api/messages/${conversationId}`),
    );
    return res.messages;
  }

  async send(conversationId: number, body: string): Promise<Message> {
    const res = await firstValueFrom(
      this.http.post<{ message: Message }>(`/api/messages/${conversationId}`, { body }),
    );
    return res.message;
  }

  // --------------------------------------------------------------- usuarios
  async directoryUsers(): Promise<User[]> {
    const res = await firstValueFrom(this.http.get<{ users: User[] }>('/api/auth/directory'));
    return res.users;
  }
}

/**
 * Extrae un mensaje legible de un HttpErrorResponse. El servidor devuelve
 * { error: { code, message, details } } y 422/400 traen `details` de Zod.
 */
export function apiErrorMessage(err: unknown): string {
  if (!(err instanceof HttpErrorResponse)) {
    return 'Ocurrio un error inesperado';
  }
  if (err.status === 0) {
    return 'No hay conexion con el servidor. Revisa que la API este corriendo.';
  }
  const body = err.error as { error?: { message?: string; details?: { message: string }[] } };
  const details = body?.error?.details;
  if (details?.length) return details.map((d) => d.message).join('. ');
  return body?.error?.message ?? `Error ${err.status}`;
}

function cleanParams<T extends Record<string, unknown>>(obj: T): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null && v !== '' && v !== 'all') out[k] = String(v);
  }
  return out;
}

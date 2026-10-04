import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { LucideSend } from '@lucide/angular';
import { apiErrorMessage, ApiService } from '../../core/api.service';
import type { Conversation, DashboardSummary, Message, Order, Product } from '../../core/api.models';
import { AuthService } from '../../core/auth.service';
import { CurrencyService } from '../../core/currency.service';
import { StatusBadge } from '../../shared/status-badge';

/** Pestanas — DESIGN.md §7 (mismas que el prototipo React). */
const TABS = ['Inventario', 'Mis Compras', 'Mis Ventas', 'Mensajes', 'Analiticas'] as const;
type Tab = (typeof TABS)[number];

/**
 * Dashboard. Portado de App.tsx:1441-1494 (DashboardView) y sus paneles
 * (InventoryPanel 1021, PurchasesPanel 1075, SalesPanel 1139,
 * MessagesPanel 1226, AnalyticsPanel 1357).
 *
 * Mejora sobre el prototipo: los datos vienen de la API y las compras/ventas
 * son las mismas filas vistas desde el otro lado (spec: usuario unico).
 */
@Component({
  selector: 'app-dashboard-page',
  imports: [StatusBadge, LucideSend],
  templateUrl: './dashboard.html',
})
export class DashboardPage implements OnInit {
  private readonly api = inject(ApiService);
  readonly currency = inject(CurrencyService);
  readonly auth = inject(AuthService);

  readonly tabs = TABS;
  readonly activeTab = signal<Tab>('Inventario');

  readonly summary = signal<DashboardSummary | null>(null);
  readonly inventory = signal<Product[]>([]);
  readonly purchases = signal<Order[]>([]);
  readonly sales = signal<Order[]>([]);
  readonly conversations = signal<Conversation[]>([]);
  readonly thread = signal<Message[]>([]);
  readonly draft = signal('');

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly activeConversation = signal<number | null>(null);

  readonly unreadTotal = computed(() =>
    this.conversations().reduce((sum, c) => sum + c.unread, 0),
  );

  /** Maximo de ingresos por mes, para escalar las barras del grafico. */
  readonly maxRevenue = computed(() => {
    const monthly = this.summary()?.monthly ?? [];
    return Math.max(1, ...monthly.map((m) => m.revenue_cents));
  });

  readonly maxTraffic = computed(() => {
    const traffic = this.summary()?.traffic ?? [];
    return Math.max(1, ...traffic.map((t) => t.visits));
  });

  ngOnInit(): void {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const me = this.auth.user();
      if (!me) throw new Error('Sin sesion');

      const [summary, inventory, orders, conversations] = await Promise.all([
        this.api.summary(),
        // El inventario es lo publicado por ESTE usuario, no el catalogo completo.
        this.api.products({ seller: me.id, limit: 50 }),
        this.api.orders('all'),
        this.api.conversations(),
      ]);
      this.summary.set(summary);
      this.inventory.set(inventory);
      this.purchases.set(orders.filter((o) => o.role === 'BUYER'));
      this.sales.set(orders.filter((o) => o.role === 'SELLER'));
      this.conversations.set(conversations);
    } catch (err) {
      this.error.set(apiErrorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }

  money(cents: number): string {
    return this.currency.formatConverted(cents);
  }

  async openConversation(id: number): Promise<void> {
    this.activeConversation.set(id);
    try {
      this.thread.set(await this.api.messages(id));
    } catch (err) {
      this.error.set(apiErrorMessage(err));
    }
  }

  async send(): Promise<void> {
    const conversationId = this.activeConversation();
    const body = this.draft().trim();
    if (!conversationId || !body) return;

    this.draft.set('');
    try {
      const message = await this.api.send(conversationId, body);
      this.thread.update((list) => [...list, message]);
    } catch (err) {
      this.error.set(apiErrorMessage(err));
    }
  }

  monthLabel(month: string): string {
    const [year, m] = month.split('-');
    const names = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return `${names[Number(m) - 1] ?? m} ${year?.slice(2)}`;
  }
}

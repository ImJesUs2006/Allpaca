import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideX } from '@lucide/angular';
import { apiErrorMessage, ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { CartService } from '../core/cart.service';
import { CurrencyService } from '../core/currency.service';

interface Feedback {
  kind: 'ok' | 'error';
  text: string;
}

/**
 * Drawer del carrito. Portado de App.tsx (seccion del drawer).
 * DESIGN.md §5 — overlay `fixed inset-0 z-50`, panel derecho `max-w-md`,
 * negro, `border-l-8`, boton CHECKOUT grande.
 *
 * Mejora sobre el prototipo: el checkout ahora crea pedidos reales via API en
 * lugar de ser decorativo.
 */
@Component({
  selector: 'app-cart-drawer',
  imports: [LucideX],
  templateUrl: './cart-drawer.html',
})
export class CartDrawer {
  readonly cart = inject(CartService);
  readonly currency = inject(CurrencyService);
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly busy = signal(false);
  readonly feedback = signal<Feedback | null>(null);

  /** Suma ya convertida a la divisa activa. */
  readonly total = computed(() =>
    this.cart
      .items()
      .reduce((sum, p) => sum + this.currency.convertFromUsdCents(p.price_cents), 0),
  );

  priceOf(cents: number): string {
    return this.currency.format(this.currency.convertFromUsdCents(cents));
  }

  remove(id: number): void {
    this.cart.remove(id);
  }

  close(): void {
    this.cart.close();
    this.feedback.set(null);
  }

  async checkout(): Promise<void> {
    if (!this.auth.isAuthenticated()) {
      this.cart.close();
      void this.router.navigate(['/login'], { queryParams: { redirect: '/directorio' } });
      return;
    }

    this.busy.set(true);
    this.feedback.set(null);
    try {
      for (const product of this.cart.items()) {
        await this.api.buy(product.id);
      }
      const count = this.cart.count();
      this.cart.clear();
      this.cart.close();
      this.feedback.set({
        kind: 'ok',
        text:
          count === 1
            ? 'Compra registrada. Ya aparece en tu dashboard.'
            : `${count} compras registradas. Ya aparecen en tu dashboard.`,
      });
    } catch (err) {
      this.feedback.set({ kind: 'error', text: apiErrorMessage(err) });
    } finally {
      this.busy.set(false);
    }
  }
}

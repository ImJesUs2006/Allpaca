import { Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { LucideCheck, LucideMapPin, LucideShoppingCart, LucideStar } from '@lucide/angular';
import type { Product } from '../core/api.models';
import { AuthService } from '../core/auth.service';
import { CartService } from '../core/cart.service';
import { CurrencyService } from '../core/currency.service';

/**
 * Tarjeta de producto. Portado de App.tsx:496-542 (ProductCard).
 * DESIGN.md §5 — ancho minimo 280px, `snap-start`, sin transicion (cambio B/N
 * instantaneo), se invierte entera en hover.
 */
@Component({
  selector: 'app-product-card',
  imports: [LucideMapPin, LucideStar, LucideShoppingCart, LucideCheck],
  templateUrl: './product-card.html',
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly added = output<Product>();

  private readonly cart = inject(CartService);
  private readonly auth = inject(AuthService);
  private readonly currency = inject(CurrencyService);
  private readonly router = inject(Router);

  readonly inCart = computed(() => this.cart.has(this.product().id));
  /** DESIGN.md §8 — conversion de divisa al vuelo. */
  readonly price = computed(() => this.currency.formatConverted(this.product().price_cents));

  addToCart(event: Event): void {
    event.stopPropagation();
    // Sin sesion el boton dead es peor que nada: se manda a entrar y se vuelve
    // a esta pagina con ?redirect= para no perder el contexto.
    if (!this.auth.isAuthenticated()) {
      const back = this.router.url;
      void this.router.navigate(['/login'], { queryParams: { redirect: back } });
      return;
    }
    this.cart.add(this.product());
    this.added.emit(this.product());
  }
}

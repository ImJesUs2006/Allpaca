import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideChevronDown,
  LucideLogOut,
  LucideMenu,
  LucideSearch,
  LucideShoppingCart,
  LucideUser,
  LucideX,
} from '@lucide/angular';
import { AuthService } from '../core/auth.service';
import { CartService } from '../core/cart.service';
import { CURRENCIES, CurrencyService, type CurrencyCode } from '../core/currency.service';

@Component({
  selector: 'app-site-header',
  imports: [
    RouterLink,
    RouterLinkActive,
    LucideSearch,
    LucideUser,
    LucideShoppingCart,
    LucideMenu,
    LucideX,
    LucideChevronDown,
    LucideLogOut,
  ],
  templateUrl: './site-header.html',
})
export class SiteHeader {
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);
  readonly cart = inject(CartService);
  readonly currency = inject(CurrencyService);
  readonly currencies = CURRENCIES;

  /** DESIGN.md §5: en el landing el header es transparente hasta que hay scroll. */
  private readonly _scrolled = signal(false);
  private readonly _isLanding = signal(false);
  private readonly _searchOpen = signal(false);
  private readonly _menuOpen = signal(false);
  private readonly _currencyOpen = signal(false);

  readonly searchOpen = this._searchOpen.asReadonly();
  readonly menuOpen = this._menuOpen.asReadonly();
  readonly currencyOpen = this._currencyOpen.asReadonly();

  /** Solido = blanco con borde inferior. Transparente solo en el hero. */
  readonly isSolid = computed(() => !this._isLanding() || this._scrolled());

  constructor() {
    this._isLanding.set(this.router.url === '/' || this.router.url.startsWith('/?'));
    this.router.events.subscribe(() => {
      this._isLanding.set(this.router.url === '/');
      this._menuOpen.set(false);
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this._scrolled.set(window.scrollY > 20);
  }

  toggleSearch(): void {
    this._searchOpen.update((v) => !v);
  }

  toggleMenu(): void {
    this._menuOpen.update((v) => !v);
  }

  toggleCurrency(): void {
    this._currencyOpen.update((v) => !v);
  }

  pickCurrency(code: CurrencyCode): void {
    this.currency.set(code);
    this._currencyOpen.set(false);
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    void this.router.navigate(['/directorio'], { queryParams: value ? { q: value } : {} });
    this._searchOpen.set(false);
  }

  logout(): void {
    this.cart.clear();
    this.auth.logout();
  }
}

import { Injectable, computed, effect, signal } from '@angular/core';
import type { Product } from './api.models';

const CART_KEY = 'allpaca.cart';

/**
 * Carrito en signals + localStorage. El prototipo React lo tenia como
 * `useState` en App.tsx, lo que hacia que se perdiera al recargar.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<Product[]>(readCart());
  private readonly _open = signal(false);

  readonly items = this._items.asReadonly();
  readonly isOpen = this._open.asReadonly();
  readonly count = computed(() => this._items().length);

  constructor() {
    // Persiste en cada cambio; `effect` corre dentro del contexto de inyeccion.
    effect(() => {
      localStorage.setItem(CART_KEY, JSON.stringify(this._items()));
    });
  }

  open(): void {
    this._open.set(true);
  }

  close(): void {
    this._open.set(false);
  }

  toggle(): void {
    this._open.update((v) => !v);
  }

  add(product: Product): void {
    const items = this._items();
    if (items.some((p) => p.id === product.id)) return;
    this._items.set([...items, product]);
    this._open.set(true);
  }

  remove(id: number): void {
    this._items.set(this._items().filter((p) => p.id !== id));
  }

  has(id: number): boolean {
    return this._items().some((p) => p.id === id);
  }

  clear(): void {
    this._items.set([]);
  }
}

function readCart(): Product[] {
  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Product[]) : [];
  } catch {
    localStorage.removeItem(CART_KEY);
    return [];
  }
}

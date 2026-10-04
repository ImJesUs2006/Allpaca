import { Component, ElementRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideChevronLeft, LucideChevronRight, LucideSearch } from '@lucide/angular';
import { apiErrorMessage, ApiService } from '../../core/api.service';
import type { Product } from '../../core/api.models';
import { ProductCard } from '../../shared/product-card';

/**
 * Landing. Portado de App.tsx:654-726 (LandingView) + el bloque de
 * newsletter/footer de App.tsx:1990-2020.
 * DESIGN.md §5 — hero `h-screen` negro, carrusel de una sola fila con snap.
 */
@Component({
  selector: 'app-landing-page',
  imports: [RouterLink, ProductCard, LucideChevronLeft, LucideChevronRight, LucideSearch],
  templateUrl: './landing.html',
})
export class LandingPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly carousel = viewChild<ElementRef<HTMLDivElement>>('carousel');

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly query = signal('');

  /** Suficientes tarjetas para que el carrusel se vea "completo" en pantallas grandes. */
  readonly featured = computed(() => this.products().slice(0, 12));

  ngOnInit(): void {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.products.set(await this.api.products({ limit: 24 }));
    } catch (err) {
      this.error.set(apiErrorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }

  scroll(direction: 'left' | 'right'): void {
    const el = this.carousel()?.nativeElement;
    if (!el) return;
    el.scrollTo({
      left: el.scrollLeft + (direction === 'left' ? -1 : 1) * (el.clientWidth / 2),
      behavior: 'smooth',
    });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    this.query.set(value);
  }
}

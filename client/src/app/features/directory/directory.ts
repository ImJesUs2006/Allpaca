import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LucideSearch } from '@lucide/angular';
import { apiErrorMessage, ApiService } from '../../core/api.service';
import type { Product } from '../../core/api.models';
import { ProductCard } from '../../shared/product-card';

/** DESIGN.md §7 — pestanas y agrupacion de categorias del prototipo. */
interface CategoryTab {
  key: string;
  label: string;
  /** Grupos que envia el servidor; "all" no filtra. */
  group: string;
}

const CATEGORY_TABS: CategoryTab[] = [
  { key: 'all', label: 'Todo', group: '' },
  { key: 'tops', label: 'Tops', group: 'Tops,Outerwear' },
  { key: 'bottoms', label: 'Bottoms', group: 'Bottoms' },
  { key: 'accesorios', label: 'Accesorios', group: 'Headwear,Accesorios' },
];

const STYLE_FILTERS = ['Y2K', 'Avant Garde', 'Streetwear', 'Vintage 90s'];
const SIZE_FILTERS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'OSFA', '30', '32', '34'];

/** Directorio. Portado de App.tsx:728-968 (ListView). */
@Component({
  selector: 'app-directory-page',
  imports: [ProductCard, LucideSearch],
  templateUrl: './directory.html',
})
export class DirectoryPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  readonly tabs = CATEGORY_TABS;
  readonly styles = STYLE_FILTERS;
  readonly sizes = SIZE_FILTERS;

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly activeTab = signal('all');
  readonly activeStyles = signal<string[]>([]);
  readonly activeSizes = signal<string[]>([]);
  readonly query = signal('');

  readonly filtersActive = computed(
    () =>
      this.activeStyles().length > 0 ||
      this.activeSizes().length > 0 ||
      this.query().length > 0 ||
      this.activeTab() !== 'all',
  );

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const category = params.get('category');
    const tab = CATEGORY_TABS.find((t) => t.key === category?.toLowerCase());
    if (tab) this.activeTab.set(tab.key);
    this.query.set(params.get('q') ?? '');

    void this.load();
  }

  setTab(tab: CategoryTab): void {
    this.activeTab.set(tab.key);
    void this.load();
  }

  toggleStyle(style: string): void {
    this.activeStyles.update((list) =>
      list.includes(style) ? list.filter((s) => s !== style) : [...list, style],
    );
    void this.load();
  }

  toggleSize(size: string): void {
    this.activeSizes.update((list) =>
      list.includes(size) ? list.filter((s) => s !== size) : [...list, size],
    );
    void this.load();
  }

  clearFilters(): void {
    this.activeStyles.set([]);
    this.activeSizes.set([]);
    this.query.set('');
    this.activeTab.set('all');
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const tab = CATEGORY_TABS.find((t) => t.key === this.activeTab());
      this.products.set(
        await this.api.products({
          category: tab?.group,
          style: this.activeStyles().join(',') || undefined,
          size: this.activeSizes().join(',') || undefined,
          q: this.query(),
          limit: 60,
        }),
      );
    } catch (err) {
      this.error.set(apiErrorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }
}

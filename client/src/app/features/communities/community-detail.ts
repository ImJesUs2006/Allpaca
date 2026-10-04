import { Component, OnInit, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowLeft } from '@lucide/angular';
import { apiErrorMessage, ApiService } from '../../core/api.service';
import type { Community, Product } from '../../core/api.models';
import { AuthService } from '../../core/auth.service';
import { ProductCard } from '../../shared/product-card';

/** Detalle de comunidad. Portado de App.tsx:1610-1797 (CommunityDetailView). */
@Component({
  selector: 'app-community-detail-page',
  imports: [RouterLink, ProductCard, LucideArrowLeft],
  templateUrl: './community-detail.html',
})
export class CommunityDetailPage implements OnInit {
  /** Bound desde la ruta con withComponentInputBinding(). */
  readonly id = input.required<string>();

  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly community = signal<Community | null>(null);
  readonly drops = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly busy = signal(false);

  ngOnInit(): void {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const id = Number(this.id());
      this.community.set(await this.api.community(id));
      this.drops.set(await this.api.products({ community: id, limit: 24 }));
    } catch (err) {
      this.error.set(apiErrorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }

  async toggleJoin(): Promise<void> {
    const community = this.community();
    if (!community) return;

    if (!this.auth.isAuthenticated()) {
      void this.router.navigate(['/login'], {
        queryParams: { redirect: `/comunidades/${community.id}` },
      });
      return;
    }

    this.busy.set(true);
    try {
      if (community.is_member) {
        await this.api.leaveCommunity(community.id);
      } else {
        await this.api.joinCommunity(community.id);
      }
      await this.load();
    } catch (err) {
      this.error.set(apiErrorMessage(err));
    } finally {
      this.busy.set(false);
    }
  }
}

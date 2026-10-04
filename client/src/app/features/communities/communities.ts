import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { apiErrorMessage, ApiService } from '../../core/api.service';
import type { Community } from '../../core/api.models';
import { AuthService } from '../../core/auth.service';

/** Comunidades. Portado de App.tsx:1498-1608 (CommunitiesView). */
@Component({
  selector: 'app-communities-page',
  imports: [RouterLink],
  templateUrl: './communities.html',
})
export class CommunitiesPage implements OnInit {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);

  readonly communities = signal<Community[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly showOnlyMine = signal(false);

  readonly visible = computed(() =>
    this.showOnlyMine() ? this.communities().filter((c) => c.is_member) : this.communities(),
  );

  ngOnInit(): void {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.communities.set(await this.api.communities());
    } catch (err) {
      this.error.set(apiErrorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }
}

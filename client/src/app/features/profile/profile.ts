import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { apiErrorMessage, ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

/** Perfil unificado. Portado de App.tsx:1855-1907 (ProfileView). */
@Component({
  selector: 'app-profile-page',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
})
export class ProfilePage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);

  readonly busy = signal(false);
  readonly saved = signal(false);
  readonly error = signal<string | null>(null);
  readonly stats = signal({ sales: 0, purchases: 0 });

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    bio: ['', [Validators.maxLength(500)]],
    location: ['', [Validators.maxLength(80)]],
  });

  ngOnInit(): void {
    const user = this.auth.user();
    if (user) {
      this.form.patchValue({
        name: user.name,
        bio: user.bio,
        location: user.location,
      });
    }
    void this.loadStats();
  }

  private async loadStats(): Promise<void> {
    try {
      const orders = await this.api.orders('all');
      this.stats.set({
        sales: orders.filter((o) => o.role === 'SELLER').length,
        purchases: orders.filter((o) => o.role === 'BUYER').length,
      });
    } catch {
      // Las estadisticas son informativas: un fallo aqui no debe romper el perfil.
    }
  }

  async save(): Promise<void> {
    if (this.form.invalid || this.busy()) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    this.saved.set(false);
    try {
      await this.auth.updateProfile(this.form.getRawValue());
      this.saved.set(true);
    } catch (err) {
      this.error.set(apiErrorMessage(err));
    } finally {
      this.busy.set(false);
    }
  }
}

import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideLoader } from '@lucide/angular';
import { apiErrorMessage } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink, LucideArrowLeft, LucideLoader],
  templateUrl: './register.html',
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly busy = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    handle: [
      '',
      [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-z0-9._]+$/)],
    ],
    email: ['', [Validators.required, Validators.email]],
    location: ['', [Validators.maxLength(80)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', [Validators.required]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid || this.busy()) {
      this.form.markAllAsTouched();
      return;
    }
    const { confirm, ...values } = this.form.getRawValue();
    if (confirm !== values.password) {
      this.error.set('Las contrasenas no coinciden');
      return;
    }

    this.busy.set(true);
    this.error.set(null);
    try {
      await this.auth.register(values);
      await this.router.navigate(['/']);
    } catch (err) {
      this.error.set(apiErrorMessage(err));
    } finally {
      this.busy.set(false);
    }
  }
}

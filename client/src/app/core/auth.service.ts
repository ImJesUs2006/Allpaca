import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import type { AuthResponse, User } from './api.models';

const TOKEN_KEY = 'allpaca.token';
const USER_KEY = 'allpaca.user';

/**
 * Estado de sesion basado en signals (DESIGN.md §9: "Estado -> servicios con
 * signals"). El token vive en localStorage para sobrevivir un refresh; la
 * verdad sobre la autorizacion siempre es el servidor.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _user = signal<User | null>(readStoredUser());
  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly _booting = signal(true);

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isBooting = this._booting.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null && this._user() !== null);

  /**
   * Valida el token guardado contra /auth/me. Se llama al arrancar para no
   * mostrar la UI autenticada con una sesion que el servidor ya no acepta.
   */
  async bootstrap(): Promise<void> {
    try {
      if (!this._token()) return;
      const { user } = await firstValueFrom(
        this.http.get<{ user: User }>('/api/auth/me'),
      );
      this._user.set(user);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      this.clear();
    } finally {
      this._booting.set(false);
    }
  }

  async login(email: string, password: string): Promise<User> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>('/api/auth/login', { email, password }),
    );
    this.persist(res);
    return res.user;
  }

  async register(input: {
    email: string;
    password: string;
    handle: string;
    name: string;
    location?: string;
  }): Promise<User> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>('/api/auth/register', input),
    );
    this.persist(res);
    return res.user;
  }

  async updateProfile(input: {
    name?: string;
    bio?: string;
    location?: string;
    avatar_url?: string;
  }): Promise<void> {
    const { user } = await firstValueFrom(
      this.http.patch<{ user: User }>('/api/auth/me', input),
    );
    this._user.set(user);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  logout(redirect = true): void {
    this.clear();
    if (redirect) void this.router.navigate(['/login']);
  }

  private persist(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this._token.set(res.token);
    this._user.set(res.user);
  }

  private clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
  }
}

function readStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Protege rutas privadas. Espera a `bootstrap()` para no redirigir a /login
 * mientras el token guardado aun no se ha validado contra el servidor.
 */
export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isBooting()) await auth.bootstrap();

  if (auth.isAuthenticated()) return true;

  return router.createUrlTree(['/login'], {
    queryParams: { redirect: state.url },
  });
};

/** Inverso: mantiene a un usuario ya autenticado fuera de /login y /registro. */
export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isBooting()) await auth.bootstrap();

  return auth.isAuthenticated() ? router.createUrlTree(['/']) : true;
};

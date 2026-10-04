import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

/** Anade `Authorization: Bearer <token>` cuando hay sesion. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();

  const request = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((err: unknown) => {
      // 401 en cualquier peticion = token invalido o expirado. Se limpia la
      // sesion en vez de dejar al usuario en un estado medio autenticado.
      if (err instanceof HttpErrorResponse && err.status === 401 && auth.isAuthenticated()) {
        auth.logout();
      }
      return throwError(() => err);
    }),
  );
};

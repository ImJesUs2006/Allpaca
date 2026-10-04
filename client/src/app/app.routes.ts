import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login').then((m) => m.LoginPage),
    title: 'ALLPACA — Iniciar sesion',
  },
  {
    path: 'registro',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register').then((m) => m.RegisterPage),
    title: 'ALLPACA — Crear cuenta',
  },
  {
    path: '',
    loadComponent: () => import('./features/landing/landing').then((m) => m.LandingPage),
    title: 'ALLPACA — Como nuevo',
  },
  {
    path: 'directorio',
    loadComponent: () => import('./features/directory/directory').then((m) => m.DirectoryPage),
    title: 'ALLPACA — Directorio',
  },
  {
    path: 'comunidades',
    loadComponent: () => import('./features/communities/communities').then((m) => m.CommunitiesPage),
    title: 'ALLPACA — Comunidades',
  },
  {
    path: 'comunidades/:id',
    loadComponent: () =>
      import('./features/communities/community-detail').then((m) => m.CommunityDetailPage),
    title: 'ALLPACA — Comunidad',
  },
  {
    // El dashboard y el perfil exponen datos del usuario: requieren sesion.
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.DashboardPage),
    title: 'ALLPACA — Dashboard',
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile').then((m) => m.ProfilePage),
    title: 'ALLPACA — Perfil',
  },
  { path: '**', redirectTo: '' },
];

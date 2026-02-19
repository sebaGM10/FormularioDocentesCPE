import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/registro/registro'),
  },
  {
    path: 'prueba',
    loadComponent: () => import('./pages/prueba/prueba'),
  },
  {
    path: 'resultado',
    loadComponent: () => import('./pages/resultado/resultado'),
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin'),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

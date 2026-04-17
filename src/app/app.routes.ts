import { Routes } from '@angular/router';
import { AdminLayout } from './core/layouts/admin-layout/admin-layout';
import { PublicLayout } from './core/layouts/public-layout/public-layout';
import { authGuard } from './core/guards/auth.guard';
import { LoginPage } from './features/auth/pages/login-page/login-page';
import { HomePage } from './features/home/pages/home-page/home-page';
import { PublicHomePage } from './features/public/pages/public-home-page/public-home-page';
import { ServicesPage } from './features/services/pages/services-page/services-page';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      {
        path: '',
        component: PublicHomePage,
        title: 'SISPARK | Portal publico',
      },
    ],
  },
  {
    path: 'login',
    component: LoginPage,
    title: 'Iniciar sesion | SISPARK',
  },
  {
    path: 'admin',
    component: AdminLayout,
    children: [
      {
        path: 'inicio',
        component: HomePage,
        title: 'Inicio administrativo | SISPARK',
        canActivate: [authGuard],
      },
      {
        path: 'vehiculos',
        component: ServicesPage,
        title: 'Registro de vehiculos | SISPARK',
        canActivate: [authGuard],
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

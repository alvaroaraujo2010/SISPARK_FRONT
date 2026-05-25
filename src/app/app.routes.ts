import { Routes } from '@angular/router';
import { AdminLayout } from './core/layouts/admin-layout/admin-layout';
import { PublicLayout } from './core/layouts/public-layout/public-layout';
import { authGuard } from './core/guards/auth.guard';
import { adminDefaultRedirectGuard } from './core/guards/admin-default-redirect.guard';
import { roleGuard } from './core/guards/role.guard';
import { SystemRoles } from './core/auth/roles';
import { LoginPage } from './features/auth/pages/login-page/login-page';
import { HomePage } from './features/home/pages/home-page/home-page';
import { PublicHomePage } from './features/public/pages/public-home-page/public-home-page';
import { ServicesPage } from './features/services/pages/services-page/services-page';
import { ParkingLotPage } from './features/parking-lot/pages/parking-lot-page/parking-lot-page';
import { UsersPage } from './features/users/pages/users-page/users-page';
import { ReportsPage } from './features/reports/pages/reports-page/reports-page';

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
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        canActivate: [adminDefaultRedirectGuard],
        children: [],
      },
      {
        path: 'inicio',
        component: HomePage,
        title: 'Inicio administrativo | SISPARK',
        canActivate: [roleGuard([SystemRoles.administrador, SystemRoles.operador, SystemRoles.cajero])],
      },
      {
        path: 'vehiculos',
        component: ServicesPage,
        title: 'Registro de vehiculos | SISPARK',
        canActivate: [roleGuard([SystemRoles.administrador])],
      },
      {
        path: 'parqueadero',
        component: ParkingLotPage,
        title: 'Administracion del parqueadero | SISPARK',
        canActivate: [roleGuard([SystemRoles.administrador])],
      },
      {
        path: 'usuarios',
        component: UsersPage,
        title: 'Usuarios | SISPARK',
        canActivate: [roleGuard([SystemRoles.administrador])],
      },
      {
        path: 'reportes',
        component: ReportsPage,
        title: 'Reportes | SISPARK',
        canActivate: [roleGuard([SystemRoles.administrador, SystemRoles.supervisor])],
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

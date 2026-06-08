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
import { ClientsPage } from './features/clients/pages/clients-page/clients-page';
import { RatesPage } from './features/rates/pages/rates-page/rates-page';
import { MonthliesPage } from './features/monthlies/pages/monthlies-page/monthlies-page';
import { CashPage } from './features/cash/pages/cash-page/cash-page';
import { ProfilePage } from './features/profile/pages/profile-page/profile-page';
import { AuditPage } from './features/audit/pages/audit-page/audit-page';

const adminOnly = roleGuard([SystemRoles.administrador]);
const supervisorOrAdmin = roleGuard([SystemRoles.administrador, SystemRoles.supervisor]);
const operational = roleGuard([
  SystemRoles.administrador,
  SystemRoles.operador,
  SystemRoles.cajero,
]);
const cashierOrAdmin = roleGuard([SystemRoles.administrador, SystemRoles.cajero]);

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
        canActivate: [operational],
      },
      {
        path: 'vehiculos',
        component: ServicesPage,
        title: 'Registro de vehiculos | SISPARK',
        canActivate: [adminOnly],
      },
      {
        path: 'clientes',
        component: ClientsPage,
        title: 'Clientes | SISPARK',
        canActivate: [operational],
      },
      {
        path: 'tarifas',
        component: RatesPage,
        title: 'Tarifas | SISPARK',
        canActivate: [adminOnly],
      },
      {
        path: 'mensualidades',
        component: MonthliesPage,
        title: 'Mensualidades | SISPARK',
        canActivate: [operational],
      },
      {
        path: 'caja',
        component: CashPage,
        title: 'Caja y pagos | SISPARK',
        canActivate: [cashierOrAdmin],
      },
      {
        path: 'parqueadero',
        component: ParkingLotPage,
        title: 'Administracion del parqueadero | SISPARK',
        canActivate: [adminOnly],
      },
      {
        path: 'usuarios',
        component: UsersPage,
        title: 'Usuarios | SISPARK',
        canActivate: [adminOnly],
      },
      {
        path: 'reportes',
        component: ReportsPage,
        title: 'Reportes | SISPARK',
        canActivate: [supervisorOrAdmin],
      },
      {
        path: 'auditoria',
        component: AuditPage,
        title: 'Auditoria | SISPARK',
        canActivate: [supervisorOrAdmin],
      },
      {
        path: 'perfil',
        component: ProfilePage,
        title: 'Mi perfil | SISPARK',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

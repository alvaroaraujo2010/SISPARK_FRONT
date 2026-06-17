/** Nombres de rol tal como vienen en el JWT (API). */
export const SystemRoles = {
  administrador: 'Administrador',
  operador: 'Operador',
  supervisor: 'Supervisor',
  cajero: 'Cajero',
} as const;

export type SystemRoleName = (typeof SystemRoles)[keyof typeof SystemRoles];

export const PermissionCodes = {
  dashboardView: 'dashboard.view',
  parkingOperate: 'parking.operate',
  vehiclesManage: 'vehicles.manage',
  clientsManage: 'clients.manage',
  monthliesManage: 'monthlies.manage',
  cashManage: 'cash.manage',
  ratesManage: 'rates.manage',
  parkingLotManage: 'parkinglot.manage',
  usersManage: 'users.manage',
  rolesManage: 'roles.manage',
  reportsView: 'reports.view',
  auditView: 'audit.view',
  tenantsManage: 'tenants.manage',
} as const;

export function hasPermission(
  permissions: readonly string[] | undefined | null,
  permission: string,
): boolean {
  return permissions?.includes(permission) ?? false;
}

export function roleLabel(role: string | undefined | null): string {
  if (!role) {
    return '';
  }

  if (role === SystemRoles.operador) {
    return 'Operario';
  }

  return role;
}

export function isAdministrator(role: string | undefined | null): boolean {
  return role === SystemRoles.administrador;
}

export function isCashier(role: string | undefined | null): boolean {
  return role === SystemRoles.cajero;
}

export function canOperateParking(role: string | undefined | null): boolean {
  return (
    role === SystemRoles.administrador ||
    role === SystemRoles.operador ||
    role === SystemRoles.cajero
  );
}

export function canSupervise(role: string | undefined | null): boolean {
  return role === SystemRoles.administrador || role === SystemRoles.supervisor;
}

export function defaultAdminRoute(role: string | undefined | null): string {
  if (role === SystemRoles.supervisor) {
    return '/admin/reportes';
  }

  if (canOperateParking(role)) {
    return '/admin/inicio';
  }

  return '/admin/inicio';
}

export function defaultAdminRouteByAccess(
  role: string | undefined | null,
  permissions: readonly string[] | undefined | null,
): string {
  if (hasPermission(permissions, PermissionCodes.parkingOperate) || canOperateParking(role)) {
    return '/admin/inicio';
  }
  if (hasPermission(permissions, PermissionCodes.cashManage) || isCashier(role)) {
    return '/admin/caja';
  }
  if (hasPermission(permissions, PermissionCodes.vehiclesManage)) {
    return '/admin/vehiculos';
  }
  if (hasPermission(permissions, PermissionCodes.clientsManage)) {
    return '/admin/clientes';
  }
  if (hasPermission(permissions, PermissionCodes.monthliesManage)) {
    return '/admin/mensualidades';
  }
  if (hasPermission(permissions, PermissionCodes.ratesManage)) {
    return '/admin/tarifas';
  }
  if (hasPermission(permissions, PermissionCodes.parkingLotManage)) {
    return '/admin/parqueadero';
  }
  if (hasPermission(permissions, PermissionCodes.reportsView) || canSupervise(role)) {
    return '/admin/reportes';
  }
  if (hasPermission(permissions, PermissionCodes.auditView)) {
    return '/admin/auditoria';
  }
  if (hasPermission(permissions, PermissionCodes.rolesManage)) {
    return '/admin/roles';
  }
  if (hasPermission(permissions, PermissionCodes.usersManage) || isAdministrator(role)) {
    return '/admin/usuarios';
  }
  return '/admin/perfil';
}

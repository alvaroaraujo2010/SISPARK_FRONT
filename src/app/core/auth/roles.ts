/** Nombres de rol tal como vienen en el JWT (API). */
export const SystemRoles = {
  administrador: 'Administrador',
  operador: 'Operador',
  supervisor: 'Supervisor',
  cajero: 'Cajero',
} as const;

export type SystemRoleName = (typeof SystemRoles)[keyof typeof SystemRoles];

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

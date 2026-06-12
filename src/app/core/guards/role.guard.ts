import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { defaultAdminRouteByAccess, hasPermission, isAdministrator } from '../auth/roles';

export function roleGuard(allowedRoles: readonly string[]): CanActivateFn {
  return (_, state) => {
    const auth = inject(Auth);
    const router = inject(Router);
    const role = auth.session()?.role;

    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/login'], {
        queryParams: { redirectUrl: state.url },
      });
    }

    if (role && allowedRoles.includes(role)) {
      return true;
    }

    return router.createUrlTree([defaultAdminRouteByAccess(role, auth.session()?.permissions)]);
  };
}

export function permissionGuard(allowedPermissions: readonly string[]): CanActivateFn {
  return (_, state) => {
    const auth = inject(Auth);
    const router = inject(Router);
    const session = auth.session();

    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/login'], {
        queryParams: { redirectUrl: state.url },
      });
    }

    if (
      isAdministrator(session?.role) ||
      allowedPermissions.some((permission) => hasPermission(session?.permissions, permission))
    ) {
      return true;
    }

    return router.createUrlTree([defaultAdminRouteByAccess(session?.role, session?.permissions)]);
  };
}

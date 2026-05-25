import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { defaultAdminRoute } from '../auth/roles';

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

    return router.createUrlTree([defaultAdminRoute(role)]);
  };
}

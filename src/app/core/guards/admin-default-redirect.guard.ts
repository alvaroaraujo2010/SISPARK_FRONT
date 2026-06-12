import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { defaultAdminRouteByAccess } from '../auth/roles';

export const adminDefaultRedirectGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const session = auth.session();
  return router.createUrlTree([defaultAdminRouteByAccess(session?.role, session?.permissions)]);
};

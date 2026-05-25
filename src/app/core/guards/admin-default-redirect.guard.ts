import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { SystemRoles } from '../auth/roles';

export const adminDefaultRedirectGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const role = auth.session()?.role;
  const segment = role === SystemRoles.supervisor ? 'reportes' : 'inicio';
  return router.createUrlTree(['/admin', segment]);
};

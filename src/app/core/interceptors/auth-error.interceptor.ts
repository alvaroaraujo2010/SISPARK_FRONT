import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { isAppApiRequest, isAuthLoginRequest } from '../http/api-url';
import { Auth } from '../services/auth';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const isApi = isAppApiRequest(req.url);
  const isLogin = isAuthLoginRequest(req.url);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (isApi && !isLogin && error.status === 401) {
        const redirectUrl = router.url.startsWith('/login') ? '/admin/inicio' : router.url;

        auth.logout();
        void router.navigate(['/login'], {
          queryParams: {
            reason: 'session-expired',
            redirectUrl,
          },
        });
      }

      return throwError(() => error);
    }),
  );
};

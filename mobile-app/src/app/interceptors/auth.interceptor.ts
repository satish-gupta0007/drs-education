import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const retryingRequests = new Set<string>();

export const mobileAuthInterceptor: HttpInterceptorFn = (req, next) => {

  const auth = inject(AuthService);
  const router = inject(Router);

  const requestKey = `${req.method}:${req.url}`;

  const authReq = req.clone({
    withCredentials: true
  });

  return next(authReq).pipe(

    catchError((error: HttpErrorResponse) => {

      if (error.status !== 401) {
        return throwError(() => error);
      }

      if (isAuthEndpoint(req) || retryingRequests.has(requestKey)) {

        retryingRequests.delete(requestKey);

        auth.logoutLocal();

        router.navigateByUrl('/login', { replaceUrl: true });

        return throwError(() => error);
      }

      retryingRequests.add(requestKey);

      return auth.refreshToken().pipe(

        switchMap(() => {

          retryingRequests.delete(requestKey);

          return next(authReq);

        }),

        catchError((refreshError: HttpErrorResponse) => {

          retryingRequests.delete(requestKey);

          auth.logoutLocal();

          router.navigateByUrl('/login', {
            replaceUrl: true
          });

          return throwError(() => refreshError);

        })

      );

    })

  );

};

function isAuthEndpoint(req: any): boolean {
  return [
    '/auth/login',
    '/auth/logout',
    '/auth/refresh',
    '/auth/me'
  ].some(path => req.url.includes(path));
}
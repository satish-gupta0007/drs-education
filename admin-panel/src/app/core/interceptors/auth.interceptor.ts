import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';

// Track requests being retried to prevent infinite loops
const retryingRequests = new Set<string>();

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  // Create a unique key for this request
  const requestKey = `${req.method}:${req.url}`;
  const isRetrying = retryingRequests.has(requestKey);

  // Send cookies with all requests
  const authReq = req.clone({ withCredentials: true });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only handle 401 errors
      if (error.status !== 401) {
        return throwError(() => error);
      }

      // Don't retry if already retrying
      if (isRetrying) {
        toast.error('Session Expired', 'Please login again.');
        authService.logoutLocal();
        return throwError(() => error);
      }

      // If auth endpoint itself fails, avoid re-calling logout API endlessly
      if (isAuthEndpoint(req)) {
        toast.error('Session Expired', 'Please login again.');
        authService.logoutLocal();
        return throwError(() => error);
      }

      // Mark this request as retrying
      retryingRequests.add(requestKey);

      // Attempt token refresh
      return authService.refreshToken().pipe(
        switchMap(() => {
          retryingRequests.delete(requestKey);
          // Retry the original request
          const retryReq = req.clone({ withCredentials: true });
          return next(retryReq);
        }),
        catchError(() => {
          retryingRequests.delete(requestKey);
          // Refresh failed, do local logout only (no further auth endpoint loops)
          toast.error('Session Expired', 'Please login again.');
          authService.logoutLocal();
          return throwError(() => error);
        })
      );
    })
  );
};

/**
 * Check if request is an authentication endpoint (should not be retried)
 */
function isAuthEndpoint(req: any): boolean {
  return req.url.includes('/auth/login') || req.url.includes('/auth/refresh') || req.url.includes('/auth/logout');
}

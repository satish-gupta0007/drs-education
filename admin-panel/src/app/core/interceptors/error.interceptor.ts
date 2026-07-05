import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0)  {
        toast.error('Network Error', 'Unable to reach server. Check your connection.');
      } else if (error.status >= 400) {
        const message =
          error.error?.message ||
          error.error?.error ||
          error.message ||
          'An unexpected error occurred.';

        toast.error(`Error ${error.status}`, `${message}`);
      }
      return throwError(() => error);
    })
  );
};
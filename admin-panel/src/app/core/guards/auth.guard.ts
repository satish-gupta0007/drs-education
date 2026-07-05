// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { AuthService } from '../services/auth.service';
// import { HttpClient } from '@angular/common/http';
// import { environment } from '../../../environments/environment';
// import { catchError, map, of } from 'rxjs';

// export const authGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);
//   const http = inject(HttpClient);
// debugger
//   // Check if we have a user in memory (should be set after login or page refresh check)
//   if (authService.isAuthenticated()) {
//     return true;
//   }

//   // If no user in memory, check auth status with backend
//   // This handles page refreshes and direct navigation to protected routes
//   return http.get<any>(`${environment.apiUrl}/auth/me`, { withCredentials: true }).pipe(
//     map(response => {
//       if (response.success && response.data) {
//         authService.currentUser.set(response.data);
//         return true;
//       }
//       router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
//       return false;
//     }),
//     catchError(() => {
//       router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
//       return of(false);
//     })
//   );
// };


import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // ✅ Check auth state from signal
  if (authService.isAuthenticated()) {
    return true;
  }

  // ❌ No API call here
  // ✅ Just redirect if not authenticated
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};
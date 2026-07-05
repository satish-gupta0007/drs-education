import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models';

interface LoginResponse {
  success: boolean;
  data: {
    user: User;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<User | null>(null);
  isLoading = signal(false);

  // Computed signal for authentication status
  isAuthenticated = computed(() => !!this.currentUser());

  constructor(private http: HttpClient, private router: Router) {
    
    // this.http.get<any>(`${environment.apiUrl}/auth/me`, { withCredentials: true }).subscribe((res: any) => {
    //   debugger
    // })
    // Check auth status on app initialization (for page refreshes)
    this.checkAuthStatus();
  }

  /**
   * Check if user is still authenticated by calling the API
   */
  checkAuthStatus(): void {
    // this.http.get<any>(`${environment.apiUrl}/auth/me`, { withCredentials: true }).subscribe({
    //   next: (response) => {
    //     debugger
    //     this.currentUser.set(response.data || response);
    //   },
    //   error: () => {
    //     this.refreshToken().subscribe({
    //       next: () => {
    //         this.checkAuthStatus(); // retry
    //       },
    //       error: () => {
    //         this.currentUser.set(null);
    //       }
    //     });
    //   }
    // });
    if (!!localStorage.getItem('user')){
    localStorage.getItem('user') && this.currentUser.set(JSON.parse(localStorage.getItem('user')!));
    }else {
      this.currentUser.set(null);
    }

  }

  /**
   * Login with email and password
   * Tokens are stored in HTTP-only cookies by the backend
   */
  login(email: string, password: string): Observable<LoginResponse> {
    this.isLoading.set(true);
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password }, { withCredentials: true }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.currentUser.set(response.data.user);
        }
        this.isLoading.set(false);
      }),
      // Error handling is done in interceptor
    );
  }

  /**
   * Refresh the access token using the refresh token cookie
   */
  refreshToken(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/refresh`, {}, { withCredentials: true }).pipe(
      tap(() => {
        // Token is refreshed, continue with the app
      })
    );
  }

  /**
   * Logout and clear cookies
   */
  logout(): void {
    this.http.post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {
        this.logoutLocal();
      },
      error: () => {
        // Even if logout fails on server, clear local state
        this.logoutLocal();
      }
    });
  }

  logoutLocal(): void {
    localStorage.clear();
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Get current authentication status
   */
  isAuthenticatedValue(): boolean {
    return !!this.currentUser();
  }
}

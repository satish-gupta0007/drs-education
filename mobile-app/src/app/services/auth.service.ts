import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, finalize } from 'rxjs';
import { User } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<User | null>(null);
  isLoading = signal(false);

  // Computed signal for authentication status
  isAuthenticated = computed(() => !!this.currentUser());

  // Uses HttpBackend to bypass interceptors and break the circular dependency:
  // AuthService → HttpClient → Interceptor → AuthService
  private http: HttpClient;

  constructor(handler: HttpBackend, private router: Router) {
    this.http = new HttpClient(handler);
    // Check auth status on app initialization (for page refreshes)
    this.checkAuthStatus();
  }

  /**
   * Check if user is still authenticated
   */
  checkAuthStatus(): void {
    this.http.get<any>(`${environment.apiUrl}/auth/me`, { withCredentials: true }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.currentUser.set(response.data);
        }
      },
      error: () => this.currentUser.set(null)
    });
  }

  getCurrentUserProfile(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/auth/me`, { withCredentials: true });
  }

  getStudentProgress(studentId: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/students/${studentId}/progress`, { withCredentials: true });
  }

  /**
   * Login with email and password
   * Tokens are stored in HTTP-only cookies
   */
  login(email: string, password: string): Observable<any> {
    this.isLoading.set(true);
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, { email, password }, { withCredentials: true }).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.currentUser.set(res.data.user);
        }
      }),
      finalize(() => this.isLoading.set(false)) // resets on both success and error
    );
  }

  /**
   * Refresh access token using refresh token cookie
   */
  refreshToken(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/refresh`, {}, { withCredentials: true });
  }

  /**
   * Logout and clear session
   */
  logout(): void {
    this.http.post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true }).subscribe({
      next: () => this.logoutLocal(),
      error: () => this.logoutLocal()
    });
  }

  logoutLocal(): void {
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
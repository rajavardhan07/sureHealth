import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { LoginRequest, LoginResponse, ChangePasswordDTO } from '../../shared/models';

interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', response.username);
        localStorage.setItem('role', response.role);
        this.loggedIn.next(true);
      })
    );
  }

  changePassword(dto: ChangePasswordDTO): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/change-password`, dto);
  }

  forgotPassword(username: string): Observable<{message: string, token: string}> {
    return this.http.post<{message: string, token: string}>(`${this.apiUrl}/forgot-password`, { username });
  }

  resetPassword(data: any): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reset-password`, data);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getRoleRoute(): string {
    const role = this.getRole();
    switch (role) {
      case 'ADMIN': return '/admin';
      case 'HR': return '/hr';
      case 'EMPLOYEE': return '/employee';
      case 'CLAIMS_OFFICER': return '/claims-officer';
      case 'UNDERWRITER': return '/underwriter';
      default: return '/login';
    }
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }
}

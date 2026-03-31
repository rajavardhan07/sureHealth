import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    // Clean up localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // ── Test 1 ──────────────────────────────────────────────────────────────────
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── Test 2 ──────────────────────────────────────────────────────────────────
  it('login() should POST credentials to /api/auth/login', () => {
    const credentials = { username: 'john', password: 'pass123' };
    const mockResponse = { token: 'fake-jwt', username: 'john', role: 'EMPLOYEE' };

    service.login(credentials as any).subscribe(res => {
      expect(res.token).toBe('fake-jwt');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  // ── Test 3 ──────────────────────────────────────────────────────────────────
  it('login() should store token, username, and role in localStorage', () => {
    const credentials = { username: 'alice', password: 'secret' };
    const mockResponse = { token: 'abc123', username: 'alice', role: 'ADMIN' };

    service.login(credentials as any).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    req.flush(mockResponse);

    expect(localStorage.getItem('token')).toBe('abc123');
    expect(localStorage.getItem('username')).toBe('alice');
    expect(localStorage.getItem('role')).toBe('ADMIN');
  });

  // ── Test 4 ──────────────────────────────────────────────────────────────────
  it('logout() should clear localStorage', () => {
    localStorage.setItem('token', 'xyz');
    localStorage.setItem('username', 'bob');
    localStorage.setItem('role', 'HR');

    service.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('username')).toBeNull();
    expect(localStorage.getItem('role')).toBeNull();
  });

  // ── Test 5 ──────────────────────────────────────────────────────────────────
  it('isLoggedIn() should return false when no token exists', () => {
    expect(service.isLoggedIn()).toBeFalse();
  });

  // ── Test 6 ──────────────────────────────────────────────────────────────────
  it('getUsername() should return the stored username', () => {
    localStorage.setItem('username', 'carol');
    expect(service.getUsername()).toBe('carol');
  });

  // ── Test 7 ──────────────────────────────────────────────────────────────────
  it('getRole() should return the stored role', () => {
    localStorage.setItem('role', 'CLAIMS_OFFICER');
    expect(service.getRole()).toBe('CLAIMS_OFFICER');
  });

  // ── Test 8 ──────────────────────────────────────────────────────────────────
  it('getRoleRoute() should return /admin for ADMIN role', () => {
    localStorage.setItem('role', 'ADMIN');
    expect(service.getRoleRoute()).toBe('/admin');
  });

  // ── Test 9 ──────────────────────────────────────────────────────────────────
  it('getRoleRoute() should return /employee for EMPLOYEE role', () => {
    localStorage.setItem('role', 'EMPLOYEE');
    expect(service.getRoleRoute()).toBe('/employee');
  });

  // ── Test 10 ─────────────────────────────────────────────────────────────────
  it('getRoleRoute() should return /login for unknown role', () => {
    localStorage.setItem('role', 'UNKNOWN');
    expect(service.getRoleRoute()).toBe('/login');
  });

  // ── Test 11 ─────────────────────────────────────────────────────────────────
  it('changePassword() should POST to /api/auth/change-password', () => {
    const dto = { oldPassword: 'old', newPassword: 'new' };

    service.changePassword(dto as any).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/auth/change-password');
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });

  // ── Test 12 ─────────────────────────────────────────────────────────────────
  it('getToken() should return the stored token', () => {
    localStorage.setItem('token', 'mytoken');
    expect(service.getToken()).toBe('mytoken');
  });
});

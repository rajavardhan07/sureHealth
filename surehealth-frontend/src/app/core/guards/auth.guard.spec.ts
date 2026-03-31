import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let router: Router;

  const dummyState = {} as RouterStateSnapshot;

  function createRoute(role?: string): ActivatedRouteSnapshot {
    const route = new ActivatedRouteSnapshot();
    (route as any).data = role ? { role } : {};
    return route;
  }

  function runGuard(route: ActivatedRouteSnapshot): boolean | any {
    return TestBed.runInInjectionContext(() => authGuard(route, dummyState));
  }

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'isLoggedIn', 'getRole', 'getRoleRoute'
    ]);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    router = TestBed.inject(Router);
  });

  // ── Test 1 ──────────────────────────────────────────────────────────────────
  it('should return true when user is logged in and no specific role required', () => {
    mockAuthService.isLoggedIn.and.returnValue(true);
    mockAuthService.getRole.and.returnValue('ADMIN');
    const result = runGuard(createRoute());
    expect(result).toBeTrue();
  });

  // ── Test 2 ──────────────────────────────────────────────────────────────────
  it('should return false when user is NOT logged in', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);
    const result = runGuard(createRoute());
    expect(result).toBeFalse();
  });

  // ── Test 3 ──────────────────────────────────────────────────────────────────
  it('should return true when user has the required role', () => {
    mockAuthService.isLoggedIn.and.returnValue(true);
    mockAuthService.getRole.and.returnValue('ADMIN');
    const result = runGuard(createRoute('ADMIN'));
    expect(result).toBeTrue();
  });

  // ── Test 4 ──────────────────────────────────────────────────────────────────
  it('should return false when role does NOT match the required role', () => {
    mockAuthService.isLoggedIn.and.returnValue(true);
    mockAuthService.getRole.and.returnValue('EMPLOYEE');
    mockAuthService.getRoleRoute.and.returnValue('/employee');
    const result = runGuard(createRoute('ADMIN'));
    expect(result).toBeFalse();
  });

  // ── Test 5 ──────────────────────────────────────────────────────────────────
  it('should return true for EMPLOYEE role when route expects EMPLOYEE', () => {
    mockAuthService.isLoggedIn.and.returnValue(true);
    mockAuthService.getRole.and.returnValue('EMPLOYEE');
    const result = runGuard(createRoute('EMPLOYEE'));
    expect(result).toBeTrue();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { PolicyService } from '../../../core/services/policy.service';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockPolicyService: jasmine.SpyObj<PolicyService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'isLoggedIn', 'getRoleRoute', 'login'
    ]);
    mockPolicyService = jasmine.createSpyObj('PolicyService', ['getPublicPlans']);

    mockAuthService.isLoggedIn.and.returnValue(false);
    mockAuthService.getRoleRoute.and.returnValue('/employee');
    mockPolicyService.getPublicPlans.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        RouterTestingModule,
        MatIconModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: PolicyService, useValue: mockPolicyService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Test 1 ──────────────────────────────────────────────────────────────────
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // ── Test 2 ──────────────────────────────────────────────────────────────────
  it('loginForm should be invalid when empty', () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  // ── Test 3 ──────────────────────────────────────────────────────────────────
  it('loginForm should be valid with username and password filled', () => {
    component.loginForm.setValue({ username: 'john', password: 'pass123' });
    expect(component.loginForm.valid).toBeTrue();
  });

  // ── Test 4 ──────────────────────────────────────────────────────────────────
  it('onLogin() should NOT call AuthService.login if form is invalid', () => {
    component.loginForm.setValue({ username: '', password: '' });
    component.onLogin();
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  // ── Test 5 ──────────────────────────────────────────────────────────────────
  it('onLogin() should call AuthService.login when form is valid', () => {
    mockAuthService.login.and.returnValue(of({} as any));
    component.loginForm.setValue({ username: 'alice', password: 'secret' });
    component.onLogin();
    expect(mockAuthService.login).toHaveBeenCalledWith({ username: 'alice', password: 'secret' });
  });

  // ── Test 6 ──────────────────────────────────────────────────────────────────
  it('onLogin() should set errorMessage on error', () => {
    const mockError = { error: { message: 'Invalid credentials' } };
    mockAuthService.login.and.returnValue(throwError(() => mockError));
    component.loginForm.setValue({ username: 'alice', password: 'wrong' });
    component.onLogin();
    expect(component.errorMessage).toBe('Invalid credentials');
  });

  // ── Test 7 ──────────────────────────────────────────────────────────────────
  it('hidePassword should toggle from true to false', () => {
    expect(component.hidePassword).toBeTrue();
    component.hidePassword = false;
    expect(component.hidePassword).toBeFalse();
  });

  // ── Test 8 ──────────────────────────────────────────────────────────────────
  it('should load public plans on ngOnInit', () => {
    const mockPlans = [{ id: 1, name: 'Basic' }];
    mockPolicyService.getPublicPlans.and.returnValue(of(mockPlans));
    component.ngOnInit();
    expect(component.publicPlans.length).toBe(1);
  });
});

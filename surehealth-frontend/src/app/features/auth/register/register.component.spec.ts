import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { CorporateService } from '../../../core/services/corporate.service';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockCorporateService: jasmine.SpyObj<CorporateService>;

  beforeEach(async () => {
    mockCorporateService = jasmine.createSpyObj('CorporateService', ['register']);

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        ReactiveFormsModule,
        RouterTestingModule,
        MatIconModule,
        MatSnackBarModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: CorporateService, useValue: mockCorporateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Test 1 ──────────────────────────────────────────────────────────────────
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // ── Test 2 ──────────────────────────────────────────────────────────────────
  it('form should be invalid when all fields are empty', () => {
    expect(component.form.valid).toBeFalse();
  });

  // ── Test 3 ──────────────────────────────────────────────────────────────────
  it('contactEmail validator should reject invalid email', () => {
    component.form.patchValue({ contactEmail: 'not-an-email' });
    expect(component.form.get('contactEmail')?.valid).toBeFalse();
  });

  // ── Test 4 ──────────────────────────────────────────────────────────────────
  it('register() should NOT call CorporateService if form is invalid', () => {
    component.register();
    expect(mockCorporateService.register).not.toHaveBeenCalled();
  });

  // ── Test 5 ──────────────────────────────────────────────────────────────────
  it('register() should set success = true on successful registration', () => {
    mockCorporateService.register.and.returnValue(of(void 0));
    component.form.setValue({
      companyName: 'Acme',
      registrationNumber: 'REG123',
      contactPerson: 'Alice',
      contactEmail: 'alice@acme.com',
      contactPhone: '9876543210',
      numberOfEmployees: 50,
      industryType: 'IT',
      username: 'acme_hr',
      password: 'pass1'
    });
    component.register();
    expect(component.success).toBeTrue();
  });

  // ── Test 6 ──────────────────────────────────────────────────────────────────
  it('register() should reset loading to false on error', () => {
    mockCorporateService.register.and.returnValue(throwError(() => new Error('error')));
    component.form.setValue({
      companyName: 'Acme',
      registrationNumber: 'REG123',
      contactPerson: 'Alice',
      contactEmail: 'alice@acme.com',
      contactPhone: '9876543210',
      numberOfEmployees: 50,
      industryType: 'IT',
      username: 'acme_hr',
      password: 'pass1'
    });
    component.register();
    expect(component.loading).toBeFalse();
  });

  // ── Test 7 ──────────────────────────────────────────────────────────────────
  it('password should require minimum length of 4', () => {
    component.form.patchValue({ password: 'abc' });
    expect(component.form.get('password')?.valid).toBeFalse();
  });
});

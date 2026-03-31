import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HrEmployeeManagementComponent } from './employee-management.component';
import { CorporateService } from '../../../core/services/corporate.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('HrEmployeeManagementComponent', () => {
  let component: HrEmployeeManagementComponent;
  let fixture: ComponentFixture<HrEmployeeManagementComponent>;
  let mockCorporateService: jasmine.SpyObj<CorporateService>;
  let mockEmployeeService: jasmine.SpyObj<EmployeeService>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  const mockCorporate = { id: 1, companyName: 'Acme Corp' };
  const mockEmployees = [
    { id: 10, fullName: 'Alice', department: 'IT' },
    { id: 11, fullName: 'Bob', department: 'HR' }
  ];

  beforeEach(async () => {
    mockCorporateService = jasmine.createSpyObj('CorporateService', [
      'getMyProfile', 'getMyPolicies', 'getMyEmployees'
    ]);
    mockEmployeeService = jasmine.createSpyObj('EmployeeService', ['addEmployee']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    mockCorporateService.getMyProfile.and.returnValue(of(mockCorporate as any));
    mockCorporateService.getMyPolicies.and.returnValue(of([]));
    mockCorporateService.getMyEmployees.and.returnValue(of(mockEmployees as any));

    await TestBed.configureTestingModule({
      imports: [
        HrEmployeeManagementComponent,
        ReactiveFormsModule,
        MatIconModule,
        MatSnackBarModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: CorporateService, useValue: mockCorporateService },
        { provide: EmployeeService, useValue: mockEmployeeService },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HrEmployeeManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Test 1 ──────────────────────────────────────────────────────────────────
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // ── Test 2 ──────────────────────────────────────────────────────────────────
  it('should load employees on init', () => {
    expect(mockCorporateService.getMyEmployees).toHaveBeenCalled();
  });

  // ── Test 3 ──────────────────────────────────────────────────────────────────
  it('employees signal should hold the returned employees', () => {
    expect(component.employees().length).toBe(2);
  });

  // ── Test 4 ──────────────────────────────────────────────────────────────────
  it('form should be invalid when empty', () => {
    component.form.reset();
    expect(component.form.valid).toBeFalse();
  });

  // ── Test 5 ──────────────────────────────────────────────────────────────────
  it('addEmployee() should NOT call EmployeeService if form is invalid', () => {
    component.form.reset();
    component.addEmployee();
    expect(mockEmployeeService.addEmployee).not.toHaveBeenCalled();
  });

  // ── Test 6 ──────────────────────────────────────────────────────────────────
  it('corporate signal should be set after profile loads', () => {
    expect(component.corporate()?.companyName).toBe('Acme Corp');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { EmployeeDashboardComponent } from './dashboard.component';
import { EmployeeService } from '../../../core/services/employee.service';
import { ClaimService } from '../../../core/services/claim.service';
import { RouterTestingModule } from '@angular/router/testing';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('EmployeeDashboardComponent', () => {
  let component: EmployeeDashboardComponent;
  let fixture: ComponentFixture<EmployeeDashboardComponent>;
  let mockEmployeeService: jasmine.SpyObj<EmployeeService>;
  let mockClaimService: jasmine.SpyObj<ClaimService>;

  const mockProfile = { id: 1, name: 'John', email: 'john@test.com' };
  const mockClaims = [{ id: 10, status: 'PENDING' }, { id: 11, status: 'APPROVED' }];

  beforeEach(async () => {
    mockEmployeeService = jasmine.createSpyObj('EmployeeService', ['getMyProfile']);
    mockClaimService = jasmine.createSpyObj('ClaimService', ['getMyClaims']);

    mockEmployeeService.getMyProfile.and.returnValue(of(mockProfile as any));
    mockClaimService.getMyClaims.and.returnValue(of(mockClaims as any));

    await TestBed.configureTestingModule({
      imports: [
        EmployeeDashboardComponent,
        RouterTestingModule,
        MatIconModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: EmployeeService, useValue: mockEmployeeService },
        { provide: ClaimService, useValue: mockClaimService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Test 1 ──────────────────────────────────────────────────────────────────
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // ── Test 2 ──────────────────────────────────────────────────────────────────
  it('should call getMyProfile() on init', () => {
    expect(mockEmployeeService.getMyProfile).toHaveBeenCalled();
  });

  // ── Test 3 ──────────────────────────────────────────────────────────────────
  it('should call getMyClaims() on init', () => {
    expect(mockClaimService.getMyClaims).toHaveBeenCalled();
  });

  // ── Test 4 ──────────────────────────────────────────────────────────────────
  it('profile signal should hold the returned employee profile', () => {
    expect(component.profile()).toEqual(mockProfile as any);
  });

  // ── Test 5 ──────────────────────────────────────────────────────────────────
  it('claims signal should hold the returned claims array', () => {
    expect(component.claims().length).toBe(2);
  });

  // ── Test 6 ──────────────────────────────────────────────────────────────────
  it('loading signal should be false after profile is loaded', () => {
    expect(component.loading()).toBeFalse();
  });
});

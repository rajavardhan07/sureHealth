import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HrPolicyRequestComponent } from './policy-request.component';
import { CorporateService } from '../../../core/services/corporate.service';
import { PolicyService } from '../../../core/services/policy.service';
import { PlanService } from '../../../core/services/plan.service';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('HrPolicyRequestComponent', () => {
  let component: HrPolicyRequestComponent;
  let fixture: ComponentFixture<HrPolicyRequestComponent>;
  let mockCorporateService: jasmine.SpyObj<CorporateService>;
  let mockPolicyService: jasmine.SpyObj<PolicyService>;
  let mockPlanService: jasmine.SpyObj<PlanService>;

  const mockCorporate = { id: 1, companyName: 'Acme' };
  const mockPlans = [{ id: 10, name: 'Premium Plan' }];
  const mockEmployees = [{ id: 1 }, { id: 2 }];

  beforeEach(async () => {
    mockCorporateService = jasmine.createSpyObj('CorporateService', [
      'getMyProfile', 'getMyPolicies', 'getMyUnassignedEmployees'
    ]);
    mockPolicyService = jasmine.createSpyObj('PolicyService', ['requestPolicy', 'getQuote']);
    mockPlanService = jasmine.createSpyObj('PlanService', ['getActivePlans']);

    mockCorporateService.getMyProfile.and.returnValue(of(mockCorporate as any));
    mockCorporateService.getMyPolicies.and.returnValue(of([]));
    mockCorporateService.getMyUnassignedEmployees.and.returnValue(of(mockEmployees as any));
    mockPlanService.getActivePlans.and.returnValue(of(mockPlans as any));
    mockPolicyService.requestPolicy.and.returnValue(of(void 0));
    mockPolicyService.getQuote.and.returnValue(of({ premium: 1200 }));

    await TestBed.configureTestingModule({
      imports: [
        HrPolicyRequestComponent,
        ReactiveFormsModule,
        MatIconModule,
        MatSnackBarModule,
        MatDialogModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: CorporateService, useValue: mockCorporateService },
        { provide: PolicyService, useValue: mockPolicyService },
        { provide: PlanService, useValue: mockPlanService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HrPolicyRequestComponent);
    component = fixture.componentInstance;
    // Spy on the component's own snackBar instance
    spyOn((component as any).snackBar, 'open').and.callThrough();
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load plans on init', () => {
    expect(mockPlanService.getActivePlans).toHaveBeenCalled();
    expect(component.plans().length).toBe(1);
  });

  it('should load unassigned employees on init', () => {
    expect(mockCorporateService.getMyUnassignedEmployees).toHaveBeenCalled();
    expect(component.unassignedEmployees().length).toBe(2);
  });

  it('toggleEmployee() should add an employee ID to selection set', () => {
    component.toggleEmployee(5);
    expect(component.selectedEmployeeIds.has(5)).toBeTrue();
  });

  it('toggleEmployee() should remove an already-selected employee ID', () => {
    component.selectedEmployeeIds.add(5);
    component.toggleEmployee(5);
    expect(component.selectedEmployeeIds.has(5)).toBeFalse();
  });

  it('requestPolicy() should show snackbar when no employees are selected', () => {
    component.selectedEmployeeIds.clear();
    component.requestPolicy(10);
    expect((component as any).snackBar.open).toHaveBeenCalledWith(
      'Please select at least one employee', 'OK', { duration: 3000 }
    );
  });

  it('isAllSelected() should return true when all employees are selected', () => {
    component.unassignedEmployees.set(mockEmployees as any);
    component.selectedEmployeeIds = new Set([1, 2]);
    expect(component.isAllSelected()).toBeTrue();
  });

  it('getStatusClass() should return "approved" for APPROVED', () => {
    expect(component.getStatusClass('APPROVED')).toBe('approved');
  });

  it('formatStatus() should replace underscores with spaces', () => {
    expect(component.formatStatus('UNDER_REVIEW')).toBe('UNDER REVIEW');
  });
});

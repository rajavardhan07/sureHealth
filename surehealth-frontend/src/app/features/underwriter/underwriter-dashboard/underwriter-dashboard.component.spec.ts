import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UnderwriterDashboardComponent } from './underwriter-dashboard.component';
import { PolicyService } from '../../../core/services/policy.service';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('UnderwriterDashboardComponent', () => {
  let component: UnderwriterDashboardComponent;
  let fixture: ComponentFixture<UnderwriterDashboardComponent>;
  let mockPolicyService: jasmine.SpyObj<PolicyService>;

  const mockPolicies = [
    {
      id: 1, policyNumber: 'POL001', status: 'PENDING_UNDERWRITE',
      corporateClient: { companyName: 'Acme Corp' },
      insurancePlan: { planName: 'Gold Plan' }
    },
    {
      id: 2, policyNumber: 'POL002', status: 'PENDING_UNDERWRITE',
      corporateClient: { companyName: 'TechCo' },
      insurancePlan: { planName: 'Silver Plan' }
    }
  ];

  beforeEach(async () => {
    mockPolicyService = jasmine.createSpyObj('PolicyService', ['getUnderwriterQueue', 'underwritePolicy']);

    mockPolicyService.getUnderwriterQueue.and.returnValue(of(mockPolicies as any));
    mockPolicyService.underwritePolicy.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [
        UnderwriterDashboardComponent,
        MatIconModule,
        MatSnackBarModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: PolicyService, useValue: mockPolicyService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnderwriterDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call getUnderwriterQueue() on init', () => {
    expect(mockPolicyService.getUnderwriterQueue).toHaveBeenCalled();
  });

  it('policies signal should hold the returned queue', () => {
    expect(component.policies().length).toBe(2);
  });

  it('loading signal should be false after queue loads', () => {
    expect(component.loading()).toBeFalse();
  });

  it('approve() should call underwritePolicy with the given ID', () => {
    component.approve(1);
    expect(mockPolicyService.underwritePolicy).toHaveBeenCalledWith(1);
  });

  it('approve() should reload the queue after successful underwriting', () => {
    component.approve(2);
    expect(mockPolicyService.getUnderwriterQueue).toHaveBeenCalledTimes(2);
  });
});

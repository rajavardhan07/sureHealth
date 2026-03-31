import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ClaimManagementComponent } from './claim-management.component';
import { ClaimService } from '../../../core/services/claim.service';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ClaimManagementComponent', () => {
  let component: ClaimManagementComponent;
  let fixture: ComponentFixture<ClaimManagementComponent>;
  let mockClaimService: jasmine.SpyObj<ClaimService>;

  const mockClaims = [
    {
      id: 1, status: 'PENDING', claimNumber: 'CLM001', billAmount: 3000,
      employee: { fullName: 'Alice', corporateClient: { companyName: 'Acme Corp' } },
      assignedOfficer: null, reviewDate: null
    },
    {
      id: 2, status: 'APPROVED', claimNumber: 'CLM002', billAmount: 5000,
      employee: { fullName: 'Bob', corporateClient: { companyName: 'TechCo' } },
      assignedOfficer: { username: 'officer1' }, reviewDate: '2024-01-15'
    },
    {
      id: 3, status: 'SUSPENDED', claimNumber: 'CLM003', billAmount: 2000,
      employee: { fullName: 'Carol', corporateClient: { companyName: 'BizInc' } },
      assignedOfficer: null, reviewDate: null
    }
  ];

  beforeEach(async () => {
    mockClaimService = jasmine.createSpyObj('ClaimService', ['getAllClaims', 'suspendClaim']);
    mockClaimService.getAllClaims.and.returnValue(of(mockClaims as any));
    mockClaimService.suspendClaim.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [ClaimManagementComponent, MatIconModule, NoopAnimationsModule],
      providers: [{ provide: ClaimService, useValue: mockClaimService }]
    }).compileComponents();

    fixture = TestBed.createComponent(ClaimManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call getAllClaims() on init', () => {
    expect(mockClaimService.getAllClaims).toHaveBeenCalled();
  });

  it('claims signal should hold the full list of claims', () => {
    expect(component.claims().length).toBe(3);
  });

  it('loading signal should be false after claims load', () => {
    expect(component.loading()).toBeFalse();
  });

  it('getStatusClass() should return "status-approved" for APPROVED', () => {
    expect(component.getStatusClass('APPROVED')).toBe('status-approved');
  });

  it('getStatusClass() should return "status-suspended" for SUSPENDED', () => {
    expect(component.getStatusClass('SUSPENDED')).toBe('status-suspended');
  });

  it('getStatusClass() should return empty string for unknown status', () => {
    expect(component.getStatusClass('UNKNOWN')).toBe('');
  });
});

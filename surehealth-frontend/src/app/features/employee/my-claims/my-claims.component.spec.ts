import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MyClaimsComponent } from './my-claims.component';
import { ClaimService } from '../../../core/services/claim.service';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('MyClaimsComponent', () => {
  let component: MyClaimsComponent;
  let fixture: ComponentFixture<MyClaimsComponent>;
  let mockClaimService: jasmine.SpyObj<ClaimService>;

  const mockClaims = [
    { id: 1, status: 'PENDING', hospitalName: 'Apollo' },
    { id: 2, status: 'APPROVED', hospitalName: 'Fortis' },
    { id: 3, status: 'REJECTED', hospitalName: 'Medanta' }
  ];

  beforeEach(async () => {
    mockClaimService = jasmine.createSpyObj('ClaimService', ['getMyClaims']);
    mockClaimService.getMyClaims.and.returnValue(of(mockClaims as any));

    await TestBed.configureTestingModule({
      imports: [MyClaimsComponent, MatIconModule, NoopAnimationsModule],
      providers: [{ provide: ClaimService, useValue: mockClaimService }]
    }).compileComponents();

    fixture = TestBed.createComponent(MyClaimsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Test 1 ──────────────────────────────────────────────────────────────────
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // ── Test 2 ──────────────────────────────────────────────────────────────────
  it('should call getMyClaims() on init', () => {
    expect(mockClaimService.getMyClaims).toHaveBeenCalled();
  });

  // ── Test 3 ──────────────────────────────────────────────────────────────────
  it('claims signal should hold all returned claims', () => {
    expect(component.claims().length).toBe(3);
  });

  // ── Test 4 ──────────────────────────────────────────────────────────────────
  it('loading signal should be false after data is loaded', () => {
    expect(component.loading()).toBeFalse();
  });

  // ── Test 5 ──────────────────────────────────────────────────────────────────
  it('getStatusClass() should return "approved" for APPROVED status', () => {
    expect(component.getStatusClass('APPROVED')).toBe('approved');
  });

  // ── Test 6 ──────────────────────────────────────────────────────────────────
  it('getStatusClass() should return "rejected" for REJECTED status', () => {
    expect(component.getStatusClass('REJECTED')).toBe('rejected');
  });

  // ── Test 7 ──────────────────────────────────────────────────────────────────
  it('getStatusClass() should return "submitted" for unknown status', () => {
    expect(component.getStatusClass('SUBMITTED')).toBe('submitted');
  });
});

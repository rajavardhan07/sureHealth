import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CODashboardComponent } from './dashboard.component';
import { AdminService } from '../../../core/services/admin.service';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CODashboardComponent', () => {
  let component: CODashboardComponent;
  let fixture: ComponentFixture<CODashboardComponent>;
  let mockAdminService: jasmine.SpyObj<AdminService>;

  const mockData = { totalClaims: 20, pendingClaims: 5, approvedClaims: 12, rejectedClaims: 3 };

  beforeEach(async () => {
    mockAdminService = jasmine.createSpyObj('AdminService', ['getClaimsOfficerDashboard']);
    mockAdminService.getClaimsOfficerDashboard.and.returnValue(of(mockData as any));

    await TestBed.configureTestingModule({
      imports: [CODashboardComponent, MatIconModule, NoopAnimationsModule],
      providers: [{ provide: AdminService, useValue: mockAdminService }]
    }).compileComponents();

    fixture = TestBed.createComponent(CODashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Test 1 ──────────────────────────────────────────────────────────────────
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // ── Test 2 ──────────────────────────────────────────────────────────────────
  it('should call getClaimsOfficerDashboard() on init', () => {
    expect(mockAdminService.getClaimsOfficerDashboard).toHaveBeenCalled();
  });

  // ── Test 3 ──────────────────────────────────────────────────────────────────
  it('data signal should hold the dashboard DTO', () => {
    expect(component.data()?.totalClaims).toBe(20);
  });

  // ── Test 4 ──────────────────────────────────────────────────────────────────
  it('loading signal should be false after data loads', () => {
    expect(component.loading()).toBeFalse();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AdminService } from '../../../core/services/admin.service';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let mockAdminService: jasmine.SpyObj<AdminService>;

  const mockStats = {
    totalCorporates: 10,
    totalEmployees: 200,
    totalClaims: 50,
    pendingClaims: 8,
    totalPolicies: 15
  };

  beforeEach(async () => {
    mockAdminService = jasmine.createSpyObj('AdminService', ['getAdminStats']);
    mockAdminService.getAdminStats.and.returnValue(of(mockStats as any));

    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent, MatIconModule, NoopAnimationsModule],
      providers: [{ provide: AdminService, useValue: mockAdminService }]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Test 1 ──────────────────────────────────────────────────────────────────
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // ── Test 2 ──────────────────────────────────────────────────────────────────
  it('should call getAdminStats() on init', () => {
    expect(mockAdminService.getAdminStats).toHaveBeenCalled();
  });

  // ── Test 3 ──────────────────────────────────────────────────────────────────
  it('stats signal should hold the admin dashboard data', () => {
    expect(component.stats()?.totalEmployees).toBe(200);
  });

  // ── Test 4 ──────────────────────────────────────────────────────────────────
  it('loading signal should be false after data loads', () => {
    expect(component.loading()).toBeFalse();
  });

  // ── Test 5 ──────────────────────────────────────────────────────────────────
  it('loadStats() should re-call getAdminStats when invoked directly', () => {
    component.loadStats();
    expect(mockAdminService.getAdminStats).toHaveBeenCalledTimes(2);
  });
});

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PolicyService } from './policy.service';

describe('PolicyService', () => {
  let service: PolicyService;
  let httpMock: HttpTestingController;
  const BASE = 'http://localhost:8080/api/policy';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PolicyService]
    });
    service = TestBed.inject(PolicyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── Test 1 ──────────────────────────────────────────────────────────────────
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── Test 2 ──────────────────────────────────────────────────────────────────
  it('requestPolicy() should POST to /api/policy/request', () => {
    const dto = { planId: 1, employeeIds: [1, 2] };
    service.requestPolicy(dto as any).subscribe();
    const req = httpMock.expectOne(`${BASE}/request`);
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });

  // ── Test 3 ──────────────────────────────────────────────────────────────────
  it('getPendingPolicies() should GET /api/policy/pending', () => {
    service.getPendingPolicies().subscribe(p => expect(p).toEqual([]));
    const req = httpMock.expectOne(`${BASE}/pending`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  // ── Test 4 ──────────────────────────────────────────────────────────────────
  it('approvePolicy() should PUT to /api/policy/approve/{id}', () => {
    service.approvePolicy(9).subscribe();
    const req = httpMock.expectOne(`${BASE}/approve/9`);
    expect(req.request.method).toBe('PUT');
    req.flush(null);
  });

  // ── Test 5 ──────────────────────────────────────────────────────────────────
  it('rejectPolicy() should PUT to /api/policy/reject/{id}', () => {
    service.rejectPolicy(9).subscribe();
    const req = httpMock.expectOne(`${BASE}/reject/9`);
    expect(req.request.method).toBe('PUT');
    req.flush(null);
  });

  // ── Test 6 ──────────────────────────────────────────────────────────────────
  it('suspendPolicy() should PUT to /api/policy/{id}/suspend', () => {
    service.suspendPolicy(4).subscribe();
    const req = httpMock.expectOne(`${BASE}/4/suspend`);
    expect(req.request.method).toBe('PUT');
    req.flush(null);
  });

  // ── Test 7 ──────────────────────────────────────────────────────────────────
  it('getAllPolicies() should GET /api/policy/all', () => {
    const mockPolicies = [{ id: 1, status: 'ACTIVE' }];
    service.getAllPolicies().subscribe(p => expect(p.length).toBe(1));
    const req = httpMock.expectOne(`${BASE}/all`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPolicies);
  });

  // ── Test 8 ──────────────────────────────────────────────────────────────────
  it('getPublicPlans() should GET /api/plans/public', () => {
    const mockPlans = [{ id: 1, name: 'Basic Plan' }];
    service.getPublicPlans().subscribe(plans => expect(plans.length).toBe(1));
    const req = httpMock.expectOne('http://localhost:8080/api/plans/public');
    expect(req.request.method).toBe('GET');
    req.flush(mockPlans);
  });

  // ── Test 9 ──────────────────────────────────────────────────────────────────
  it('underwritePolicy() should PUT to /api/policy/{id}/underwrite', () => {
    service.underwritePolicy(11).subscribe();
    const req = httpMock.expectOne(`${BASE}/11/underwrite`);
    expect(req.request.method).toBe('PUT');
    req.flush(null);
  });
});

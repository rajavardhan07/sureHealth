import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClaimService } from './claim.service';

describe('ClaimService', () => {
  let service: ClaimService;
  let httpMock: HttpTestingController;
  const BASE = 'http://localhost:8080/api/claims';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClaimService]
    });
    service = TestBed.inject(ClaimService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── Test 1 ──────────────────────────────────────────────────────────────────
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── Test 2 ──────────────────────────────────────────────────────────────────
  it('getMyClaims() should GET /api/claims/me', () => {
    const mockClaims = [{ id: 1, status: 'PENDING' }];
    service.getMyClaims().subscribe(claims => {
      expect(claims.length).toBe(1);
      expect(claims[0].id).toBe(1);
    });
    const req = httpMock.expectOne(`${BASE}/me`);
    expect(req.request.method).toBe('GET');
    req.flush(mockClaims);
  });

  // ── Test 3 ──────────────────────────────────────────────────────────────────
  it('getReviewQueue() should GET /api/claims/review-queue', () => {
    const mockQueue = [{ id: 2, status: 'UNDER_REVIEW' }];
    service.getReviewQueue().subscribe(queue => expect(queue.length).toBe(1));
    const req = httpMock.expectOne(`${BASE}/review-queue`);
    expect(req.request.method).toBe('GET');
    req.flush(mockQueue);
  });

  // ── Test 4 ──────────────────────────────────────────────────────────────────
  it('getAllClaims() should GET /api/claims/all', () => {
    service.getAllClaims().subscribe(claims => expect(claims).toEqual([]));
    const req = httpMock.expectOne(`${BASE}/all`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  // ── Test 5 ──────────────────────────────────────────────────────────────────
  it('approveClaim() should PUT to /api/claims/{id}/approve', () => {
    const dto = { approvedAmount: 5000, remarks: 'OK' };
    service.approveClaim(42, dto as any).subscribe();
    const req = httpMock.expectOne(`${BASE}/42/approve`);
    expect(req.request.method).toBe('PUT');
    req.flush(null);
  });

  // ── Test 6 ──────────────────────────────────────────────────────────────────
  it('rejectClaim() should PUT to /api/claims/{id}/reject', () => {
    const dto = { reason: 'Insufficient docs' };
    service.rejectClaim(7, dto as any).subscribe();
    const req = httpMock.expectOne(`${BASE}/7/reject`);
    expect(req.request.method).toBe('PUT');
    req.flush(null);
  });

  // ── Test 7 ──────────────────────────────────────────────────────────────────
  it('suspendClaim() should PUT to /api/claims/{id}/suspend', () => {
    service.suspendClaim(3).subscribe();
    const req = httpMock.expectOne(`${BASE}/3/suspend`);
    expect(req.request.method).toBe('PUT');
    req.flush(null);
  });

  // ── Test 8 ──────────────────────────────────────────────────────────────────
  it('startReview() should PUT to /api/claims/{id}/start-review', () => {
    service.startReview(10).subscribe();
    const req = httpMock.expectOne(`${BASE}/10/start-review`);
    expect(req.request.method).toBe('PUT');
    req.flush(null);
  });

  // ── Test 9 ──────────────────────────────────────────────────────────────────
  it('getClaimById() should GET /api/claims/{id}', () => {
    const mockClaim = { id: 5, status: 'APPROVED' };
    service.getClaimById(5).subscribe(c => expect(c.id).toBe(5));
    const req = httpMock.expectOne(`${BASE}/5`);
    expect(req.request.method).toBe('GET');
    req.flush(mockClaim);
  });

  // ── Test 10 ─────────────────────────────────────────────────────────────────
  it('fileClaim() should POST to /api/claims/file', () => {
    const formData = new FormData();
    formData.append('hospitalName', 'City Hospital');
    service.fileClaim(formData).subscribe();
    const req = httpMock.expectOne(`${BASE}/file`);
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });
});

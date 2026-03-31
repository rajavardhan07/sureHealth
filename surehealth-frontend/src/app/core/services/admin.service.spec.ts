import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;
  const BASE = 'http://localhost:8080/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminService]
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── Test 1 ──────────────────────────────────────────────────────────────────
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── Test 2 ──────────────────────────────────────────────────────────────────
  it('createClaimsOfficer() should POST to /api/admin/claims-officers', () => {
    const dto = { name: 'Jane', username: 'jane', password: '1234' };
    service.createClaimsOfficer(dto as any).subscribe();
    const req = httpMock.expectOne(`${BASE}/admin/claims-officers`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 1, ...dto });
  });

  // ── Test 3 ──────────────────────────────────────────────────────────────────
  it('createUnderwriter() should POST to /api/admin/underwriters', () => {
    const dto = { name: 'Tom', username: 'tom', password: 'pass' };
    service.createUnderwriter(dto as any).subscribe();
    const req = httpMock.expectOne(`${BASE}/admin/underwriters`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 2, ...dto });
  });

  // ── Test 4 ──────────────────────────────────────────────────────────────────
  it('getAdminStats() should GET /api/dashboard/admin', () => {
    const mockStats = { totalClients: 100, totalEmployees: 200, pendingClaims: 10 };
    service.getAdminStats().subscribe(stats => expect(stats.totalClients).toBe(100));
    const req = httpMock.expectOne(`${BASE}/dashboard/admin`);
    expect(req.request.method).toBe('GET');
    req.flush(mockStats);
  });

  // ── Test 5 ──────────────────────────────────────────────────────────────────
  it('getAllCorporateClients() should GET /api/corporate/all', () => {
    const mockClients = [{ id: 1, companyName: 'Acme' }];
    service.getAllCorporateClients().subscribe(clients => expect(clients.length).toBe(1));
    const req = httpMock.expectOne(`${BASE}/corporate/all`);
    expect(req.request.method).toBe('GET');
    req.flush(mockClients);
  });

  // ── Test 6 ──────────────────────────────────────────────────────────────────
  it('suspendCorporateClient() should PUT to /api/corporate/{id}/suspend', () => {
    service.suspendCorporateClient(5).subscribe();
    const req = httpMock.expectOne(`${BASE}/corporate/5/suspend`);
    expect(req.request.method).toBe('PUT');
    req.flush({ id: 5 });
  });

  // ── Test 7 ──────────────────────────────────────────────────────────────────
  it('getClaimsOfficers() should GET /api/admin/claims-officers', () => {
    service.getClaimsOfficers().subscribe(list => expect(list).toEqual([]));
    const req = httpMock.expectOne(`${BASE}/admin/claims-officers`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  // ── Test 8 ──────────────────────────────────────────────────────────────────
  it('getUnderwriters() should GET /api/admin/underwriters', () => {
    service.getUnderwriters().subscribe(list => expect(list).toEqual([]));
    const req = httpMock.expectOne(`${BASE}/admin/underwriters`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});

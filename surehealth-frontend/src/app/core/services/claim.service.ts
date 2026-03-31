import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Claim, ClaimCreateDTO, ClaimApprovalDTO, ClaimRejectionDTO } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class ClaimService {
  private apiUrl = 'http://localhost:8080/api/claims';

  constructor(private http: HttpClient) {}

  fileClaim(formData: FormData): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/file`, formData);
  }

  getMyClaims(): Observable<Claim[]> {
    return this.http.get<Claim[]>(`${this.apiUrl}/me`);
  }

  getReviewQueue(): Observable<Claim[]> {
    return this.http.get<Claim[]>(`${this.apiUrl}/review-queue`);
  }

  startReview(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/start-review`, {});
  }

  approveClaim(id: number, dto: ClaimApprovalDTO): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/approve`, dto);
  }

  requestMoreInfo(id: number, dto: ClaimRejectionDTO): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/request-more-info`, dto);
  }

  rejectClaim(id: number, dto: ClaimRejectionDTO): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/reject`, dto);
  }

  getClaimById(id: number): Observable<Claim> {
    return this.http.get<Claim>(`${this.apiUrl}/${id}`);
  }

  getAllClaims(): Observable<Claim[]> {
    return this.http.get<Claim[]>(`${this.apiUrl}/all`);
  }

  suspendClaim(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/suspend`, {});
  }

  downloadClaimReport(claimId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${claimId}/report`, { responseType: 'blob' });
  }

  verifyOcr(claimId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${claimId}/verify-ocr`);
  }

  respondToIssue(claimId: number, formData: FormData): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${claimId}/respond-to-issue`, formData);
  }
}

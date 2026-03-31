import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GroupPolicy, PolicyRequestDTO } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class PolicyService {
  private apiUrl = 'http://localhost:8080/api/policy';

  constructor(private http: HttpClient) {}

  requestPolicy(dto: PolicyRequestDTO): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/request`, dto);
  }

  getPendingPolicies(): Observable<GroupPolicy[]> {
    return this.http.get<GroupPolicy[]>(`${this.apiUrl}/pending`);
  }

  getPolicyById(id: number): Observable<GroupPolicy> {
    return this.http.get<GroupPolicy>(`${this.apiUrl}/${id}`);
  }

  getQuote(planId: number, employeeIds: number[] = []): Observable<any> {
    let url = `${this.apiUrl}/quote?planId=${planId}`;
    if (employeeIds.length > 0) {
      url += `&employeeIds=${employeeIds.join(',')}`;
    }
    return this.http.get<any>(url);
  }

  getPublicPlans(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8080/api/plans/public');
  }

  approvePolicy(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/approve/${id}`, {});
  }

  rejectPolicy(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/reject/${id}`, {});
  }

  getUnderwriterQueue(): Observable<GroupPolicy[]> {
    return this.http.get<GroupPolicy[]>(`${this.apiUrl}/underwriter/queue`);
  }

  underwritePolicy(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/underwrite`, {});
  }

  getAllPolicies(): Observable<GroupPolicy[]> {
    return this.http.get<GroupPolicy[]>(`${this.apiUrl}/all`);
  }

  suspendPolicy(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/suspend`, {});
  }

  sendQuote(id: number, customPremiumPerEmployee: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/send-quote`, { customPremiumPerEmployee });
  }

  raiseIssue(id: number, reason: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/raise-issue`, { reason });
  }

  resubmitPolicy(id: number, dto: PolicyRequestDTO): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/resubmit`, dto);
  }

  updatePolicy(id: number, data: import('../../shared/models').PolicyUpdateDTO): Observable<GroupPolicy> {
    return this.http.put<GroupPolicy>(`${this.apiUrl}/${id}`, data);
  }
}

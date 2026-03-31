import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, ClaimsOfficerCreateDTO, UnderwriterCreateDTO, ClaimsOfficerDashboardDTO, CorporateClient, AdminDashboardDTO, OfficerUpdateDTO, UnderwriterDashboardDTO } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  createClaimsOfficer(dto: ClaimsOfficerCreateDTO): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/admin/claims-officers`, dto);
  }

  createUnderwriter(dto: UnderwriterCreateDTO): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/admin/underwriters`, dto);
  }

  getClaimsOfficerDashboard(): Observable<ClaimsOfficerDashboardDTO> {
    console.log("Claims Officer Dashboard service called");
    return this.http.get<ClaimsOfficerDashboardDTO>(`${this.apiUrl}/dashboard/claims-officer`);
  }

  getUnderwriterDashboard(): Observable<UnderwriterDashboardDTO> {
    return this.http.get<UnderwriterDashboardDTO>(`${this.apiUrl}/dashboard/underwriter`);
  }

  getAllCorporateClients(): Observable<CorporateClient[]> {
    return this.http.get<CorporateClient[]>(`${this.apiUrl}/corporate/all`);
  }

  suspendCorporateClient(id: number): Observable<CorporateClient> {
    return this.http.put<CorporateClient>(`${this.apiUrl}/corporate/${id}/suspend`, {});
  }

  activateCorporateClient(id: number): Observable<CorporateClient> {
    return this.http.put<CorporateClient>(`${this.apiUrl}/corporate/${id}/activate`, {});
  }

  getAdminStats(): Observable<AdminDashboardDTO> {
    return this.http.get<AdminDashboardDTO>(`${this.apiUrl}/dashboard/admin`);
  }

  updateOfficer(id: number, data: OfficerUpdateDTO): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/admin/officers/${id}`, data);
  }

  toggleOfficerStatus(id: number, action: 'ACTIVE' | 'SUSPEND', state: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/admin/officers/${id}/status?action=${action}&state=${state}`, {});
  }

  getClaimsOfficers(): Observable<User[]> {
    console.log("Claims Officers service called");
    return this.http.get<User[]>(`${this.apiUrl}/admin/claims-officers`);
  }

  getUnderwriters(): Observable<User[]> {
    console.log("Underwriters service called");
    return this.http.get<User[]>(`${this.apiUrl}/admin/underwriters`);
  }

  changePassword(userId: number, password: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/admin/users/${userId}/password`, { password });
  }

  assignClaim(claimId: number, officerId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/admin/claims/${claimId}/assign?officerId=${officerId}`, {});
  }

  assignPolicy(policyId: number, underwriterId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/admin/policies/${policyId}/assign?underwriterId=${underwriterId}`, {});
  }
}

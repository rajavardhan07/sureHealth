import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, ClaimsOfficerCreateDTO, UnderwriterCreateDTO, ClaimsOfficerDashboardDTO, CorporateClient } from '../../shared/models';

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
    return this.http.get<ClaimsOfficerDashboardDTO>(`${this.apiUrl}/dashboard/claims-officer`);
  }

  getAllCorporateClients(): Observable<CorporateClient[]> {
    return this.http.get<CorporateClient[]>(`${this.apiUrl}/corporate/all`);
  }

  suspendCorporateClient(id: number): Observable<CorporateClient> {
    return this.http.put<CorporateClient>(`${this.apiUrl}/corporate/${id}/suspend`, {});
  }
}

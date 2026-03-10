import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CorporateClient, CorporateRegisterDTO, GroupPolicy, Employee } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class CorporateService {
  private apiUrl = 'http://localhost:8080/api/corporate';

  constructor(private http: HttpClient) {}

  register(dto: CorporateRegisterDTO): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/register`, dto);
  }

  getMyProfile(): Observable<CorporateClient> {
    return this.http.get<CorporateClient>(`${this.apiUrl}/me`);
  }

  getMyPolicies(): Observable<GroupPolicy[]> {
    return this.http.get<GroupPolicy[]>(`${this.apiUrl}/me/policies`);
  }

  getMyEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/me/employees`);
  }

  getMyUnassignedEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/me/employees/unassigned`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InsurancePlan } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class PlanService {
  private apiUrl = 'http://localhost:8080/api/plans';

  constructor(private http: HttpClient) {}

  getActivePlans(): Observable<InsurancePlan[]> {
    return this.http.get<InsurancePlan[]>(this.apiUrl);
  }

  getPlanById(id: number): Observable<InsurancePlan> {
    return this.http.get<InsurancePlan>(`${this.apiUrl}/${id}`);
  }

  createPlan(plan: Partial<InsurancePlan>): Observable<InsurancePlan> {
    return this.http.post<InsurancePlan>(this.apiUrl, plan);
  }

  updatePlan(id: number, plan: Partial<InsurancePlan>): Observable<InsurancePlan> {
    return this.http.put<InsurancePlan>(`${this.apiUrl}/${id}`, plan);
  }

  deletePlan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deactivatePlan(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  activatePlan(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/activate`, {});
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PremiumInvoice } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private apiUrl = 'http://localhost:8080/api/invoices';

  constructor(private http: HttpClient) {}

  getMyInvoices(): Observable<PremiumInvoice[]> {
    return this.http.get<PremiumInvoice[]>(`${this.apiUrl}/my`);
  }

  getAllInvoices(): Observable<PremiumInvoice[]> {
    return this.http.get<PremiumInvoice[]>(`${this.apiUrl}/all`);
  }

  getInvoicesByPolicy(policyId: number): Observable<PremiumInvoice[]> {
    return this.http.get<PremiumInvoice[]>(`${this.apiUrl}/policy/${policyId}`);
  }

  generateInvoice(policyId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/generate/${policyId}`, {});
  }
}

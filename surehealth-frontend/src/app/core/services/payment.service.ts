import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment, PaymentDTO, PremiumInvoice } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private apiUrl = 'http://localhost:8080/api/payments';

  constructor(private http: HttpClient) {}

  payInvoice(dto: PaymentDTO): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/pay`, dto);
  }

  getPaymentsByInvoice(invoiceId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/invoice/${invoiceId}`);
  }

  getInvoiceDetails(invoiceId: number): Observable<PremiumInvoice> {
    return this.http.get<PremiumInvoice>(`${this.apiUrl}/invoice/${invoiceId}/details`);
  }

  getInvoicesByPolicy(policyId: number): Observable<PremiumInvoice[]> {
    return this.http.get<PremiumInvoice[]>(`http://localhost:8080/api/invoices/policy/${policyId}`);
  }
}

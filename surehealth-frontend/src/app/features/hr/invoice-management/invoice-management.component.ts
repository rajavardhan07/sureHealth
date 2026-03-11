import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../../core/services/invoice.service';
import { PaymentService } from '../../../core/services/payment.service';
import { PremiumInvoice, PaymentMode } from '../../../shared/models';

@Component({
  selector: 'app-hr-invoice-management',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule, MatInputModule, MatSnackBarModule, MatProgressSpinnerModule, MatCardModule],
  templateUrl: './invoice-management.component.html',
  styleUrl: './invoice-management.component.css'})
export class HrInvoiceManagementComponent implements OnInit {
  invoices: PremiumInvoice[] = [];
  loading = true;
  paymentModes: { [key: number]: string } = {};

  constructor(private invoiceService: InvoiceService, private paymentService: PaymentService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.invoiceService.getMyInvoices().subscribe({
      next: (data) => { this.invoices = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  pay(inv: PremiumInvoice) {
    const mode = this.paymentModes[inv.id] as PaymentMode;
    if (!mode) return;
    this.paymentService.payInvoice({ invoiceId: inv.id, amountPaid: inv.totalAmount, paymentMode: mode }).subscribe({
      next: () => {
        this.snackBar.open('Payment successful!', 'OK', { duration: 3000 });
        inv.status = 'PAID' as any;
      },
      error: () => {} // Error handled by interceptor
    });
  }

  getStatusClass(status: string): string {
    return status ? status.toLowerCase() : 'pending';
  }

  formatStatus(status: string): string {
    return status ? status.replace(/_/g, ' ') : 'Pending';
  }
}

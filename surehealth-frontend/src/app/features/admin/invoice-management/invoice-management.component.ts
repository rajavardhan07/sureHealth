import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InvoiceService } from '../../../core/services/invoice.service';
import { PremiumInvoice } from '../../../shared/models';

@Component({
  selector: 'app-admin-invoice-management',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './invoice-management.component.html',
  styleUrl: './invoice-management.component.css'})
export class AdminInvoiceManagementComponent implements OnInit {
  invoices = signal<PremiumInvoice[]>([]);
  loading = signal(true);
  columns = ['invoiceNumber', 'company', 'amount', 'dueDate', 'status'];

  constructor(private invoiceService: InvoiceService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.invoiceService.getAllInvoices().subscribe({
      next: (data) => { this.invoices.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }
}

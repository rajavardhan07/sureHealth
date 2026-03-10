import { Component, OnInit } from '@angular/core';
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
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule],
  templateUrl: './invoice-management.component.html',
  styleUrl: './invoice-management.component.css'})
export class AdminInvoiceManagementComponent implements OnInit {
  invoices: PremiumInvoice[] = [];
  loading = true;
  columns = ['invoiceNumber', 'company', 'amount', 'dueDate', 'status'];

  constructor(private invoiceService: InvoiceService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.invoiceService.getAllInvoices().subscribe({
      next: (data) => { this.invoices = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}

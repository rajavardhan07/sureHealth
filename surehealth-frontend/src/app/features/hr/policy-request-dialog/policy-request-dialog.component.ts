import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CorporateService } from '../../../core/services/corporate.service';
import { PolicyService } from '../../../core/services/policy.service';
import { Employee } from '../../../shared/models';

@Component({
  selector: 'app-policy-request-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatSnackBarModule],
  templateUrl: './policy-request-dialog.component.html',
  styleUrl: './policy-request-dialog.component.css'
})
export class PolicyRequestDialogComponent implements OnInit {
  employees = signal<Employee[]>([]);
  loading = signal(true);
  submitting = signal(false);
  fetchingQuote = signal(false);
  selectedIds = new Set<number>();
  quote: any = null;

  // Pagination
  page = signal(1);
  pageSize = 6;

  constructor(
    private corporateService: CorporateService,
    private policyService: PolicyService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<PolicyRequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      planId: number;
      planName: string;
      corporateId: number;
      premiumPerEmployee: number;
      coverageAmount: number;
      policyId?: number;
      selectedEmployeeIds?: number[];
      underwriterComment?: string;
    }
  ) {}

  ngOnInit() {
    if (this.data.policyId) {
      this.corporateService.getMyEmployeesForResubmit(this.data.policyId).subscribe({
        next: (emps) => { 
          this.employees.set(emps); 
          let hasEmps = false;
          // First attempt: use direct list of ids if passed through
          if (this.data.selectedEmployeeIds && this.data.selectedEmployeeIds.length > 0) {
            this.data.selectedEmployeeIds.forEach(id => this.selectedIds.add(id));
            hasEmps = true;
          } else {
            // Second attempt fallback: check the groupPolicy inside the employee list
            emps.forEach(emp => {
               if (emp.groupPolicy && emp.groupPolicy.id === this.data.policyId) {
                 this.selectedIds.add(emp.id);
                 hasEmps = true;
               }
            });
          }
          if (!hasEmps && emps.length > 0) {
             // Ultimate fallback so the submit button doesn't freeze because size === 0.
             // We just add everyone returned (since findUnassignedOrAssignedToPolicy returns them)
             emps.forEach(emp => this.selectedIds.add(emp.id));
          }

          this.loading.set(false); 
        },
        error: () => this.loading.set(false)
      });
    } else {
      this.corporateService.getMyUnassignedEmployees().subscribe({
        next: (emps) => { this.employees.set(emps); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    }
  }

  get paginatedEmployees(): Employee[] {
    const start = (this.page() - 1) * this.pageSize;
    return this.employees().slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.employees().length / this.pageSize) || 1;
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  toggleEmployee(id: number) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
    this.quote = null; // Reset quote when selection changes
  }

  toggleAll() {
    if (this.selectedIds.size === this.employees().length) {
      this.selectedIds.clear();
    } else {
      this.employees().forEach(e => this.selectedIds.add(e.id));
    }
    this.quote = null;
  }

  isAllSelected(): boolean {
    return this.employees().length > 0 && this.selectedIds.size === this.employees().length;
  }

  getQuote() {
    if (this.selectedIds.size === 0) return;
    this.fetchingQuote.set(true);
    const empIds = Array.from(this.selectedIds);
    this.policyService.getQuote(this.data.planId, empIds).subscribe({
      next: (q) => { this.quote = q; this.fetchingQuote.set(false); },
      error: () => {
        this.fetchingQuote.set(false);
        this.snackBar.open('Failed to fetch quote', 'OK', { duration: 3000 });
      }
    });
  }

  submitRequest() {
    if (this.selectedIds.size === 0) return;
    this.submitting.set(true);

    const payload = {
      corporateId: this.data.corporateId,
      planId: this.data.planId,
      employeeIds: Array.from(this.selectedIds)
    };

    const request$ = this.data.policyId 
      ? this.policyService.resubmitPolicy(this.data.policyId, payload)
      : this.policyService.requestPolicy(payload);

    request$.subscribe({
      next: () => {
        this.submitting.set(false);
        const msg = this.data.policyId ? 'Policy resubmitted successfully!' : 'Policy request submitted for underwriter review!';
        this.snackBar.open(msg, 'OK', { duration: 3000, panelClass: ['success-snackbar'] });
        this.dialogRef.close(true);
      },
      error: () => {
        this.submitting.set(false);
        this.snackBar.open('Failed to submit policy request', 'OK', { duration: 3000, panelClass: ['error-snackbar'] });
      }
    });
  }

  close() {
    this.dialogRef.close(false);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddEmployeeDialogComponent } from './add-employee-dialog.component';
import { CorporateService } from '../../../core/services/corporate.service';
import { PolicyService } from '../../../core/services/policy.service';
import { PlanService } from '../../../core/services/plan.service';
import { GroupPolicy, InsurancePlan, CorporateClient, Employee } from '../../../shared/models';

@Component({
  selector: 'app-hr-policy-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatTableModule, MatSnackBarModule, MatProgressSpinnerModule, MatCheckboxModule, MatDialogModule],
  templateUrl: './policy-request.component.html',
  styleUrl: './policy-request.component.css'})
export class HrPolicyRequestComponent implements OnInit {
  corporate: CorporateClient | null = null;
  plans: InsurancePlan[] = [];
  policies: GroupPolicy[] = [];
  loadingPolicies = true;
  unassignedEmployees: Employee[] = [];
  selectedEmployeeIds = new Set<number>();
  loadingEmployees = true;
  quotes: { [planId: number]: any } = {};
  fetchingQuote: number | null = null;
  columns = ['policyNumber', 'plan', 'underwriter', 'startDate', 'endDate', 'status'];
  empColumns = ['select', 'name', 'department', 'age'];

  constructor(
    private corporateService: CorporateService,
    private policyService: PolicyService,
    private planService: PlanService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.corporateService.getMyProfile().subscribe(c => this.corporate = c);
    this.planService.getActivePlans().subscribe(p => this.plans = p);
    this.loadPolicies();
    this.loadUnassignedEmployees();
  }

  loadUnassignedEmployees() {
    this.loadingEmployees = true;
    this.corporateService.getMyUnassignedEmployees().subscribe({
      next: (data) => {
        this.unassignedEmployees = data;
        this.loadingEmployees = false;
      },
      error: () => { this.loadingEmployees = false; }
    });
  }

  toggleEmployee(id: number) {
    if (this.selectedEmployeeIds.has(id)) {
      this.selectedEmployeeIds.delete(id);
    } else {
      this.selectedEmployeeIds.add(id);
    }
  }

  toggleAll() {
    if (this.selectedEmployeeIds.size === this.unassignedEmployees.length) {
      this.selectedEmployeeIds.clear();
    } else {
      this.unassignedEmployees.forEach(e => this.selectedEmployeeIds.add(e.id));
    }
  }

  isAllSelected() {
    return this.unassignedEmployees.length > 0 && this.selectedEmployeeIds.size === this.unassignedEmployees.length;
  }

  loadPolicies() {
    this.loadingPolicies = true;
    this.corporateService.getMyPolicies().subscribe({
      next: (data) => { this.policies = data; this.loadingPolicies = false; },
      error: () => { this.loadingPolicies = false; }
    });
  }

  getQuote(planId: number) {
    if (this.selectedEmployeeIds.size === 0) {
      this.snackBar.open('Please select at least one employee to get an accurate quote', 'OK', { duration: 3000 });
      return;
    }
    this.fetchingQuote = planId;
    const employeeIds = Array.from(this.selectedEmployeeIds);
    this.policyService.getQuote(planId, employeeIds).subscribe({
      next: (quote) => { 
        this.quotes[planId] = quote; 
        this.fetchingQuote = null; 
      },
      error: () => { 
        this.snackBar.open('Failed to calculate quote', 'OK', { duration: 3000 });
        this.fetchingQuote = null; 
      }
    });
  }

  requestPolicy(planId: number) {
    if (!this.corporate) return;
    if (this.selectedEmployeeIds.size === 0) {
      this.snackBar.open('Please select at least one employee', 'OK', { duration: 3000 });
      return;
    }
    
    const payload = { 
      corporateId: this.corporate.id, 
      planId: planId, 
      employeeIds: Array.from(this.selectedEmployeeIds) 
    };

    this.policyService.requestPolicy(payload).subscribe({
      next: () => { 
        this.snackBar.open('Policy request submitted for underwriter review!', 'OK', { duration: 3000 }); 
        this.selectedEmployeeIds.clear();
        this.loadPolicies(); 
        this.loadUnassignedEmployees();
      },
      error: () => { this.snackBar.open('Failed to submit request', 'OK', { duration: 3000 }); }
    });
  }

  openAddEmployeeDialog() {
    if (!this.corporate) return;
    
    const dialogRef = this.dialog.open(AddEmployeeDialogComponent, {
      width: '600px',
      data: { corporateId: this.corporate.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUnassignedEmployees();
      }
    });
  }

  getStatusClass(status: string): string {
    if (!status) return 'pending';
    if (status === 'APPROVED') return 'approved';
    if (status === 'REJECTED') return 'rejected';
    return 'pending';
  }

  formatStatus(status: string): string {
    return status ? status.replace(/_/g, ' ') : 'Pending';
  }
}

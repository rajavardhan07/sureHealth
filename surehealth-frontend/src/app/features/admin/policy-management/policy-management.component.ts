import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PolicyService } from '../../../core/services/policy.service';
import { GroupPolicy } from '../../../shared/models';

@Component({
  selector: 'app-policy-management',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatTabsModule, MatSnackBarModule, MatProgressSpinnerModule],
  templateUrl: './policy-management.component.html',
  styleUrl: './policy-management.component.css'})
export class PolicyManagementComponent implements OnInit {
  pendingPolicies: GroupPolicy[] = [];
  loadingPending = true;
  pendingColumns = ['policyNumber', 'company', 'plan', 'premium', 'status', 'actions'];

  constructor(private policyService: PolicyService, private snackBar: MatSnackBar) {}

  ngOnInit() { this.loadPending(); }

  loadPending() {
    this.loadingPending = true;
    this.policyService.getPendingPolicies().subscribe({
      next: (data) => { this.pendingPolicies = data; this.loadingPending = false; },
      error: () => { this.loadingPending = false; }
    });
  }

  approve(id: number) {
    this.policyService.approvePolicy(id).subscribe({
      next: () => { this.snackBar.open('Policy approved successfully', 'OK', { duration: 3000 }); this.loadPending(); },
      error: () => { this.snackBar.open('Failed to approve policy', 'OK', { duration: 3000 }); }
    });
  }

  reject(id: number) {
    this.policyService.rejectPolicy(id).subscribe({
      next: () => { this.snackBar.open('Policy rejected', 'OK', { duration: 3000 }); this.loadPending(); },
      error: () => { this.snackBar.open('Failed to reject policy', 'OK', { duration: 3000 }); }
    });
  }
}

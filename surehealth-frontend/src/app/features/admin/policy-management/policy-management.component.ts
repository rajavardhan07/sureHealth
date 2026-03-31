import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PolicyService } from '../../../core/services/policy.service';
import { AdminService } from '../../../core/services/admin.service';
import { GroupPolicy, User } from '../../../shared/models';

@Component({
  selector: 'app-policy-management',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule, MatTabsModule, MatSnackBarModule, MatProgressSpinnerModule],
  templateUrl: './policy-management.component.html',
  styleUrl: './policy-management.component.css'})
export class PolicyManagementComponent implements OnInit {
  pendingPolicies = signal<GroupPolicy[]>([]);
  allPolicies = signal<GroupPolicy[]>([]);
  underwriters = signal<User[]>([]);
  loadingPending = signal(true);
  loadingAll = signal(false);
  pendingColumns = ['policyNumber', 'company', 'plan', 'premium', 'status', 'actions'];
  allColumns = ['policyNumber', 'company', 'plan', 'status', 'actions'];

  // Edit Feature
  editModalOpen = signal(false);
  selectedEditPolicy = signal<GroupPolicy | null>(null);
  editPolicyForm: Partial<import('../../../shared/models').PolicyUpdateDTO> = {};

  constructor(
    private policyService: PolicyService, 
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() { 
    this.loadPending(); 
    this.loadAll();
    this.adminService.getUnderwriters().subscribe(data => this.underwriters.set(data));
  }

  assignUnderwriter(policyId: number, event: Event) {
    const target = event.target as HTMLSelectElement;
    const underwriterId = target.value;
    if (!underwriterId) return;
    
    this.adminService.assignPolicy(policyId, +underwriterId).subscribe({
      next: () => {
         this.snackBar.open('Underwriter reassigned successfully', 'OK', { duration: 3000 });
         this.loadPending();
         this.loadAll();
         target.value = '';
      },
      error: () => this.snackBar.open('Failed to reassign underwriter', 'OK', { duration: 3000 })
    });
  }

  loadPending() {
    this.loadingPending.set(true);
    this.policyService.getPendingPolicies().subscribe({
      next: (data) => { this.pendingPolicies.set(data); this.loadingPending.set(false); },
      error: () => { this.loadingPending.set(false); }
    });
  }

  loadAll() {
    this.loadingAll.set(true);
    this.policyService.getAllPolicies().subscribe({
      next: (data) => { this.allPolicies.set(data); this.loadingAll.set(false); },
      error: () => { this.loadingAll.set(false); }
    });
  }

  approve(id: number) {
    this.policyService.approvePolicy(id).subscribe({
      next: () => { 
        this.snackBar.open('Policy approved successfully', 'OK', { duration: 3000 }); 
        this.loadPending(); 
        this.loadAll();
      },
      error: () => { this.snackBar.open('Failed to approve policy', 'OK', { duration: 3000 }); }
    });
  }

  reject(id: number) {
    this.policyService.rejectPolicy(id).subscribe({
      next: () => { 
        this.snackBar.open('Policy rejected', 'OK', { duration: 3000 }); 
        this.loadPending(); 
        this.loadAll();
      },
      error: () => { this.snackBar.open('Failed to reject policy', 'OK', { duration: 3000 }); }
    });
  }

  suspend(id: number) {
    if (confirm('Are you sure you want to suspend this policy?')) {
      this.policyService.suspendPolicy(id).subscribe({
        next: () => {
          this.snackBar.open('Policy suspended', 'OK', { duration: 3000 }); 
          this.loadPending();
          this.loadAll();
        },
        error: () => { this.snackBar.open('Failed to suspend policy', 'OK', { duration: 3000 }); }
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'status-approved';
      case 'REJECTED': return 'status-rejected';
      case 'SUSPENDED': return 'status-suspended';
      case 'PENDING_ADMIN_APPROVAL': return 'status-pending';
      case 'PENDING_UNDERWRITER_REVIEW': return 'status-review';
      default: return '';
    }
  }

  openEditModal(policy: GroupPolicy) {
    this.selectedEditPolicy.set(policy);
    this.editPolicyForm = {
      status: policy.status,
      billingCycle: policy.billingCycle,
      basePremium: policy.basePremium,
      customPremiumPerEmployee: policy.customPremiumPerEmployee,
      waitingPeriodDays: policy.waitingPeriodDays,
      startDate: policy.startDate,
      endDate: policy.endDate
    };
    this.editModalOpen.set(true);
  }

  closeEditModal() {
    this.editModalOpen.set(false);
    this.selectedEditPolicy.set(null);
    this.editPolicyForm = {};
  }

  savePolicyEdits() {
    const policy = this.selectedEditPolicy();
    if (!policy) return;

    this.policyService.updatePolicy(policy.id, this.editPolicyForm).subscribe({
      next: () => {
        this.snackBar.open('Policy updated successfully', 'OK', { duration: 3000 });
        this.closeEditModal();
        this.loadAll();
      },
      error: () => this.snackBar.open('Failed to update policy', 'OK', { duration: 3000 })
    });
  }
}

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PolicyRequestDialogComponent } from '../policy-request-dialog/policy-request-dialog.component';
import { CorporateService } from '../../../core/services/corporate.service';
import { PolicyService } from '../../../core/services/policy.service';
import { PlanService } from '../../../core/services/plan.service';
import { GroupPolicy, InsurancePlan, CorporateClient } from '../../../shared/models';

@Component({
  selector: 'app-hr-policy-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatSnackBarModule, MatDialogModule],
  templateUrl: './policy-request.component.html',
  styleUrl: './policy-request.component.css'})
export class HrPolicyRequestComponent implements OnInit {
  corporate = signal<CorporateClient | null>(null);
  plans = signal<InsurancePlan[]>([]);
  policies = signal<GroupPolicy[]>([]);

  // Analytics Metrics
  get activePoliciesCount() {
    return this.policies().filter(p => p.status === 'APPROVED').length;
  }

  get pendingPoliciesCount() {
    return this.policies().filter(p => 
      p.status === 'PENDING_ADMIN_APPROVAL' || 
      p.status === 'PENDING_UNDERWRITER_REVIEW' || 
      p.status === 'PENDING_HR_APPROVAL'
    ).length;
  }

  get totalPlansAvailable() {
    return this.plans().length;
  }

  // Policy table search & pagination
  policySearch = signal('');
  policyStatusFilter = signal('ALL');
  policyPage = signal(1);
  policyPageSize = 5;

  filteredPolicies = computed(() => {
    return this.policies().filter(p => {
      const matchSearch = (p.policyNumber || '').toLowerCase().includes(this.policySearch().toLowerCase()) ||
                          (p.insurancePlan?.planName || '').toLowerCase().includes(this.policySearch().toLowerCase());
      let matchStatus = true;
      if (this.policyStatusFilter() !== 'ALL') {
        matchStatus = p.status === this.policyStatusFilter();
      }
      return matchSearch && matchStatus;
    });
  });

  paginatedPolicies = computed(() => {
    const start = (this.policyPage() - 1) * this.policyPageSize;
    return this.filteredPolicies().slice(start, start + this.policyPageSize);
  });

  policyTotalPages = computed(() => Math.ceil(this.filteredPolicies().length / this.policyPageSize) || 1);

  // Plan filters & pagination
  searchQuery = signal('');
  premiumFilter = signal('ALL');
  durationFilter = signal('ALL');
  planPage = signal(1);
  planPageSize = 6;

  filteredPlans = computed(() => {
    return this.plans().filter(p => {
      const matchSearch = p.planName.toLowerCase().includes(this.searchQuery().toLowerCase());
      
      let matchPremium = true;
      if (this.premiumFilter() === 'LOW') matchPremium = p.premiumPerEmployee < 1000;
      if (this.premiumFilter() === 'MED') matchPremium = p.premiumPerEmployee >= 1000 && p.premiumPerEmployee <= 5000;
      if (this.premiumFilter() === 'HIGH') matchPremium = p.premiumPerEmployee > 5000;

      let matchDuration = true;
      if (this.durationFilter() === 'SHORT') matchDuration = p.durationMonths < 12;
      if (this.durationFilter() === 'MED') matchDuration = p.durationMonths >= 12 && p.durationMonths <= 24;
      if (this.durationFilter() === 'LONG') matchDuration = p.durationMonths > 24;

      return matchSearch && matchPremium && matchDuration;
    });
  });

  paginatedPlans = computed(() => {
    const start = (this.planPage() - 1) * this.planPageSize;
    return this.filteredPlans().slice(start, start + this.planPageSize);
  });

  planTotalPages = computed(() => Math.ceil(this.filteredPlans().length / this.planPageSize) || 1);

  loadingPolicies = signal(true);

  // Collapsible sections
  policiesExpanded = signal(true);
  plansExpanded = signal(true);

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
    this.corporateService.getMyProfile().subscribe(c => this.corporate.set(c));
    this.planService.getActivePlans().subscribe(p => this.plans.set(p));
    this.loadPolicies();
  }

  loadPolicies() {
    this.loadingPolicies.set(true);
    this.corporateService.getMyPolicies().subscribe({
      next: (data) => { this.policies.set(data); this.loadingPolicies.set(false); },
      error: () => { this.loadingPolicies.set(false); }
    });
  }

  openRequestDialog(plan: InsurancePlan) {
    if (!this.corporate()) return;
    const dialogRef = this.dialog.open(PolicyRequestDialogComponent, {
      data: {
        planId: plan.id,
        planName: plan.planName,
        corporateId: this.corporate()!.id,
        premiumPerEmployee: plan.premiumPerEmployee,
        coverageAmount: plan.coverageAmount
      },
      width: '700px',
      maxHeight: '85vh',
      panelClass: 'policy-request-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPolicies();
      }
    });
  }

  openResubmitDialog(policy: GroupPolicy) {
    if (!this.corporate()) return;
    
    // Extract employee IDs from existing policy
    const existingEmployeeIds = policy.employees ? policy.employees.map(e => e.id) : [];

    const dialogRef = this.dialog.open(PolicyRequestDialogComponent, {
      data: {
        policyId: policy.id,
        planId: policy.insurancePlan.id,
        planName: policy.insurancePlan.planName,
        corporateId: this.corporate()!.id,
        premiumPerEmployee: policy.insurancePlan.premiumPerEmployee,
        coverageAmount: policy.insurancePlan.coverageAmount,
        selectedEmployeeIds: existingEmployeeIds,
        underwriterComment: policy.underwriterComment
      },
      width: '700px',
      maxHeight: '85vh',
      panelClass: 'policy-request-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPolicies();
      }
    });
  }

  formatStatus(status: string): string {
    return status ? status.replace(/_/g, ' ') : 'Pending';
  }

  // Pagination helpers
  onPolicySearchChange(value: string) {
    this.policySearch.set(value);
    this.policyPage.set(1);
  }

  onPolicyStatusChange(value: string) {
    this.policyStatusFilter.set(value);
    this.policyPage.set(1);
  }

  onPlanFilterChange() {
    this.planPage.set(1);
  }

  getPolicyPageNumbers(): number[] {
    const total = this.policyTotalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  getPlanPageNumbers(): number[] {
    const total = this.planTotalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  }
}

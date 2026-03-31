import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PolicyService } from '../../../core/services/policy.service';
import { PlanService } from '../../../core/services/plan.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { GroupPolicy, Employee, InsurancePlan, UnderwriterDashboardDTO } from '../../../shared/models';
import { AdminService } from '../../../core/services/admin.service';
import { AiRiskAnalyzerComponent } from '../ai-risk-analyzer/ai-risk-analyzer.component';

declare const window: any;

@Component({
  selector: 'app-underwriter-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule, AiRiskAnalyzerComponent],
  templateUrl: './underwriter-dashboard.component.html',
  // eslint-disable-next-line @angular-eslint/component-selector
  styleUrl: './underwriter-dashboard.component.css'
})
export class UnderwriterDashboardComponent implements OnInit {
  policies = signal<GroupPolicy[]>([]);
  loading = signal(true);
  stats = signal<UnderwriterDashboardDTO | null>(null);
  
  // Track expanded policy and its employees
  expandedPolicyId = signal<number | null>(null);
  policyEmployees = signal<Employee[]>([]);
  loadingEmployees = signal<boolean>(false);

  // Modal states
  quoteModalOpen = signal(false);
  issueModalOpen = signal(false);
  selectedPolicyId = signal<number | null>(null);

  // AI Analysis states
  aiModalOpen = signal(false);
  aiAnalyzingPolicy = signal<GroupPolicy | null>(null);
  allPlans = signal<InsurancePlan[]>([]);

  // Form fields
  customPremium: number = 0;
  issueReason: string = '';

  columns = ['policyNumber', 'corporate', 'plan', 'employees', 'actions'];
  parseFloat = parseFloat; // expose to template

  constructor(
    private policyService: PolicyService, 
    private planService: PlanService,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    this.loadQueue();
    this.planService.getActivePlans().subscribe({
      next: (plans) => this.allPlans.set(plans),
      error: () => {}
    });
  }

  loadQueue() {
    this.loading.set(true);
    
    this.adminService.getUnderwriterDashboard().subscribe({
      next: (data) => this.stats.set(data),
      error: () => {}
    });

    this.policyService.getUnderwriterQueue().subscribe({
      next: (data) => {
        this.policies.set(data);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); }
    });
  }

  toggleEmployees(policyId: number) {
    if (this.expandedPolicyId() === policyId) {
      this.expandedPolicyId.set(null);
      return;
    }
    
    this.expandedPolicyId.set(policyId);
    this.loadingEmployees.set(true);
    
    this.employeeService.getEmployeesByPolicy(policyId).subscribe({
      next: (emps) => {
        this.policyEmployees.set(emps);
        this.loadingEmployees.set(false);
      },
      error: () => {
        this.snackBar.open('Failed to load employee details', 'OK', { duration: 3000 });
        this.loadingEmployees.set(false);
      }
    });
  }

  downloadHealthReport(employeeId: number) {
    this.employeeService.downloadHealthReport(employeeId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `HealthReport_${employeeId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.snackBar.open('Failed to download report or no report available', 'OK', { duration: 3000, panelClass: ['error-snackbar'] });
      }
    });
  }

  openQuoteModal(id: number) {
    this.selectedPolicyId.set(id);
    this.customPremium = 0;
    this.quoteModalOpen.set(true);
  }

  closeQuoteModal() {
    this.quoteModalOpen.set(false);
    this.selectedPolicyId.set(null);
  }

  submitQuote() {
    const id = this.selectedPolicyId();
    if (id && this.customPremium > 0) {
      this.policyService.sendQuote(id, this.customPremium).subscribe({
        next: () => {
          this.snackBar.open('Quote sent to HR successfully!', 'OK', { duration: 3000 });
          this.closeQuoteModal();
          this.loadQueue();
        },
        error: (err) => {
          console.error('Quote error:', err);
          let msg = 'Failed to send quote.';
          if (err.error && typeof err.error === 'string') {
            msg = err.error;
          } else if (err.error && err.error.message) {
            msg = err.error.message;
          }
          this.snackBar.open(msg, 'OK', { duration: 10000 });
        }
      });
    } else {
      this.snackBar.open('Please enter a valid premium.', 'OK', { duration: 3000 });
    }
  }

  openIssueModal(id: number) {
    this.selectedPolicyId.set(id);
    this.issueReason = '';
    this.issueModalOpen.set(true);
  }

  closeIssueModal() {
    this.issueModalOpen.set(false);
    this.selectedPolicyId.set(null);
  }

  submitIssue() {
    const id = this.selectedPolicyId();
    if (id && this.issueReason) {
      this.policyService.raiseIssue(id, this.issueReason).subscribe({
        next: () => {
          this.snackBar.open('Issue raised successfully.', 'OK', { duration: 3000 });
          this.closeIssueModal();
          this.loadQueue();
        },
        error: (err) => {
          let msg = 'Failed to raise issue.';
          if (err.error && typeof err.error === 'string') {
            msg = err.error;
          } else if (err.error && err.error.message) {
            msg = err.error.message;
          }
          this.snackBar.open(msg, 'OK', { duration: 5000 });
        }
      });
    } else {
      this.snackBar.open('Please state the reason for issues.', 'OK', { duration: 3000 });
    }
  }

  /* ── AI RISK ANALYSIS ── */

  openAiAnalysis(policy: GroupPolicy) {
    this.aiAnalyzingPolicy.set(policy);
    this.aiModalOpen.set(true);
  }

  closeAiModal() {
    this.aiModalOpen.set(false);
    this.aiAnalyzingPolicy.set(null);
  }

  onAiPremiumApplied(premium: number) {
    const policy = this.aiAnalyzingPolicy();
    if (policy) {
      this.customPremium = premium;
      this.closeAiModal();
      this.openQuoteModal(policy.id);
    }
  }
}

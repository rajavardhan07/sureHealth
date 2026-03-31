import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CorporateService } from '../../../core/services/corporate.service';
import { PaymentService } from '../../../core/services/payment.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { PlanService } from '../../../core/services/plan.service';
import { PolicyService } from '../../../core/services/policy.service';
import { CorporateClient, GroupPolicy, Employee, PremiumInvoice, PaymentMode, Claim } from '../../../shared/models';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BulkUploadDialogComponent } from '../bulk-upload-dialog/bulk-upload-dialog.component';
import { PolicyRequestDialogComponent } from '../policy-request-dialog/policy-request-dialog.component';
import { HrChatbotComponent } from '../hr-chatbot/hr-chatbot.component';
import { PolicyCertificateService } from '../../../core/services/policy-certificate.service';
import Swal from 'sweetalert2';

interface DashboardAction {
  label: string;
  desc: string;
  emoji: string;
  link?: string;
  action?: () => void;
  urgent?: boolean;
}

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, FormsModule, MatSnackBarModule, MatDialogModule],
  templateUrl: './hr-dashboard.component.html',
  styleUrl: './hr-dashboard.component.css'
})
export class HrDashboardComponent implements OnInit {
  corporate = signal<CorporateClient | null>(null);
  employees = signal<Employee[]>([]);
  policies = signal<GroupPolicy[]>([]);
  claims = signal<Claim[]>([]);
  loading = signal(true);

  // Payment Modal State
  paymentModalOpen = signal(false);
  selectedInvoice = signal<PremiumInvoice | null>(null);
  activatingPolicyId = signal<number | null>(null);
  paymentData = {
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    paymentMode: PaymentMode.CARD
  };

  constructor(
    private corporateService: CorporateService,
    private paymentService: PaymentService,
    private employeeService: EmployeeService,
    private planService: PlanService,
    private policyService: PolicyService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private certificateService: PolicyCertificateService
  ) {}

  ngOnInit() {
    this.corporateService.getMyProfile().subscribe(c => this.corporate.set(c));
    this.refreshDashboard();
  }

  refreshDashboard() {
    this.loading.set(true);
    let completed = 0;
    const checkDone = () => {
       completed++;
       if (completed === 3) this.loading.set(false);
    };

    this.corporateService.getMyEmployees().subscribe({
      next: (emps) => { this.employees.set(emps); checkDone(); },
      error: () => checkDone()
    });
    
    this.corporateService.getMyPolicies().subscribe({
      next: (pols) => { this.policies.set(pols); checkDone(); },
      error: () => checkDone()
    });

    this.corporateService.getMyCorporateClaims().subscribe({
      next: (cls) => { this.claims.set(cls); checkDone(); },
      error: () => checkDone()
    });
  }

  get activeEmployees(): number {
    return this.employees().filter(e => e.employmentStatus === 'ACTIVE').length;
  }

  get approvedPolicies(): number {
    return this.policies().filter(p => p.status === 'APPROVED').length;
  }

  get pendingPolicies(): number {
    return this.policies().filter(p => (p.status as string) === 'PENDING' || (p.status as string) === 'PENDING_UNDERWRITING').length;
  }

  get coveredEmployees(): number {
    return this.employees().filter(e => e.groupPolicy != null).length;
  }

  get uncoveredEmployees(): number {
    return this.employees().filter(e => e.groupPolicy == null).length;
  }

  get recentEmployees(): Employee[] {
    return [...this.employees()].slice(0, 5);
  }

  get recentClaims(): Claim[] {
    return [...this.claims()]
       .sort((a,b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime())
       .slice(0, 8);
  }

  getClaimStatusClass(status: string): string {
    switch(status) {
      case 'APPROVED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REJECTED': return 'bg-red-50 text-red-600 border-red-200';
      case 'UNDER_REVIEW': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'SUBMITTED': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'PENDING': return 'bg-slate-50 text-slate-600 border-slate-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  }

  formatClaimStatus(status: string): string {
    return status.replace(/_/g, ' ');
  }

  get recentPolicies(): GroupPolicy[] {
    return [...this.policies()].slice(0, 5);
  }

  get intelligentActions(): DashboardAction[] {
    const actions: DashboardAction[] = [];

    // 1. Pending Payments (Urgent)
    const pendingPolicies = this.policies().filter(p => p.status === 'PENDING_HR_APPROVAL');
    if (pendingPolicies.length > 0) {
      actions.push({
        label: 'Activate Policy',
        desc: `${pendingPolicies.length} invoice(s) due`,
        emoji: '⚠️',
        action: () => this.payToActivate(pendingPolicies[0].id),
        urgent: true
      });
    }

    // 2. Uncovered Employees
    const uncovered = this.uncoveredEmployees;
    if (uncovered > 0) {
      actions.push({
        label: 'Enroll Employees',
        desc: `${uncovered} need coverage`,
        emoji: '🛡️',
        action: () => this.openAddEmployeeModal(),
        urgent: true
      });
    } else {
      actions.push({
        label: 'Add Employee',
        desc: 'Register new hires',
        emoji: '👤',
        action: () => this.openAddEmployeeModal()
      });
    }

    // 3. Request New Policy
    actions.push({
      label: 'Explore Plans',
      desc: 'Browse corporate plans',
      emoji: '📋',
      action: () => this.openExplorePlansModal()
    });

    // 4. Billing / Invoices
    actions.push({
      label: 'Billing Center',
      desc: 'View payment history',
      emoji: '💳',
      action: () => this.openBillingCenterModal()
    });

    // Fallback if less than 4
    if (actions.length < 4) {
      actions.push({
        label: 'Bulk Onboarding',
        desc: 'Upload via Excel',
        emoji: '📊',
        action: () => this.openBulkOnboardingModal()
      });
    }

    return actions.slice(0, 4);
  }

  get ageMetrics() {
    const emps = this.employees();
    if (emps.length === 0) return { under30: 0, thirties: 0, forties: 0, over50: 0 };
    return {
      under30: Math.round((emps.filter(e => e.age && e.age < 30).length / emps.length) * 100),
      thirties: Math.round((emps.filter(e => e.age && e.age >= 30 && e.age < 40).length / emps.length) * 100),
      forties: Math.round((emps.filter(e => e.age && e.age >= 40 && e.age < 50).length / emps.length) * 100),
      over50: Math.round((emps.filter(e => e.age && e.age >= 50).length / emps.length) * 100),
    };
  }

  get departmentMetrics() {
    const emps = this.employees();
    if (emps.length === 0) return [];
    
    const countMap: any = {};
    emps.forEach(e => {
      const dept = (e as any).department || 'Unknown';
      countMap[dept] = (countMap[dept] || 0) + 1;
    });

    const metrics = Object.keys(countMap).map(k => ({
      name: k,
      count: countMap[k],
      percentage: Math.round((countMap[k] / emps.length) * 100)
    }));
    return metrics.sort((a, b) => b.count - a.count);
  }

  get agePieGradient(): string {
    const m = this.ageMetrics;
    const p1 = m.under30;
    const p2 = p1 + m.thirties + m.forties;
    return `conic-gradient(#2E5C9A 0% ${p1}%, #1B2A4A ${p1}% ${p2}%, #C8A951 ${p2}% 100%)`;
  }

  /* ── INLINE MODAL ACTION HANDLERS ── */

  openAddEmployeeModal() {
    if (!this.corporate()) return;
    
    Swal.fire({
      title: 'Add New Employee',
      html: `
        <div class="flex flex-col gap-3 text-left">
          <input id="swal-name" class="swal2-input !m-0 !text-sm" placeholder="Full Name">
          <input id="swal-email" type="email" class="swal2-input !m-0 !text-sm" placeholder="Email Address">
          <input id="swal-phone" class="swal2-input !m-0 !text-sm" placeholder="Phone Number">
          <div class="flex gap-3">
             <input id="swal-age" type="number" class="swal2-input !m-0 !text-sm w-1/2" placeholder="Age">
             <select id="swal-gender" class="swal2-select !m-0 !text-sm w-1/2">
               <option value="MALE">Male</option>
               <option value="FEMALE">Female</option>
             </select>
          </div>
          <input id="swal-dept" class="swal2-input !m-0 !text-sm" placeholder="Department">
          <input id="swal-desig" class="swal2-input !m-0 !text-sm" placeholder="Designation">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Register Employee',
      confirmButtonColor: '#2B74E2',
      preConfirm: () => {
        const name = (document.getElementById('swal-name') as HTMLInputElement).value;
        const email = (document.getElementById('swal-email') as HTMLInputElement).value;
        const phone = (document.getElementById('swal-phone') as HTMLInputElement).value;
        const age = (document.getElementById('swal-age') as HTMLInputElement).value;
        const gender = (document.getElementById('swal-gender') as HTMLSelectElement).value;
        const dept = (document.getElementById('swal-dept') as HTMLInputElement).value;
        const desig = (document.getElementById('swal-desig') as HTMLInputElement).value;
        
        if (!name || !email || !phone || !age || !dept || !desig) {
          Swal.showValidationMessage('Please fill all fields');
          return false;
        }
        return { name, email, phone, age, gender, dept, desig };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const v = result.value!;
        const formData = new FormData();
        formData.append('fullName', v.name);
        formData.append('email', v.email);
        formData.append('phone', v.phone);
        formData.append('age', v.age);
        formData.append('gender', v.gender);
        formData.append('department', v.dept);
        formData.append('designation', v.desig);
        formData.append('joinDate', new Date().toISOString().split('T')[0]);
        formData.append('corporateId', this.corporate()!.id.toString());
        
        this.employeeService.addEmployee(formData).subscribe({
          next: () => {
            Swal.fire({ title: 'Success', text: 'Employee registered successfully', icon: 'success', confirmButtonColor: '#2B74E2' });
            this.refreshDashboard();
          },
          error: () => Swal.fire('Error', 'Failed to register employee', 'error')
        });
      }
    });
  }

  openBulkOnboardingModal() {
    const corp = this.corporate();
    if (!corp) return;
    const dialogRef = this.dialog.open(BulkUploadDialogComponent, {
      data: { corporateId: corp.id },
      width: '660px',
      maxHeight: '85vh',
      panelClass: 'bulk-upload-panel'
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res) this.refreshDashboard();
    });
  }

  openExplorePlansModal() {
    this.planService.getActivePlans().subscribe({
      next: (plans) => {
        const hasOptions = plans.length > 0;
        const optionsHTMl = hasOptions ? plans.map(p => `
          <label class="cursor-pointer relative flex flex-col p-5 border-2 border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all duration-300 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50/40 w-full text-left bg-white group">
            <input type="radio" name="planSelect" value="${p.id}" class="peer sr-only">
            
            <!-- Custom Radio Button Circle -->
            <div class="absolute right-5 top-5 w-5 h-5 rounded-full border-[1.5px] border-slate-300 peer-checked:border-[6px] peer-checked:border-blue-600 transition-all duration-200 z-10"></div>
            
            <h4 class="font-bold text-lg text-slate-800 tracking-tight pr-8 mb-1">${p.planName}</h4>
            <div class="flex items-baseline gap-1 mb-4">
               <span class="text-3xl font-black text-blue-600">₹${p.premiumPerEmployee.toLocaleString('en-IN')}</span>
               <span class="text-xs font-semibold text-slate-500 uppercase tracking-widest">/YR/EMP</span>
            </div>

            <div class="h-px bg-slate-100 my-4 w-full"></div>
            
            <div class="space-y-3 mt-auto flex-1 flex flex-col justify-end">
              <div class="flex items-start gap-3">
                <span class="text-blue-500 bg-blue-50 rounded-full p-0.5 mt-0.5"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg></span>
                <span class="text-sm text-slate-600 leading-tight"><strong>₹${p.coverageAmount.toLocaleString('en-IN')}</strong> Coverage Limit</span>
              </div>
              <div class="flex items-start gap-3">
                <span class="text-blue-500 bg-blue-50 rounded-full p-0.5 mt-0.5"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg></span>
                <span class="text-sm text-slate-600 leading-tight"><strong>${p.waitingPeriodDays} Days</strong> Waiting Period</span>
              </div>
              <div class="flex items-start gap-3">
                <span class="text-blue-500 bg-blue-50 rounded-full p-0.5 mt-0.5"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg></span>
                <span class="text-sm text-slate-600 leading-tight"><strong>${p.durationMonths} Months</strong> Term Length</span>
              </div>
            </div>
            <!-- Optional subtle description -->
            <p class="text-xs text-slate-500 mt-5 italic line-clamp-2 leading-relaxed">${p.description || 'Comprehensive employee health coverage.'}</p>
          </label>
        `).join('') : '<p class="text-center text-slate-500 py-8 col-span-2 font-medium">No plans are currently available.</p>';
        
        Swal.fire({
          title: 'Select Corporate Plan',
          width: 800,
          html: `
            <p class="text-md text-slate-500 mb-6 px-4">Choose the right tier of coverage for your enterprise team.</p>
            <form id="plan-selection-form" class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto px-4 pb-4">
              ${optionsHTMl}
            </form>
          `,
          showCancelButton: true,
          confirmButtonText: 'Select Plan & Continue',
          confirmButtonColor: '#2B74E2',
          customClass: {
            htmlContainer: '!overflow-visible !p-0',
            confirmButton: 'shadow-lg shadow-blue-500/30'
          },
          preConfirm: () => {
            const form = document.getElementById('plan-selection-form') as HTMLFormElement;
            const selected = form.querySelector('input[name="planSelect"]:checked') as HTMLInputElement;
            if (!selected) {
              Swal.showValidationMessage('Please select a plan to continue');
              return false;
            }
            return selected.value;
          }
        }).then((result) => {
          if (result.isConfirmed) {
             const planId = Number(result.value);
             const selectedPlan = plans.find(p => p.id === planId);
             if (!this.corporate() || !selectedPlan) return;
             
             // Step 2: Open Employee Selection Dialog
             const dialogRef = this.dialog.open(PolicyRequestDialogComponent, {
                width: '750px',
                data: {
                  planId: selectedPlan.id,
                  planName: selectedPlan.planName,
                  corporateId: this.corporate()!.id,
                  premiumPerEmployee: selectedPlan.premiumPerEmployee,
                  coverageAmount: selectedPlan.coverageAmount
                }
             });
             
             dialogRef.afterClosed().subscribe((res) => {
                if (res) this.refreshDashboard();
             });
          }
        });
      },
      error: () => Swal.fire('Error', 'Failed to load plans.', 'error')
    });
  }

  openBillingCenterModal() {
    const pendingPolicies = this.policies().filter(p => p.status === 'PENDING_HR_APPROVAL');
    if (pendingPolicies.length > 0) {
       Swal.fire({
          title: 'Billing Center',
          text: `You have ${pendingPolicies.length} policy invoice(s) pending payment.`,
          icon: 'warning',
          confirmButtonText: 'Pay Now',
          confirmButtonColor: '#2B74E2',
          showCancelButton: true
       }).then(res => {
         if (res.isConfirmed) this.payToActivate(pendingPolicies[0].id);
       });
    } else {
       Swal.fire({
          title: 'Billing Center',
          text: 'All your accounts are in good standing! No pending invoices.',
          icon: 'success',
          confirmButtonColor: '#2B74E2'
       });
    }
  }

  openAIChatbot() {
    this.planService.getActivePlans().subscribe({
      next: (plans) => {
        this.dialog.open(HrChatbotComponent, {
          width: '500px',
          maxWidth: '95vw',
          panelClass: ['!p-0', 'bg-transparent', 'shadow-none'],
          backdropClass: 'backdrop-blur-sm',
          data: {
            employeeCount: this.employees().length,
            plans: plans
          }
        });
      },
      error: () => this.snackBar.open('Could not load plans for AI.', 'OK', {duration: 3000})
    });
  }

  /* ── UTILITIES ── */

  formatStatus(status: string): string {
    return status ? status.replace(/_/g, ' ') : 'Pending';
  }

  getInitials(name: string): string {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getPlanInitial(planName?: string): string {
    return planName ? planName.charAt(0).toUpperCase() : 'P';
  }

  payToActivate(policyId: number) {
    this.activatingPolicyId.set(policyId);
    this.paymentService.getInvoicesByPolicy(policyId).subscribe({
      next: (invoices) => {
        const unpaid = invoices.find(i => i.status === 'UNPAID' || i.status === 'OVERDUE');
        if (unpaid) {
          this.selectedInvoice.set(unpaid);
          this.paymentModalOpen.set(true);
        } else {
          this.snackBar.open('No pending invoices found for this policy.', 'OK', { duration: 3000 });
        }
      },
      error: () => this.snackBar.open('Failed to load invoice.', 'OK', { duration: 3000 })
    });
  }

  closePaymentModal() {
    this.paymentModalOpen.set(false);
    this.selectedInvoice.set(null);
  }

  submitPayment() {
    if (!this.paymentData.cardNumber || !this.paymentData.expiryDate || !this.paymentData.cvv) {
      this.snackBar.open('Please fill in all payment details.', 'OK', { duration: 3000 });
      return;
    }

    const invoice = this.selectedInvoice();
    if (invoice) {
      this.paymentService.payInvoice({
        invoiceId: invoice.id,
        amountPaid: invoice.totalAmount,
        paymentMode: this.paymentData.paymentMode
      }).subscribe({
        next: () => {
          this.snackBar.open('Payment successful! Policy is now ACTIVE.', 'OK', { duration: 5000 });
          // Generate certificate for the now-activated policy
          const policyId = this.activatingPolicyId();
          const activatedPolicy = this.policies().find(p => p.id === policyId);
          if (activatedPolicy) {
            this.certificateService.generateCertificate(activatedPolicy).catch(() =>
              console.warn('Certificate generation failed silently.')
            );
          }
          this.closePaymentModal();
          this.refreshDashboard();
        },
        error: () => this.snackBar.open('Payment failed. Please try again.', 'OK', { duration: 3000 })
      });
    }
  }

  downloadCertificate(policy: GroupPolicy) {
    this.certificateService.generateCertificate(policy).catch(() =>
      this.snackBar.open('Failed to generate certificate.', 'OK', { duration: 3000 })
    );
  }
}

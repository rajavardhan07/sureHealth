import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CorporateService } from '../../../core/services/corporate.service';
import { Claim } from '../../../shared/models';

@Component({
  selector: 'app-hr-claim-activity',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './claim-activity.component.html',
  styleUrl: './claim-activity.component.css'
})
export class HrClaimActivityComponent implements OnInit {
  claims = signal<Claim[]>([]);
  loading = signal(true);

  constructor(private corporateService: CorporateService) {}

  ngOnInit() {
    this.corporateService.getMyCorporateClaims().subscribe({
      next: (data) => { this.claims.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  get sortedClaims(): Claim[] {
    return [...this.claims()]
      .sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
  }

  get totalClaims(): number { return this.claims().length; }
  get approvedClaims(): number { return this.claims().filter(c => c.status === 'APPROVED').length; }
  get pendingClaims(): number { return this.claims().filter(c => c.status !== 'APPROVED' && c.status !== 'REJECTED').length; }
  get rejectedClaims(): number { return this.claims().filter(c => c.status === 'REJECTED').length; }
  get totalBilled(): number { return this.claims().reduce((sum, c) => sum + (c.billAmount || 0), 0); }
  get totalApproved(): number { return this.claims().filter(c => c.status === 'APPROVED').reduce((sum, c) => sum + (c.approvedAmount || 0), 0); }

  getClaimStatusClass(status: string): string {
    switch (status) {
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
}

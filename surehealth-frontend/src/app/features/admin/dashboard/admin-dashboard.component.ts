import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { AdminDashboardDTO } from '../../../shared/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  stats = signal<AdminDashboardDTO | null>(null);
  loading = signal(true);

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading.set(true);
    this.adminService.getAdminStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  getClaimsPieChartStyle(): string {
    const s = this.stats();
    if (!s || !s.totalClaims) return 'conic-gradient(#E2E6EC 0% 100%)';
    
    const approved = s.claimsByStatus['APPROVED'] || 0;
    const rejected = s.claimsByStatus['REJECTED'] || 0;
    const infoReq = s.claimsByStatus['INFO_REQUIRED'] || 0;
    const processing = (s.claimsByStatus['SUBMITTED'] || 0) + 
                       (s.claimsByStatus['PENDING_RECEIPT'] || 0) + 
                       (s.claimsByStatus['UNDER_REVIEW'] || 0);

    const aPct = (approved / s.totalClaims) * 100;
    const rPct = (rejected / s.totalClaims) * 100;
    const iPct = (infoReq / s.totalClaims) * 100;
    const pPct = (processing / s.totalClaims) * 100;

    const stop1 = aPct;
    const stop2 = stop1 + rPct;
    const stop3 = stop2 + iPct;
    const stop4 = stop3 + pPct;

    return `conic-gradient(
      #22c55e 0% ${stop1}%,
      #ef4444 ${stop1}% ${stop2}%,
      #eab308 ${stop2}% ${stop3}%,
      #3b82f6 ${stop3}% ${stop4}%
    )`;
  }

  getPolicyBarWidth(statusCategory: string): string {
    const s = this.stats();
    if (!s || !s.claimsByStatus) return '0%'; // Just defensive
    
    // We calculate total policies by summing Map values
    let totalPolicies = 0;
    for (const key in s.policiesByStatus) {
      totalPolicies += s.policiesByStatus[key];
    }
    if (totalPolicies === 0) return '0%';

    let count = 0;
    if (statusCategory === 'APPROVED') {
      count = s.policiesByStatus['APPROVED'] || 0;
    } else if (statusCategory === 'REJECTED') {
      count = s.policiesByStatus['REJECTED'] || 0;
    } else if (statusCategory === 'PENDING') {
      count = (s.policiesByStatus['PENDING_ADMIN_APPROVAL'] || 0) + 
              (s.policiesByStatus['PENDING_UNDERWRITER_REVIEW'] || 0) + 
              (s.policiesByStatus['PENDING_HR_APPROVAL'] || 0);
    } else if (statusCategory === 'INFO_REQUIRED') {
      count = s.policiesByStatus['INFO_REQUIRED'] || 0;
    }

    return `${(count / totalPolicies) * 100}%`;
  }
}

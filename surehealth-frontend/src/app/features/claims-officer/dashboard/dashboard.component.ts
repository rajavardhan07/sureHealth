import { Component, OnInit } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '../../../core/services/admin.service';
import { ClaimsOfficerDashboardDTO } from '../../../shared/models';

@Component({
  selector: 'app-co-dashboard',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.component.html'})
export class CODashboardComponent implements OnInit {
  data: ClaimsOfficerDashboardDTO | null = null;
  loading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getClaimsOfficerDashboard().subscribe({
      next: (d) => { this.data = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}

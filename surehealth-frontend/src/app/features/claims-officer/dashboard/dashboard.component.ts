import { Component, OnInit, signal } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '../../../core/services/admin.service';
import { ClaimsOfficerDashboardDTO } from '../../../shared/models';

@Component({
  selector: 'app-co-dashboard',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './dashboard.component.html'})
export class CODashboardComponent implements OnInit {
  data = signal<ClaimsOfficerDashboardDTO | null>(null);
  loading = signal(true);

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    console.log("Claims Officer Dashboard");
    this.adminService.getClaimsOfficerDashboard().subscribe({
      next: (d) => { this.data.set(d); 
        this.loading.set(false); 
        console.log(this.data());
      },
      error: () => { 
        this.loading.set(false); 
        console.log("Claims Officer Dashboard error");
      }
    });
  }
}

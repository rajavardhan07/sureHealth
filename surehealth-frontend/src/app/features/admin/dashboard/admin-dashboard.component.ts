import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AdminService } from '../../../core/services/admin.service';
import { AdminDashboardDTO } from '../../../shared/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule],
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
}

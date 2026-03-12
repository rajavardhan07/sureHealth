import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PolicyService } from '../../../core/services/policy.service';
import { GroupPolicy } from '../../../shared/models';

@Component({
  selector: 'app-underwriter-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule],
  templateUrl: './underwriter-dashboard.component.html',
  styleUrl: './underwriter-dashboard.component.css'
})
export class UnderwriterDashboardComponent implements OnInit {
  policies: GroupPolicy[] = [];
  loading = true;
  columns = ['policyNumber', 'corporate', 'plan', 'employees', 'actions'];

  constructor(private policyService: PolicyService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadQueue();
  }

  loadQueue() {
    this.loading = true;
    this.policyService.getUnderwriterQueue().subscribe({
      next: (data) => {
        this.policies = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  approve(id: number) {
    if (confirm('Verify risk and approve this policy? This will finalize employee coverage.')) {
      this.policyService.underwritePolicy(id).subscribe({
        next: () => {
          this.snackBar.open('Policy approved and employees assigned!', 'OK', { duration: 3000 });
          this.loadQueue();
        },
        error: () => {} // Error handled by interceptor
      });
    }
  }
}

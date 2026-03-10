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
  template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-800">Review Queue</h1>
        <p class="text-slate-500">Policies assigned to you for risk assessment and approval</p>
      </div>

      <mat-card class="overflow-hidden border-none shadow-sm rounded-xl">
        @if (loading) {
          <div class="flex justify-center p-12"><mat-spinner diameter="40"></mat-spinner></div>
        } @else if (policies.length > 0) {
          <table mat-table [dataSource]="policies" class="w-full">
            <ng-container matColumnDef="policyNumber">
              <th mat-header-cell *matHeaderCellDef>Policy Number</th>
              <td mat-cell *matCellDef="let p" class="font-medium text-blue-600">{{ p.policyNumber }}</td>
            </ng-container>
            
            <ng-container matColumnDef="corporate">
              <th mat-header-cell *matHeaderCellDef>Corporate Client</th>
              <td mat-cell *matCellDef="let p">{{ p.corporateClient?.companyName }}</td>
            </ng-container>

            <ng-container matColumnDef="plan">
              <th mat-header-cell *matHeaderCellDef>Insurance Plan</th>
              <td mat-cell *matCellDef="let p">{{ p.insurancePlan?.planName }}</td>
            </ng-container>

            <ng-container matColumnDef="employees">
              <th mat-header-cell *matHeaderCellDef>Enrolled Employees</th>
              <td mat-cell *matCellDef="let p">{{ p.employees?.length || 0 }} Employees</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let p">
                <button mat-flat-button color="primary" (click)="approve(p.id)">
                  <mat-icon>check_circle</mat-icon> Approve Policy
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>
          </table>
        } @else {
          <div class="text-center p-12 text-slate-400">
            <mat-icon style="font-size: 48px; width: 48px; height: 48px; opacity: 0.3">assignment_turned_in</mat-icon>
            <p class="mt-4">Your review queue is empty!</p>
          </div>
        }
      </mat-card>
    </div>
  `,
  styles: [`
    .p-6 { padding: 24px; }
    .mb-6 { margin-bottom: 24px; }
    .text-2xl { font-size: 24px; }
    .font-bold { font-weight: 700; }
    .text-slate-800 { color: #1e293b; }
    .text-slate-500 { color: #64748b; }
    .overflow-hidden { overflow: hidden; }
    .shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
    .rounded-xl { border-radius: 12px; }
    .w-full { width: 100%; }
    .flex { display: flex; }
    .justify-center { justify-content: center; }
    .p-12 { padding: 48px; }
    .mt-4 { margin-top: 16px; }
  `]
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
        error: () => { this.snackBar.open('Approval failed', 'OK', { duration: 3000 }); }
      });
    }
  }
}

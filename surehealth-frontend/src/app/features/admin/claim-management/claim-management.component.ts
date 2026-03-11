import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClaimService } from '../../../core/services/claim.service';
import { Claim } from '../../../shared/models';

@Component({
  selector: 'app-claim-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './claim-management.component.html',
  styleUrl: './claim-management.component.css'
})
export class ClaimManagementComponent implements OnInit {
  claims: Claim[] = [];
  loading = true;
  displayedColumns = ['claimNumber', 'employee', 'corporate', 'amount', 'type', 'status', 'date'];

  constructor(private claimService: ClaimService) {}

  ngOnInit(): void {
    this.loadAllClaims();
  }

  loadAllClaims(): void {
    this.loading = true;
    this.claimService.getAllClaims().subscribe({
      next: (data) => {
        this.claims = data;
        console.log(this.claims);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load claims', err);
        this.loading = false;
      }
    });
  }

  suspend(id: number): void {
    if (confirm('Are you sure you want to suspend this claim?')) {
      this.claimService.suspendClaim(id).subscribe({
        next: () => this.loadAllClaims(),
        error: (err) => console.error('Failed to suspend claim', err)
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'UNDER_REVIEW': return 'status-review';
      case 'APPROVED': return 'status-approved';
      case 'REJECTED': return 'status-rejected';
      case 'SUSPENDED': return 'status-suspended';
      default: return '';
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClaimService } from '../../../core/services/claim.service';
import { Claim } from '../../../shared/models';

@Component({
  selector: 'app-my-claims',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './my-claims.component.html',
  styleUrl: './my-claims.component.css'})
export class MyClaimsComponent implements OnInit {
  claims: Claim[] = [];
  loading = true;
  columns = ['claimNumber', 'hospital', 'diagnosis', 'amount', 'approved', 'assignedTo', 'status'];

  constructor(private claimService: ClaimService) {}

  ngOnInit() {
    this.claimService.getMyClaims().subscribe({
      next: (data) => { this.claims = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  getStatusClass(status: string): string {
    if (status === 'APPROVED') return 'approved';
    if (status === 'REJECTED') return 'rejected';
    if (status === 'UNDER_REVIEW') return 'under_review';
    return 'submitted';
  }
}

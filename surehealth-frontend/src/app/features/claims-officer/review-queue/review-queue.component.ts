import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ClaimService } from '../../../core/services/claim.service';
import { Claim } from '../../../shared/models';

@Component({
  selector: 'app-review-queue',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSnackBarModule, MatProgressSpinnerModule, MatCardModule],
  templateUrl: './review-queue.component.html',
  styleUrl: './review-queue.component.css'})
export class ReviewQueueComponent implements OnInit {
  claims: Claim[] = [];
  loading = true;
  approvedAmounts: { [key: number]: number } = {};
  rejectionReasons: { [key: number]: string } = {};

  constructor(private claimService: ClaimService, private snackBar: MatSnackBar) {}

  ngOnInit() { this.loadClaims(); }

  loadClaims() {
    this.loading = true;
    this.claimService.getReviewQueue().subscribe({
      next: (data) => { this.claims = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  startReview(claim: Claim) {
    this.claimService.startReview(claim.id).subscribe({
      next: () => { claim.status = 'UNDER_REVIEW' as any; this.snackBar.open('Claim under review', 'OK', { duration: 2000 }); },
      error: () => { this.snackBar.open('Failed to start review', 'OK', { duration: 3000 }); }
    });
  }

  approve(claim: Claim) {
    const amount = this.approvedAmounts[claim.id];
    if (!amount) return;
    this.claimService.approveClaim(claim.id, { approvedAmount: amount }).subscribe({
      next: () => { this.snackBar.open('Claim approved', 'OK', { duration: 3000 }); this.loadClaims(); },
      error: () => { this.snackBar.open('Failed to approve', 'OK', { duration: 3000 }); }
    });
  }

  reject(claim: Claim) {
    const reason = this.rejectionReasons[claim.id];
    if (!reason) return;
    this.claimService.rejectClaim(claim.id, { rejectionReason: reason }).subscribe({
      next: () => { this.snackBar.open('Claim rejected', 'OK', { duration: 3000 }); this.loadClaims(); },
      error: () => { this.snackBar.open('Failed to reject', 'OK', { duration: 3000 }); }
    });
  }
}

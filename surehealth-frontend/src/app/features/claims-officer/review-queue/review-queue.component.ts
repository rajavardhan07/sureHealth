import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClaimService } from '../../../core/services/claim.service';
import { Claim } from '../../../shared/models';

@Component({
  selector: 'app-review-queue',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './review-queue.component.html',
  styleUrl: './review-queue.component.css'})
export class ReviewQueueComponent implements OnInit {
  claims = signal<Claim[]>([]);
  loading = signal(true);
  approvedAmounts: { [key: number]: number } = {};
  rejectionReasons: { [key: number]: string } = {};

  constructor(private claimService: ClaimService, private snackBar: MatSnackBar) {}

  ngOnInit() { this.loadClaims(); }

  loadClaims() {
    this.loading.set(true);
    this.claimService.getReviewQueue().subscribe({
      next: (data) => { this.claims.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  startReview(claim: Claim) {
    this.claimService.startReview(claim.id).subscribe({
      next: () => { claim.status = 'UNDER_REVIEW' as any; this.snackBar.open('Claim under review', 'OK', { duration: 2000 }); },
      error: () => {} // Error handled by interceptor
    });
  }

  approve(claim: Claim) {
    const amount = this.approvedAmounts[claim.id];
    if (!amount) return;
    this.claimService.approveClaim(claim.id, { approvedAmount: amount }).subscribe({
      next: () => { this.snackBar.open('Claim approved', 'OK', { duration: 3000 }); this.loadClaims(); },
      error: () => {} // Error handled by interceptor
    });
  }

  reject(claim: Claim) {
    const reason = this.rejectionReasons[claim.id];
    if (!reason) return;
    this.claimService.rejectClaim(claim.id, { rejectionReason: reason }).subscribe({
      next: () => { this.snackBar.open('Claim rejected', 'OK', { duration: 3000 }); this.loadClaims(); },
      error: () => {} // Error handled by interceptor
    });
  }
}

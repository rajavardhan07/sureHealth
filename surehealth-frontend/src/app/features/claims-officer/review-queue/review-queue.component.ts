import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClaimService } from '../../../core/services/claim.service';
import { EmployeeService } from '../../../core/services/employee.service';
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
  issueReasons: { [key: number]: string } = {};
  
  loadingOcr: { [key: number]: boolean } = {};
  ocrResults: { [key: number]: any } = {};

  constructor(
    private claimService: ClaimService, 
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() { this.loadClaims(); }

  getMaxClaimableAmount(claim: Claim): number {
    const emp = claim.employee;
    if (!emp || !emp.joinDate || !emp.coverageAmount) return 0;
    
    let jp: any = emp.joinDate;
    let joinDate: Date;
    if (Array.isArray(jp)) {
        joinDate = new Date(jp[0], jp[1]-1, jp[2]);
    } else {
        joinDate = new Date(jp);
    }
    const now = new Date();
    
    let months = (now.getFullYear() - joinDate.getFullYear()) * 12 + now.getMonth() - joinDate.getMonth();
    if (now.getDate() < joinDate.getDate()) {
      months--;
    }
    if (months < 0) months = 0;
    
    let baseMax = 0;
    if (months < 3) baseMax = emp.coverageAmount * 0.125;
    else if (months < 6) baseMax = emp.coverageAmount * 0.25;
    else if (months < 12) baseMax = emp.coverageAmount * 0.5;
    else baseMax = emp.coverageAmount;
    
    const remaining = emp.remainingCoverage || 0;
    const bill = claim.billAmount || 0;
    
    return Math.min(baseMax, remaining, bill);
  }

  downloadClaimReport(claimId: number) {
    this.claimService.downloadClaimReport(claimId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ClaimReport_${claimId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('Failed to download report', 'OK', { duration: 3000, panelClass: ['error-snackbar'] })
    });
  }

  downloadHealthReport(employeeId: number) {
    this.employeeService.downloadHealthReport(employeeId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `HealthReport_${employeeId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('Failed to download health report', 'OK', { duration: 3000, panelClass: ['error-snackbar'] })
    });
  }

  loadClaims() {
    this.loading.set(true);
    this.claimService.getReviewQueue().subscribe({
      next: (data) => { this.claims.set(data); 
        console.log(this.claims());
        this.loading.set(false); 
      },
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
    
    const maxAmount = this.getMaxClaimableAmount(claim);
    if (amount > maxAmount) {
      this.snackBar.open(`Approved amount cannot exceed the Max Claimable Amount of ₹${maxAmount}`, 'OK', { duration: 4500, panelClass: ['error-snackbar'] });
      return;
    }

    this.claimService.approveClaim(claim.id, { approvedAmount: amount }).subscribe({
      next: () => { this.snackBar.open('Claim approved', 'OK', { duration: 3000, panelClass: ['success-snackbar'] }); this.loadClaims(); },
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

  raiseIssue(claim: Claim) {
    const reason = this.issueReasons[claim.id];
    if (!reason) {
      this.snackBar.open('Please provide an issue reason.', 'OK', { duration: 3000 });
      return;
    }
    this.claimService.requestMoreInfo(claim.id, { rejectionReason: reason }).subscribe({
      next: () => { 
        this.snackBar.open('Issue raised successfully', 'OK', { duration: 3000, panelClass: ['success-snackbar'] }); 
        this.loadClaims(); 
      },
      error: () => this.snackBar.open('Failed to raise issue', 'OK', { duration: 3000, panelClass: ['error-snackbar'] })
    });
  }

  verifyClaimWithAI(claim: Claim) {
    this.loadingOcr[claim.id] = true;
    this.claimService.verifyOcr(claim.id).subscribe({
      next: (data) => {
        this.ocrResults[claim.id] = data;
        this.loadingOcr[claim.id] = false;
        this.snackBar.open('AI verification complete!', 'OK', { duration: 3000, panelClass: ['success-snackbar'] });
      },
      error: (err) => {
        this.loadingOcr[claim.id] = false;
        let msg = 'Failed to analyze document with AI.';
        if (err.error?.message) {
          msg = err.error.message;
        } else if (err.status === 429) {
          msg = 'AI quota exceeded. Please wait a minute and try again.';
        }
        this.snackBar.open(msg, 'OK', { duration: 6000, panelClass: ['error-snackbar'] });
      }
    });
  }
}

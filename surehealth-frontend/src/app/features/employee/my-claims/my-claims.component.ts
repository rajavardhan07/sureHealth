import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClaimService } from '../../../core/services/claim.service';
import { Claim } from '../../../shared/models';

@Component({
  selector: 'app-my-claims',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './my-claims.component.html',
  styleUrl: './my-claims.component.css'})
export class MyClaimsComponent implements OnInit {
  claims = signal<Claim[]>([]);
  loading = signal(true);
  columns = ['claimNumber', 'hospital', 'diagnosis', 'amount', 'approved', 'assignedTo', 'status'];

  expandedClaimId: number | null = null;
  responseData: { [key: number]: any } = {};
  responseFiles: { [key: number]: File | null } = {};
  submitting: { [key: number]: boolean } = {};

  constructor(private claimService: ClaimService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadClaims();
  }

  loadClaims() {
    this.loading.set(true);
    this.claimService.getMyClaims().subscribe({
      next: (data) => { this.claims.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  toggleResponseForm(claim: Claim) {
    if (this.expandedClaimId === claim.id) {
      this.expandedClaimId = null;
    } else {
      this.expandedClaimId = claim.id;
      // Pre-fill with existing claim data
      this.responseData[claim.id] = {
        hospitalName: claim.hospitalName,
        diagnosis: claim.diagnosis,
        billAmount: claim.billAmount,
        treatmentDate: claim.treatmentDate,
        billNumber: claim.billNumber
      };
      this.responseFiles[claim.id] = null;
    }
  }

  onFileSelected(event: Event, claimId: number) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.responseFiles[claimId] = input.files[0];
    }
  }

  respondToIssue(claim: Claim) {
    const data = this.responseData[claim.id];
    if (!data) return;

    this.submitting[claim.id] = true;

    const formData = new FormData();
    formData.append('hospitalName', data.hospitalName || '');
    formData.append('diagnosis', data.diagnosis || '');
    formData.append('billAmount', data.billAmount?.toString() || '');
    formData.append('treatmentDate', data.treatmentDate || '');
    formData.append('billNumber', data.billNumber || '');
    formData.append('employeeId', claim.employee.id.toString());
    formData.append('policyId', claim.groupPolicy.id.toString());

    const file = this.responseFiles[claim.id];
    if (file) {
      formData.append('file', file);
    }

    this.claimService.respondToIssue(claim.id, formData).subscribe({
      next: () => {
        this.submitting[claim.id] = false;
        this.expandedClaimId = null;
        this.snackBar.open('Claim resubmitted successfully!', 'OK', { duration: 3000, panelClass: ['success-snackbar'] });
        this.loadClaims();
      },
      error: () => {
        this.submitting[claim.id] = false;
        this.snackBar.open('Failed to resubmit claim.', 'OK', { duration: 3000, panelClass: ['error-snackbar'] });
      }
    });
  }

  getStatusClass(status: string): string {
    if (status === 'APPROVED') return 'approved';
    if (status === 'REJECTED') return 'rejected';
    if (status === 'UNDER_REVIEW') return 'under_review';
    return 'submitted';
  }
}

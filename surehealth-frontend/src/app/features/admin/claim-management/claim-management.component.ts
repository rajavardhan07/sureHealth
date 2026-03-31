import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ClaimService } from '../../../core/services/claim.service';
import { AdminService } from '../../../core/services/admin.service';
import { Claim, User } from '../../../shared/models';

@Component({
  selector: 'app-claim-management',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './claim-management.component.html',
  styleUrl: './claim-management.component.css'
})
export class ClaimManagementComponent implements OnInit {
  claims = signal<Claim[]>([]);
  officers = signal<User[]>([]);
  loading = signal(true);
  displayedColumns = ['claimNumber', 'employee', 'corporate', 'amount', 'type', 'status', 'date'];

  constructor(private claimService: ClaimService, private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadAllClaims();
    console.log("Claim Management Component");
    this.adminService.getClaimsOfficers().subscribe(data => this.officers.set(data));
  }

  assignOfficer(claimId: number, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const officerId = target.value;
    if (!officerId) return;
    
    this.adminService.assignClaim(claimId, +officerId).subscribe({
      next: () => {
         this.loadAllClaims();
         target.value = '';
      },
      error: (err) => console.error('Failed to assign officer', err)
    });
  }

  loadAllClaims(): void {
    this.loading.set(true);
    this.claimService.getAllClaims().subscribe({
      next: (data) => {
        this.claims.set(data);
        console.log(this.claims());
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load claims', err);
        this.loading.set(false);
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

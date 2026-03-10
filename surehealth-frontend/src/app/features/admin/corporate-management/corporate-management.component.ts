import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { AdminService } from '../../../core/services/admin.service';
import { CorporateClient } from '../../../shared/models';

@Component({
  selector: 'app-corporate-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './corporate-management.component.html',
  styleUrls: ['./corporate-management.component.css']
})
export class CorporateManagementComponent implements OnInit {
  corporates: CorporateClient[] = [];
  loading = true;
  columns = ['companyName', 'registrationNumber', 'industryType', 'employees', 'status', 'actions'];

  constructor(private adminService: AdminService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadCorporates();
  }

  loadCorporates() {
    this.loading = true;
    this.adminService.getAllCorporateClients().subscribe({
      next: (data) => {
        this.corporates = data;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load corporate clients', 'OK', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  suspend(id: number, companyName: string) {
    if (confirm(`Are you sure you want to suspend ${companyName}?`)) {
      this.adminService.suspendCorporateClient(id).subscribe({
        next: () => {
          this.snackBar.open(`${companyName} has been suspended`, 'OK', { duration: 3000 });
          this.loadCorporates();
        },
        error: () => {
          this.snackBar.open(`Failed to suspend ${companyName}`, 'OK', { duration: 3000 });
        }
      });
    }
  }
}

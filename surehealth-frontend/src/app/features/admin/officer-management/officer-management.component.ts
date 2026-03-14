import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '../../../core/services/admin.service';
import { UserFormDialogComponent } from '../user-form-dialog/user-form-dialog.component';
import { User, Role } from '../../../shared/models';

@Component({
  selector: 'app-officer-management',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './officer-management.component.html',
  styleUrl: './officer-management.component.css'
})
export class OfficerManagementComponent implements OnInit {
  officers = signal<User[]>([]);
  displayedColumns: string[] = ['fullName', 'username', 'phoneNumber', 'licenseNumber', 'commission', 'createdAt'];
  loading = signal(true);

  constructor(
    private adminService: AdminService, 
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadOfficers();
  }

  loadOfficers() {
    this.loading.set(true);
    this.adminService.getClaimsOfficers().subscribe({
      next: (data) => {
        this.officers.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Failed to load officers', 'OK', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      data: { type: 'officer' },
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.createClaimsOfficer(result).subscribe({
          next: () => {
            this.snackBar.open('Claims officer created successfully', 'OK', { duration: 3000 });
            this.loadOfficers();
          },
          error: () => {} // Error handled by interceptor
        });
      }
    });
  }
}

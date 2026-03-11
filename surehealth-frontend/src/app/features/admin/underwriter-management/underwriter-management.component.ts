import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '../../../core/services/admin.service';
import { UserFormDialogComponent } from '../user-form-dialog/user-form-dialog.component';
import { User } from '../../../shared/models';

@Component({
  selector: 'app-underwriter-management',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatSnackBarModule, 
    MatTableModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './underwriter-management.component.html',
  styleUrl: './underwriter-management.component.css'
})
export class UnderwriterManagementComponent implements OnInit {
  underwriters: User[] = [];
  displayedColumns: string[] = ['fullName', 'username', 'phoneNumber', 'licenseNumber', 'commission', 'createdAt'];
  loading = true;

  constructor(
    private adminService: AdminService, 
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadUnderwriters();
  }

  loadUnderwriters() {
    this.loading = true;
    this.adminService.getUnderwriters().subscribe({
      next: (data) => {
        this.underwriters = data;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load underwriters', 'OK', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      data: { type: 'underwriter' },
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.createUnderwriter(result).subscribe({
          next: () => {
            this.snackBar.open('Underwriter created successfully', 'OK', { duration: 3000 });
            this.loadUnderwriters();
          },
          error: () => this.snackBar.open('Failed to create underwriter', 'OK', { duration: 3000 })
        });
      }
    });
  }
}

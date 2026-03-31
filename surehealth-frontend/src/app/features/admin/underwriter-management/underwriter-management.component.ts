import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '../../../core/services/admin.service';
import Swal from 'sweetalert2';
import { UserFormDialogComponent } from '../user-form-dialog/user-form-dialog.component';
import { User } from '../../../shared/models';

@Component({
  selector: 'app-underwriter-management',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatMenuModule,
    MatButtonModule
  ],
  templateUrl: './underwriter-management.component.html',
  styleUrl: './underwriter-management.component.css'
})
export class UnderwriterManagementComponent implements OnInit {
  underwriters = signal<User[]>([]);
  displayedColumns: string[] = ['fullName', 'username', 'department', 'phoneNumber', 'licenseNumber', 'commission', 'status', 'createdAt', 'actions'];
  loading = signal(true);

  constructor(
    private adminService: AdminService, 
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadUnderwriters();
  }

  loadUnderwriters() {
    this.loading.set(true);
    this.adminService.getUnderwriters().subscribe({
      next: (data) => {
        this.underwriters.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Failed to load underwriters', 'OK', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  editUnderwriter(user: User) {
    Swal.fire({
      title: 'Edit Underwriter Details',
      html: `
        <div class="mb-5 text-left">
          <label class="block text-xs font-bold text-[#1B2A4A] uppercase tracking-wider mb-2">Full Name</label>
          <input id="swal-input1" class="w-full px-4 py-3 bg-[#F8F6F1] border border-[#E2E6EC] rounded-lg text-sm text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#2E5C9A]/50 focus:border-[#2E5C9A] transition-all shadow-sm" placeholder="e.g. Jane Doe" value="${user.fullName || ''}">
        </div>
        <div class="mb-5 text-left">
          <label class="block text-xs font-bold text-[#1B2A4A] uppercase tracking-wider mb-2">Phone Number</label>
          <input id="swal-input2" class="w-full px-4 py-3 bg-[#F8F6F1] border border-[#E2E6EC] rounded-lg text-sm text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#2E5C9A]/50 focus:border-[#2E5C9A] transition-all shadow-sm" placeholder="e.g. 123-456-7890" value="${user.phoneNumber || ''}">
        </div>
        <div class="mb-5 text-left">
          <label class="block text-xs font-bold text-[#1B2A4A] uppercase tracking-wider mb-2">Department</label>
          <input id="swal-input3" class="w-full px-4 py-3 bg-[#F8F6F1] border border-[#E2E6EC] rounded-lg text-sm text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#2E5C9A]/50 focus:border-[#2E5C9A] transition-all shadow-sm" placeholder="e.g. Risk Analysis" value="${user.department || ''}">
        </div>
        <div class="flex gap-4 mb-5">
          <div class="flex-1 text-left">
            <label class="block text-xs font-bold text-[#1B2A4A] uppercase tracking-wider mb-2">License Number</label>
            <input id="swal-input5" class="w-full px-4 py-3 bg-[#F8F6F1] border border-[#E2E6EC] rounded-lg text-sm text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#2E5C9A]/50 focus:border-[#2E5C9A] transition-all shadow-sm" placeholder="e.g. LIC-123" value="${user.licenseNumber || ''}">
          </div>
          <div class="flex-1 text-left">
            <label class="block text-xs font-bold text-[#1B2A4A] uppercase tracking-wider mb-2">Commission %</label>
            <input id="swal-input6" type="number" step="0.1" class="w-full px-4 py-3 bg-[#F8F6F1] border border-[#E2E6EC] rounded-lg text-sm text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#2E5C9A]/50 focus:border-[#2E5C9A] transition-all shadow-sm" placeholder="e.g. 5.0" value="${user.commissionPercentage || 0}">
          </div>
        </div>
        <div class="h-px bg-[#E2E6EC] w-full my-6"></div>
        <div class="mb-2 text-left">
          <label class="block text-xs font-bold text-[#1B2A4A] uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Reset Password</span>
            <span class="text-[10px] bg-[#E8EFF8] text-[#2E5C9A] px-2 py-0.5 rounded-full">Optional</span>
          </label>
          <input id="swal-input4" type="password" class="w-full px-4 py-3 bg-[#F8F6F1] border border-[#E2E6EC] rounded-lg text-sm text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#2E5C9A]/50 focus:border-[#2E5C9A] transition-all shadow-sm" placeholder="Enter new password (min 4 chars)">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Save Changes',
      cancelButtonText: 'Cancel',
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-2xl shadow-2xl border border-[#E2E6EC] !p-6 max-w-lg',
        title: 'text-2xl font-bold text-[#1B2A4A] text-left !mb-6 !p-0',
        actions: 'mt-8 w-full flex gap-3 !p-0',
        confirmButton: 'flex-1 items-center justify-center px-4 py-2.5 bg-[#2E5C9A] hover:bg-[#1B2A4A] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors',
        cancelButton: 'flex-1 items-center justify-center px-4 py-2.5 bg-white border border-[#E2E6EC] hover:bg-gray-50 text-[#5A6A7E] text-sm font-semibold rounded-lg shadow-sm transition-colors'
      },
      preConfirm: () => {
        const fullName = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const phoneNumber = (document.getElementById('swal-input2') as HTMLInputElement).value;
        const department = (document.getElementById('swal-input3') as HTMLInputElement).value;
        const licenseNumber = (document.getElementById('swal-input5') as HTMLInputElement).value;
        const commissionPercentage = parseFloat((document.getElementById('swal-input6') as HTMLInputElement).value) || 0;
        const newPassword = (document.getElementById('swal-input4') as HTMLInputElement).value;
        if (!fullName) {
          Swal.showValidationMessage('Full Name is required');
        } else if (newPassword && newPassword.length > 0 && newPassword.length < 4) {
          Swal.showValidationMessage('Password must be at least 4 characters if provided');
        }
        return { fullName, phoneNumber, department, licenseNumber, commissionPercentage, newPassword };
      }
    }).then((result: any) => {
      if (result.isConfirmed) {
        const { newPassword, ...updateData } = result.value;
        this.adminService.updateOfficer(user.id, updateData).subscribe({
          next: () => {
             if (newPassword) {
              this.adminService.changePassword(user.id, newPassword).subscribe({
                next: () => {
                  this.snackBar.open('Profile and password updated successfully', 'OK', { duration: 3000 });
                  this.loadUnderwriters();
                },
                error: () => this.snackBar.open('Profile updated, but failed to update password', 'OK', { duration: 3000 })
              });
            } else {
              this.snackBar.open('Underwriter updated successfully', 'OK', { duration: 3000 });
              this.loadUnderwriters();
            }
          },
          error: () => this.snackBar.open('Failed to update underwriter', 'OK', { duration: 3000 })
        });
      }
    });
  }

  toggleStatus(user: User, action: 'ACTIVE' | 'SUSPEND', state: boolean) {
    const actionText = action === 'ACTIVE' ? (state ? 'Activate' : 'Deactivate') : (state ? 'Suspend' : 'Unsuspend');
    Swal.fire({
      title: `Are you sure?`,
      text: `Do you want to ${actionText.toLowerCase()} access for ${user.fullName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: (action === 'SUSPEND' && state) || (action === 'ACTIVE' && !state) ? '#e63946' : '#2E5C9A',
      confirmButtonText: `Yes, ${actionText}`
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.adminService.toggleOfficerStatus(user.id, action, state).subscribe({
          next: () => {
            this.snackBar.open(`Underwriter ${actionText.toLowerCase()}d successfully`, 'OK', { duration: 3000 });
            this.loadUnderwriters();
          },
          error: () => this.snackBar.open(`Failed to update status`, 'OK', { duration: 3000 })
        });
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
          error: () => {} // Error handled by interceptor
        });
      }
    });
  }
}

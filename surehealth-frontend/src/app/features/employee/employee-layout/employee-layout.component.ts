import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationDropdownComponent } from '../../../shared/components/notification-dropdown/notification-dropdown.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employee-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatMenuModule,
    NotificationDropdownComponent
  ],
  templateUrl: './employee-layout.component.html',
  styleUrl: './employee-layout.component.css'
})
export class EmployeeLayoutComponent {
  authService = inject(AuthService);
  sidebarOpen = false;
  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar()  { this.sidebarOpen = false; }

  getInitial(): string {
    return (this.authService.getUsername() || 'E').charAt(0).toUpperCase();
  }

  confirmLogout(): void {
    Swal.fire({
      title: 'Sign Out',
      text: 'Are you sure you want to sign out?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#5A6A7E',
      confirmButtonText: 'Yes, sign out',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'rounded-xl',
        confirmButton: 'rounded-lg text-sm font-semibold px-5 py-2.5',
        cancelButton: 'rounded-lg text-sm font-semibold px-5 py-2.5'
      }
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.authService.logout();
      }
    });
  }

  openChangePassword() {
    Swal.fire({
      title: 'Change Password',
      html: `
        <div class="flex flex-col gap-3 text-left">
           <label class="text-sm font-semibold text-slate-700">Current Password</label>
           <input type="password" id="swal-old-pwd" class="swal2-input !m-0 !w-full" placeholder="Enter current password">
           <label class="text-sm font-semibold text-slate-700 mt-2">New Password</label>
           <input type="password" id="swal-new-pwd" class="swal2-input !m-0 !w-full" placeholder="Enter new password">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Update Security',
      confirmButtonColor: '#2B74E2',
      preConfirm: () => {
        const oldP = (document.getElementById('swal-old-pwd') as HTMLInputElement).value;
        const newP = (document.getElementById('swal-new-pwd') as HTMLInputElement).value;
        if (!oldP || !newP) {
          Swal.showValidationMessage('Please fill both fields');
          return false;
        }
        return { oldPassword: oldP, newPassword: newP };
      }
    }).then(res => {
      if (res.isConfirmed) {
        this.authService.changePassword(res.value).subscribe({
          next: () => Swal.fire({ title: 'Success', text: 'Password secured and updated!', icon: 'success', confirmButtonColor: '#2B74E2' }),
          error: (err) => Swal.fire('Error', err.error?.message || 'Failed to update.', 'error')
        });
      }
    });
  }
}

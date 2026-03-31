import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatSnackBarModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  step = signal(1);
  loading = signal(false);
  
  username = '';
  token = '';
  newPassword = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onRequestReset() {
    if (!this.username) return;
    this.loading.set(true);
    this.authService.forgotPassword(this.username).subscribe({
      next: (response) => {
        this.step.set(2);
        this.loading.set(false);
        this.snackBar.open('Reset code sent! See alert for your code.', 'OK', { duration: 5000 });
        alert(`[SIMULATED EMAIL]\n\nYour reset code is: ${response.token}\n\nPlease copy this code and enter it in the next step.`);
      },
      error: (err) => {
        this.loading.set(false);
        this.snackBar.open(err.error?.message || 'Failed to request reset.', 'Close', { duration: 3000 });
      }
    });
  }

  onResetPassword() {
    if (!this.token || !this.newPassword) return;
    this.loading.set(true);
    this.authService.resetPassword({
      username: this.username,
      token: this.token,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.snackBar.open('Password reset successful! Please login with your new password.', 'OK', { duration: 5000 });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading.set(false);
        this.snackBar.open(err.error?.message || 'Failed to reset password.', 'Close', { duration: 3000 });
      }
    });
  }
}

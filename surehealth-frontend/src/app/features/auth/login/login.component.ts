import { Component, OnInit } from '@angular/core';

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { PolicyService } from '../../../core/services/policy.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;
  loading = false;
  errorMessage = '';
  publicPlans: any[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private policyService: PolicyService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.authService.getRoleRoute()]);
    }
  }

  ngOnInit(): void {
    this.policyService.getPublicPlans().subscribe({
      next: (plans) =>{
        this.publicPlans = plans,
        console.log(this.publicPlans);
      },
      error: (err) => console.error('Failed to load public plans', err)
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate([this.authService.getRoleRoute()]);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Invalid username or password';
      }
    });
  }
}

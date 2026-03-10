import { Component, ViewChild } from '@angular/core';

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormGroupDirective } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CorporateService } from '../../../core/services/corporate.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'})
export class RegisterComponent {
  @ViewChild(FormGroupDirective) formDirective!: FormGroupDirective;

  form: FormGroup;
  hidePassword = true;
  loading = false;
  success = false;

  constructor(
    private fb: FormBuilder,
    private corporateService: CorporateService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.form = this.fb.group({
      companyName: ['', Validators.required],
      registrationNumber: ['', Validators.required],
      contactPerson: ['', Validators.required],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: ['', Validators.required],
      numberOfEmployees: ['', Validators.required],
      industryType: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  register() {
    if (this.form.invalid) return;
    this.loading = true;

    this.corporateService.register(this.form.value).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        this.snackBar.open('Registration successful', 'OK', { duration: 3000 });
        if (this.formDirective) {
          this.formDirective.resetForm();
        } else {
          this.form.reset();
        }
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Registration failed. Please try again.', 'OK', { duration: 4000 });
      }
    });
  }
}

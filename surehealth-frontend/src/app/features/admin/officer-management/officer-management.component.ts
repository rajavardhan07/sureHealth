import { Component, ViewChild } from '@angular/core';

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormGroupDirective } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-officer-management',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './officer-management.component.html',
  styleUrl: './officer-management.component.css'})
export class OfficerManagementComponent {
  @ViewChild(FormGroupDirective) formDirective!: FormGroupDirective;

  form: FormGroup;
  createdUser: any = null;

  constructor(private adminService: AdminService, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  create() {
    if (this.form.invalid) return;
    this.adminService.createClaimsOfficer(this.form.value).subscribe({
      next: (user) => {
        this.createdUser = user;
        this.snackBar.open('Claims officer created', 'OK', { duration: 3000 });
        if (this.formDirective) {
          this.formDirective.resetForm();
        } else {
          this.form.reset();
        }
      },
      error: () => { this.snackBar.open('Failed to create officer', 'OK', { duration: 3000 }); }
    });
  }
}

import { Component, OnInit } from '@angular/core';

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ClaimService } from '../../../core/services/claim.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../shared/models';

@Component({
  selector: 'app-file-claim',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './file-claim.component.html',
  styleUrl: './file-claim.component.css'})
export class FileClaimComponent implements OnInit {
  form: FormGroup;
  profile: Employee | null = null;

  constructor(
    private claimService: ClaimService,
    private employeeService: EmployeeService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.form = this.fb.group({
      hospitalName: ['', Validators.required],
      diagnosis: ['', Validators.required],
      billAmount: ['', [Validators.required, Validators.min(1)]],
      billNumber: ['', Validators.required],
      treatmentDate: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.employeeService.getMyProfile().subscribe(p => this.profile = p);
  }

  submit() {
    if (this.form.invalid || !this.profile) return;
    const val = this.form.value;
    const date = val.treatmentDate instanceof Date ? val.treatmentDate.toISOString().split('T')[0] : val.treatmentDate;
    this.claimService.fileClaim({
      employeeId: this.profile.id,
      policyId: this.profile.groupPolicy?.id,
      billAmount: val.billAmount,
      hospitalName: val.hospitalName,
      diagnosis: val.diagnosis,
      treatmentDate: date,
      billNumber: val.billNumber
    }).subscribe({
      next: () => {
        this.snackBar.open('Claim submitted successfully!', 'OK', { duration: 3000 });
        this.router.navigate(['/employee/my-claims']);
      },
      error: () => { this.snackBar.open('Failed to submit claim', 'OK', { duration: 3000 }); }
    });
  }
}

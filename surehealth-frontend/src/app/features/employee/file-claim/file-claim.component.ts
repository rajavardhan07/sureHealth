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

  selectedFile: File | null = null;

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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('File size exceeds 5MB limit', 'OK', { duration: 3000 });
        return;
      }
      this.selectedFile = file;
    }
  }

  submit() {
    if (this.form.invalid || !this.profile || !this.selectedFile) {
      if (!this.selectedFile) {
        this.snackBar.open('Please attach a medical report', 'OK', { duration: 3000 });
      }
      return;
    }

    const val = this.form.value;
    const date = val.treatmentDate instanceof Date ? val.treatmentDate.toISOString().split('T')[0] : val.treatmentDate;
    
    const formData = new FormData();
    formData.append('employeeId', this.profile.id.toString());
    formData.append('policyId', this.profile.groupPolicy?.id.toString() || '');
    formData.append('billAmount', val.billAmount.toString());
    formData.append('hospitalName', val.hospitalName);
    formData.append('diagnosis', val.diagnosis);
    formData.append('treatmentDate', date);
    formData.append('billNumber', val.billNumber);
    formData.append('file', this.selectedFile);

    this.claimService.fileClaim(formData).subscribe({
      next: () => {
        this.snackBar.open('Claim submitted successfully!', 'OK', { duration: 3000 });
        this.router.navigate(['/employee/my-claims']);
      },
      error: () => {} // Error handled by interceptor
    });
  }
}

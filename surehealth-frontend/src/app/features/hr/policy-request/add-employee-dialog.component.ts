import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmployeeService } from '../../../core/services/employee.service';

@Component({
  selector: 'app-add-employee-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatButtonModule, 
    MatIconModule, 
    MatDatepickerModule, 
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>Add New Employee</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-container">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>Full Name</mat-label>
            <input matInput formControlName="fullName">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Phone</mat-label>
            <input matInput formControlName="phone">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Age</mat-label>
            <input matInput type="number" formControlName="age">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Department</mat-label>
            <input matInput formControlName="department">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Designation</mat-label>
            <input matInput formControlName="designation">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Gender</mat-label>
            <mat-select formControlName="gender">
              <mat-option value="Male">Male</mat-option>
              <mat-option value="Female">Female</mat-option>
              <mat-option value="Other">Other</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Date of Join</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="joinDate">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>
        </div>
        
        <div class="file-upload">
          <label>Health Report (Optional)</label>
          <input type="file" (change)="onFileSelected($event)" accept=".pdf,.jpg,.jpeg,.png">
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid || loading" (click)="onSubmit()">
        @if (loading) {
          <mat-icon><mat-spinner diameter="18"></mat-spinner></mat-icon>
        } @else {
          Add Employee
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-container { padding: 10px 0; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
    .file-upload { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
    .file-upload label { font-size: 13px; color: var(--text-secondary); font-weight: 500; }
    mat-dialog-content { min-width: 500px; }
  `]
})
export class AddEmployeeDialogComponent {
  form: FormGroup;
  loading = false;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AddEmployeeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { corporateId: number }
  ) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(18), Validators.max(100)]],
      department: ['', Validators.required],
      gender: ['', Validators.required],
      designation: ['', Validators.required],
      joinDate: [new Date(), Validators.required]
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;

    const formData = new FormData();
    Object.keys(this.form.controls).forEach(key => {
      let value = this.form.get(key)?.value;
      if (key === 'joinDate' && value instanceof Date) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');
        value = `${year}-${month}-${day}`;
      }
      formData.append(key, value);
    });
    
    formData.append('corporateId', this.data.corporateId.toString());
    
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    this.employeeService.addEmployee(formData).subscribe({
      next: (creds) => {
        this.loading = false;
        this.snackBar.open('Employee added successfully!', 'OK', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to add employee', 'OK', { duration: 3000 });
      }
    });
  }
}

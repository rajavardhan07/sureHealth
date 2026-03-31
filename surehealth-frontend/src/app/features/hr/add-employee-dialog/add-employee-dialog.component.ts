import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeService } from '../../../core/services/employee.service';

@Component({
  selector: 'app-add-employee-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    MatIconModule
  ],
  templateUrl: './add-employee-dialog.component.html',
  styleUrl: './add-employee-dialog.component.css'
})
export class AddEmployeeDialogComponent {
  form: FormGroup;
  loading = false;
  selectedFile: File | null = null;
  todayDate: string;

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
      age: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
      department: ['', Validators.required],
      gender: ['', Validators.required],
      designation: ['', Validators.required],
      joinDate: [new Date(), Validators.required]
    });
    
    const today = new Date();
    this.todayDate = today.toISOString().split('T')[0];
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
        this.snackBar.open('Employee added successfully!', 'OK', { duration: 3000, panelClass: ['success-snackbar'] });
        this.dialogRef.close(true);
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to add employee', 'OK', { duration: 3000, panelClass: ['error-snackbar'] });
      }
    });
  }
}

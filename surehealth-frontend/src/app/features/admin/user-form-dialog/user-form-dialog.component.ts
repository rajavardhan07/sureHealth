import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule
  ],
  templateUrl: './user-form-dialog.component.html',
  styleUrl: './user-form-dialog.component.css'
})
export class UserFormDialogComponent {
  form: FormGroup;
  title: string;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { type: 'officer' | 'underwriter' }
  ) {
    this.title = data.type === 'officer' ? 'Add Claims Officer' : 'Add Underwriter';
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4)]],
      phoneNumber: ['', Validators.required],
      licenseNumber: ['', Validators.required],
      commissionPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}

import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-plan-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './plan-dialog.component.html',
  styleUrl: './plan-dialog.component.css'
})
export class PlanDialogComponent {
  planForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PlanDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.planForm = this.fb.group({
      planName: ['', Validators.required],
      description: ['', Validators.required],
      durationMonths: ['', [Validators.required, Validators.min(1)]],
      coverageAmount: ['', [Validators.required, Validators.min(1)]],
      premiumPerEmployee: ['', [Validators.required, Validators.min(1)]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.planForm.valid) {
      this.dialogRef.close(this.planForm.value);
    }
  }
}

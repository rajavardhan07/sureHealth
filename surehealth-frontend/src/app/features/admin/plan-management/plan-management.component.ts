import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormGroupDirective } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { PlanService } from '../../../core/services/plan.service';
import { InsurancePlan } from '../../../shared/models';

@Component({
  selector: 'app-plan-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSnackBarModule, MatProgressSpinnerModule, MatCardModule],
  templateUrl: './plan-management.component.html',
  styleUrl: './plan-management.component.css'})
export class PlanManagementComponent implements OnInit {
  @ViewChild(FormGroupDirective) formDirective!: FormGroupDirective;

  plans: InsurancePlan[] = [];
  loading = true;
  columns = ['planName', 'coverage', 'premium', 'status', 'actions'];
  planForm: FormGroup;

  constructor(private planService: PlanService, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.planForm = this.fb.group({
      planName: ['', Validators.required],
      description: ['', Validators.required],
      durationMonths: ['', [Validators.required, Validators.min(1)]],
      coverageAmount: ['', [Validators.required, Validators.min(1)]],
      premiumPerEmployee: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() { this.loadPlans(); }

  loadPlans() {
    this.loading = true;
    this.planService.getActivePlans().subscribe({
      next: (data) => { this.plans = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  createPlan() {
    if (this.planForm.invalid) return;
    this.planService.createPlan(this.planForm.value).subscribe({
      next: () => { 
        this.snackBar.open('Plan created successfully', 'OK', { duration: 3000 }); 
        if (this.formDirective) {
          this.formDirective.resetForm();
        } else {
          this.planForm.reset(); 
        }
        this.loadPlans(); 
      },
      error: () => { this.snackBar.open('Failed to create plan', 'OK', { duration: 3000 }); }
    });
  }

  deactivate(id: number) {
    this.planService.deactivatePlan(id).subscribe({
      next: () => { this.snackBar.open('Plan deactivated', 'OK', { duration: 3000 }); this.loadPlans(); }
    });
  }

  activate(id: number) {
    this.planService.activatePlan(id).subscribe({
      next: () => { this.snackBar.open('Plan activated', 'OK', { duration: 3000 }); this.loadPlans(); }
    });
  }
}

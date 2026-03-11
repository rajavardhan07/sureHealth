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
import { PlanDialogComponent } from './plan-dialog.component';

@Component({
  selector: 'app-plan-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSnackBarModule, MatProgressSpinnerModule, MatCardModule, MatDialogModule],
  templateUrl: './plan-management.component.html',
  styleUrl: './plan-management.component.css'})
export class PlanManagementComponent implements OnInit {
  plans: InsurancePlan[] = [];
  loading = true;
  columns = ['planName', 'coverage', 'premium', 'status', 'actions'];

  constructor(
    private planService: PlanService, 
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() { this.loadPlans(); }

  loadPlans() {
    this.loading = true;
    this.planService.getActivePlans().subscribe({
      next: (data) => { this.plans = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openCreatePlanDialog() {
    const dialogRef = this.dialog.open(PlanDialogComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createPlan(result);
      }
    });
  }

  private createPlan(planData: any) {
    this.planService.createPlan(planData).subscribe({
      next: () => { 
        this.snackBar.open('Plan created successfully', 'OK', { duration: 3000 }); 
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

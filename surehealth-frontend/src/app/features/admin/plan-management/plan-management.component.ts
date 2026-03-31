import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PlanService } from '../../../core/services/plan.service';
import { InsurancePlan } from '../../../shared/models';
import { PlanDialogComponent } from './plan-dialog.component';

@Component({
  selector: 'app-plan-management',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatSnackBarModule, MatDialogModule],
  templateUrl: './plan-management.component.html',
  styleUrl: './plan-management.component.css'})
export class PlanManagementComponent implements OnInit {
  plans = signal<InsurancePlan[]>([]);
  
  searchQuery = signal('');
  premiumFilter = signal('ALL');
  durationFilter = signal('ALL');

  filteredPlans = computed(() => {
    return this.plans().filter(p => {
      const matchSearch = p.planName.toLowerCase().includes(this.searchQuery().toLowerCase());
      
      let matchPremium = true;
      if (this.premiumFilter() === 'LOW') matchPremium = p.premiumPerEmployee < 1000;
      if (this.premiumFilter() === 'MED') matchPremium = p.premiumPerEmployee >= 1000 && p.premiumPerEmployee <= 5000;
      if (this.premiumFilter() === 'HIGH') matchPremium = p.premiumPerEmployee > 5000;

      let matchDuration = true;
      if (this.durationFilter() === 'SHORT') matchDuration = p.durationMonths < 12;
      if (this.durationFilter() === 'MED') matchDuration = p.durationMonths >= 12 && p.durationMonths <= 24;
      if (this.durationFilter() === 'LONG') matchDuration = p.durationMonths > 24;

      return matchSearch && matchPremium && matchDuration;
    });
  });
  loading = signal(true);
  columns = ['planName', 'coverage', 'premium', 'status', 'actions'];

  constructor(
    private planService: PlanService, 
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() { this.loadPlans(); }

  loadPlans() {
    this.loading.set(true);
    this.planService.getActivePlans().subscribe({
      next: (data) => { this.plans.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  openCreatePlanDialog() {
    const dialogRef = this.dialog.open(PlanDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createPlan(result);
      }
    });
  }

  openEditPlanDialog(plan: InsurancePlan) {
    const dialogRef = this.dialog.open(PlanDialogComponent, {
      width: '500px',
      disableClose: true,
      data: { plan }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updatePlan(plan.id, result);
      }
    });
  }

  private updatePlan(id: number, planData: any) {
    this.planService.updatePlan(id, planData).subscribe({
      next: () => { 
        this.snackBar.open('Plan updated successfully', 'OK', { duration: 3000 }); 
        this.loadPlans(); 
      },
      error: () => { this.snackBar.open('Failed to update plan', 'OK', { duration: 3000 }); }
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

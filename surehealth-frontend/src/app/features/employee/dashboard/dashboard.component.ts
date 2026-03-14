import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee.service';
import { ClaimService } from '../../../core/services/claim.service';
import { Employee, Claim } from '../../../shared/models';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'})
export class EmployeeDashboardComponent implements OnInit {
  profile = signal<Employee | null>(null);
  claims = signal<Claim[]>([]);
  loading = signal(true);

  constructor(private employeeService: EmployeeService, private claimService: ClaimService) {}

  ngOnInit() {
    this.employeeService.getMyProfile().subscribe(p => { this.profile.set(p); this.loading.set(false); });
    this.claimService.getMyClaims().subscribe(c => this.claims.set(c));
  }
}

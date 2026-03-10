import { Component, OnInit } from '@angular/core';
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
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'})
export class EmployeeDashboardComponent implements OnInit {
  profile: Employee | null = null;
  claims: Claim[] = [];
  loading = true;

  constructor(private employeeService: EmployeeService, private claimService: ClaimService) {}

  ngOnInit() {
    this.employeeService.getMyProfile().subscribe(p => { this.profile = p; this.loading = false; });
    this.claimService.getMyClaims().subscribe(c => this.claims = c);
  }
}

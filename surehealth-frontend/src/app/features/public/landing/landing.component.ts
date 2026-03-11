import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { PolicyService } from '../../../core/services/policy.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit {
  publicPlans: any[] = [];

  constructor(private policyService: PolicyService) {}

  ngOnInit(): void {
    this.policyService.getPublicPlans().subscribe({
      next: (plans) => {
        this.publicPlans = plans;
      },
      error: (err) => console.error('Failed to load public plans', err)
    });
  }
}

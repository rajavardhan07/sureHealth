import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-employee-layout',
  standalone: true,
  imports: [RouterModule, MatIconModule],
  templateUrl: './employee-layout.component.html',
  styleUrl: './employee-layout.component.css'})
export class EmployeeLayoutComponent {
  constructor(public authService: AuthService) {}
  getInitial(): string { return (this.authService.getUsername() || 'E').charAt(0).toUpperCase(); }
  logout(): void { this.authService.logout(); }
}

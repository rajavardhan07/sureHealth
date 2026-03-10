import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-hr-layout',
  standalone: true,
  imports: [RouterModule, MatIconModule],
  templateUrl: './hr-layout.component.html',
  styleUrl: './hr-layout.component.css'})
export class HrLayoutComponent {
  constructor(public authService: AuthService) {}
  getInitial(): string { return (this.authService.getUsername() || 'H').charAt(0).toUpperCase(); }
  logout(): void { this.authService.logout(); }
}

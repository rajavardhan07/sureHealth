import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-claims-officer-layout',
  standalone: true,
  imports: [RouterModule, MatIconModule],
  templateUrl: './claims-officer-layout.component.html',
  styleUrl: './claims-officer-layout.component.css'})
export class ClaimsOfficerLayoutComponent {
  constructor(public authService: AuthService) {}
  getInitial(): string { return (this.authService.getUsername() || 'C').charAt(0).toUpperCase(); }
  logout(): void { this.authService.logout(); }
}

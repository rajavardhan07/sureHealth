import { Component } from '@angular/core';

import { RouterModule, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule
],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'})
export class AdminLayoutComponent {
  constructor(public authService: AuthService, private router: Router) {}

  getInitial(): string {
    return (this.authService.getUsername() || 'A').charAt(0).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}

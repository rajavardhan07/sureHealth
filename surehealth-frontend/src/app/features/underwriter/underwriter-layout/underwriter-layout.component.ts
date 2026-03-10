import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-underwriter-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  template: `
    <div class="dashboard-layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="#2B74E2"/>
              <path d="M14 34V14h6v8h8v-8h6v20h-6v-8h-8v8h-6z" fill="white"/>
            </svg>
            <div>
              <span class="brand">SureHealth</span>
              <span class="role-badge">Underwriter</span>
            </div>
          </div>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/underwriter/dashboard" routerLinkActive="active" class="nav-item">
            <mat-icon>dashboard</mat-icon><span>Review Queue</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <button class="nav-item logout" (click)="logout()">
            <mat-icon>logout</mat-icon><span>Log Out</span>
          </button>
        </div>
      </aside>

      <main class="main-content">
        <header class="top-bar">
          <div class="page-info">
            <h2>Underwriter Portal</h2>
          </div>
          <div class="user-info">
            <div class="user-avatar">{{ getInitial() }}</div>
            <span class="user-name">{{ authService.getUsername() }}</span>
          </div>
        </header>

        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-layout { display: flex; height: 100vh; background: #f8fafc; }
    .sidebar { width: 280px; background: #1e293b; color: white; display: flex; flex-direction: column; }
    .sidebar-header { padding: 32px 24px; }
    .logo { display: flex; align-items: center; gap: 12px; }
    .brand { display: block; font-size: 20px; font-weight: 700; color: white; letter-spacing: -0.5px; }
    .role-badge { display: block; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
    
    .sidebar-nav { flex: 1; padding: 0 16px; }
    .nav-item { 
      display: flex; align-items: center; gap: 12px; padding: 12px 16px; 
      color: #94a3b8; text-decoration: none; border-radius: 12px; margin-bottom: 4px; 
      transition: all 0.2s; border: none; background: none; width: 100%; text-align: left; cursor: pointer;
    }
    .nav-item:hover { background: rgba(255,255,255,0.05); color: white; }
    .nav-item.active { background: #2B74E2; color: white; box-shadow: 0 4px 12px rgba(43, 116, 226, 0.3); }
    .logout { margin-top: auto; color: #f87171; }
    .sidebar-footer { padding: 24px 16px; border-top: 1px solid rgba(255,255,255,0.1); }

    .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .top-bar { height: 80px; background: white; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; padding: 0 40px; }
    .page-info h2 { font-size: 20px; font-weight: 600; margin: 0; color: #1e293b; }
    .user-info { display: flex; align-items: center; gap: 12px; }
    .user-avatar { width: 40px; height: 40px; border-radius: 12px; background: #e2e8f0; color: #64748b; display: flex; align-items: center; justify-content: center; font-weight: 600; }
    .user-name { font-size: 14px; font-weight: 500; color: #64748b; }
    .content-area { flex: 1; overflow-y: auto; }
  `]
})
export class UnderwriterLayoutComponent {
  constructor(public authService: AuthService) {}
  getInitial() { return (this.authService.getUsername() || 'U').charAt(0).toUpperCase(); }
  logout() { this.authService.logout(); }
}

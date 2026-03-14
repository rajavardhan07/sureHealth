import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-underwriter-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './underwriter-layout.component.html',
  styleUrl: './underwriter-layout.component.css'
})
export class UnderwriterLayoutComponent {
  constructor(public authService: AuthService) {}
  
  getInitial() { 
    return (this.authService.getUsername() || 'U').charAt(0).toUpperCase(); 
  }
  
  logout() { 
    this.authService.logout(); 
  }
}

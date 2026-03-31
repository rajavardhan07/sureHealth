import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-dropdown.component.html',
  styleUrl: './notification-dropdown.component.css'
})
export class NotificationDropdownComponent implements OnInit {
  notificationService = inject(NotificationService);
  private router = inject(Router);

  isOpen = false;

  ngOnInit() {
    this.notificationService.fetchUnreadNotifications().subscribe();
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.notificationService.fetchUnreadNotifications().subscribe();
    }
  }

  markAsRead(event: Event, id: number) {
    event.stopPropagation();
    this.notificationService.markAsRead(id).subscribe();
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe();
  }

  handleNotificationClick(notification: any) {
    this.notificationService.markAsRead(notification.id).subscribe();
    this.isOpen = false;
    
    // Logic for navigation based on notification content could be added here
    // For now just mark as read
  }
}

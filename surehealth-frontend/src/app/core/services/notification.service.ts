import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Notification } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:8080/api/notifications';
  
  // Use Signals for state management
  notifications = signal<Notification[]>([]);
  unreadCount = signal<number>(0);

  constructor(private http: HttpClient) { }

  fetchUnreadNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl).pipe(
      tap(notifs => {
        this.notifications.set(notifs);
        this.unreadCount.set(notifs.length);
      })
    );
  }

  fetchUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/unread-count`).pipe(
      tap(count => this.unreadCount.set(count))
    );
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => {
        // Update local state: remove the notification that was marked as read
        const currentNotifs = this.notifications().filter(n => n.id !== id);
        this.notifications.set(currentNotifs);
        this.unreadCount.set(currentNotifs.length);
      })
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        this.notifications.set([]);
        this.unreadCount.set(0);
      })
    );
  }
}

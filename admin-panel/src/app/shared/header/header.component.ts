import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  authService = inject(AuthService);
  showUserMenu = false;
  showNotifications = false;

  notifications = [
    { id: 1, message: '5 new students enrolled today', time: '2m ago', type: 'success', read: false },
    { id: 2, message: 'New video upload request from Mr. Sharma', time: '15m ago', type: 'info', read: false },
    { id: 3, message: 'Quiz results are ready for Class 10', time: '1h ago', type: 'warning', read: true },
    { id: 4, message: 'System maintenance at 11 PM tonight', time: '3h ago', type: 'danger', read: true }
  ];

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  onToggle(): void {
    this.toggleSidebar.emit();
  }

  logout(): void {
    this.authService.logout();
  }
}
